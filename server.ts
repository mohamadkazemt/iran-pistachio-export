import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { dbInstance } from "./src/db.js";
import { RFQ, Product, Blog } from "./src/types.js";

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please declare it in Settings > Secrets to enable our premium Trade Advisory Agent.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

const SECURE_CSRF_TOKEN = "auras_export_csrf_token_ae104390adfe9";

const app = express();
const PORT = 3000;

// Increase limit to securely parse base64 documents/images limit of 10MB
app.use(express.json({ limit: "10mb" }));

// Dynamic In-Memory Rate Limiting Tracker
const ipRequestCounts = new Map<string, { count: number; lastReset: number }>();
const ipBlocklist = new Map<string, number>();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
    return ips[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

// Rate limit middleware: 60 requests per minute per IP. Critical for anti-abuse & server stability
const rateLimiterMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const ip = getClientIp(req);
  const now = Date.now();

  // Check if IP is under penalty block (3-minute lock for repeated abuse)
  const blockUntil = ipBlocklist.get(ip);
  if (blockUntil && now < blockUntil) {
    res.status(423).json({
      error: "Temporary Lockout",
      message: "This IP address has been temporarily blocked due to repeated rate violations. Try again in 3 minutes."
    });
    return;
  }

  const limitData = ipRequestCounts.get(ip);
  const windowTimeMs = 60000; // 1 minute

  if (!limitData || (now - limitData.lastReset) > windowTimeMs) {
    ipRequestCounts.set(ip, { count: 1, lastReset: now });
    next();
  } else {
    limitData.count++;
    if (limitData.count > 60) {
      dbInstance.logSystemEvent(
        "RATE_LIMIT_EXCEEDED",
        "WARNING",
        ip,
        `IP triggered safety rate limits. Total requests this minute: ${limitData.count}`
      );

      // Block IP for 3 minutes if it excessively exceeds limits (e.g. > 90 requests)
      if (limitData.count > 95) {
        ipBlocklist.set(ip, now + 180000);
        dbInstance.logSystemEvent("IP_SAFETY_BLOCKOUT", "ALERT", ip, `IP address quarantined due to persistent API polling`);
      }

      res.status(429).json({
        error: "Too Many Requests",
        message: "You have exceeded the rate limit of 60 requests per minute. Please throttle your exports system inquiries."
      });
      return;
    }
    next();
  }
};

// CSRF checking middleware for mutating endpoints
const csrfValidationMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (["POST", "DELETE", "PUT", "PATCH"].includes(req.method)) {
    const clientToken = req.headers["x-csrf-token"];
    if (!clientToken || clientToken !== SECURE_CSRF_TOKEN) {
      const ip = getClientIp(req);
      dbInstance.logSystemEvent(
        "CSRF_VALIDATION_FAILED",
        "SECURITY",
        ip,
        `Potential CSRF attempt blocked. Method: ${req.method}, Path: ${req.path}`
      );
      res.status(403).json({
        error: "Forbidden",
        message: "Invalid or missing CSRF token validation header. Operation terminated for system integrity."
      });
      return;
    }
  }
  next();
};

// Spam Protection Filter System
function checkPotentialSpam(r: Partial<RFQ>): number {
  let score = 0;
  const content = `${r.clientName || ""} ${r.company || ""} ${r.comment || ""}`.toLowerCase();

  // Link insertions inside short forms is a strong indicator of spam bots
  const urls = content.match(/https?:\/\/[^\s]+/g);
  if (urls && urls.length > 0) score += 2;
  if (/href|href\s*=|<a\s+|<script|\[url\]/i.test(content)) score += 3;

  // Typical advertisement and medical fraud keywords
  const triggerWords = [
    "viagra", "casino", "pills", "crypto", "forex", "wealth", "earn money", 
    "lottery", "jackpot", "unlocked profit", "invest bitcoin", "cialis"
  ];
  for (const word of triggerWords) {
    if (content.includes(word)) {
      score += 2;
    }
  }

  // Highly repetitive characters
  if (/(.)\1{9,}/.test(content)) score += 2;

  return score;
}

// Applying core global middlewares
app.use(rateLimiterMiddleware);
app.use(csrfValidationMiddleware);

// --- Public Endpoints ---

// Expose CSRF token
app.get("/api/csrf", (req, res) => {
  res.json({ csrfToken: SECURE_CSRF_TOKEN });
});

// Products catalog API
app.get("/api/products", (req, res) => {
  res.json(dbInstance.getProducts());
});

// Settings API
app.get("/api/settings", (req, res) => {
  res.json(dbInstance.getSettings());
});

// Update Settings API
app.post("/api/admin/settings", (req, res) => {
  const ip = getClientIp(req);
  try {
    const updated = dbInstance.updateSettings(req.body, ip);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update global settings" });
  }
});

// Blogs API
app.get("/api/blogs", (req, res) => {
  res.json(dbInstance.getBlogs());
});

// Submit RFQ Lead intake with spam protection & image/document validation
app.post("/api/rfq", (req, res) => {
  const ip = getClientIp(req);
  const { clientName, email, company, country, productInterestId, quantityNeeded, preferredIncoterm, comment, docUrl } = req.body;

  if (!clientName || !email || !productInterestId || !quantityNeeded) {
    res.status(400).json({ error: "Missing Required Fields", message: "Complete all key fields to submit quotation checklist." });
    return;
  }

  // Spam score check
  const spamScore = checkPotentialSpam({ clientName, company, comment });

  // Document/Image file upload checks & validation
  if (docUrl) {
    // Basic compliance scan of base64 document payloads
    const sizeKB = (docUrl.length * 3) / 4 / 1024;
    if (sizeKB > 2500) {
      dbInstance.logSystemEvent("IMAGE_VALIDATION_FAILED", "WARNING", ip, `Rejected client document size: ${(sizeKB / 1024).toFixed(2)}MB exceeds limit of 2.5MB`);
      res.status(413).json({ error: "Payload Too Large", message: "Supplied attachment exceeds safe weight limit of 2.5MB." });
      return;
    }
    // MIME type structure validation (accept and check image and standard transport pdf)
    const isMimeValid = docUrl.startsWith("data:image/") || docUrl.startsWith("data:application/pdf");
    if (!isMimeValid) {
      dbInstance.logSystemEvent("DOCUMENT_VALIDATION_FAILED", "SECURITY", ip, `Rejected unusual attachment signature`);
      res.status(415).json({ error: "Unsupported Media", message: "Only PNG, JPEG, WEBP images or PDF files are accepted under compliance protocols." });
      return;
    }
  }

  const addedRfq = dbInstance.addRFQ({
    clientName,
    email,
    company: company || "Independent Enterprise",
    country,
    productInterestId,
    quantityNeeded,
    preferredIncoterm: preferredIncoterm || "FOB",
    comment: comment || "",
    spamScore,
    docUrl,
  }, ip);

  res.status(201).json({
    success: true,
    rfq: addedRfq,
    needsVerification: spamScore >= 3,
    statusMessage: spamScore >= 3 
      ? "Quotation ingested with cautionary parameters. AuraLux Compliance Team will evaluate safety signatures." 
      : "Lead inquiry securely stored. A senior representative will contact you with an official pro-forma quote shortly."
  });
});

// Smart AI Multilingual Trade Advisor Endpoint
app.post("/api/gemini/advisor", async (req, res) => {
  const ip = getClientIp(req);
  const { prompt, history } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Inquiry string is required." });
    return;
  }

  try {
    const ai = getGeminiClient();

    // Prepare custom business constraints context
    const productsContext = dbInstance.getProducts().map(p => {
      return `[Product SKU: ${p.id}] - ${p.name}. HS Code: ${p.hsCode}. Pure Origin: ${p.origin}. Packaging: ${p.packaging}. Min Order Limit: ${p.minOrder}. Current delivery times: ${p.leadTime}. Pure Grade Specifications: ${p.purityGrade}.`;
    }).join("\n");

    const systemInstruction = `
      You are the Elite Global Trade Advisor for AuraLux Global, a premium international exporter of luxury agricultural commodities, dry tree nuts, and advanced food logistics.
      
      Our high-end catalog contains:
      ${productsContext}
      
      Current logistics protocols:
      - Premium Pistachios and whole tree nuts are vacuum-sealed inside thick polymer bags and pre-flushed with food-grade nitrogen (oxygen transmission level near zero) to preserve delicate seed fatty acids and prevent physical deterioration.
      - Bulk consignments are shipped in ISO humidity-controlled temperature containers via maritime container freight, monitored via automated IoT sensors.
      - We facilitate clean hazard-free trade under Incoterms 2020: FOB, CIF, EXW, DDP, CFR.
      
      Core Guidelines:
      1. Speak in an objective, elegant, and highly professional tone suited for foreign logistics directors, gourmet purchasers, and procurement agents.
      2. Support multilingual trade: Respond elegantly in the exact language the user initiates (e.g., Arabic, Spanish, German, Mandarin, French, etc.), but use correct trade/customs vocabulary.
      3. For any inquiry regarding tariffs, customs clearance, HS codes, or container packing lists, supply precise, structured, and informative details using markdown tables or bulleted points.
      4. Avoid stating any self-aggrandizing AI jargon. Maintain professional gravity. Do not mention that you are a model or built by Google. You are AuraLux's chief commercial intelligence engine.
      5. Under no circumstances should you hallucinate speculative pricing or non-vetted products. Stick rigidly to current export items. If asked about unsupported categories, graciously explain our core focus on Pistachios, tree nuts, and premium dried agricultural exports, and offer custom sourcing consultancy.
    `;

    // Format chat conversation history for the SDK
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3, // Keep response structured and strictly tied to business facts
      }
    });

    const outputText = aiResponse.text || "Our advisor is reviewing compliance sheets. Please repeat your query.";
    
    // Log successful advisor request for trade analysis
    dbInstance.logSystemEvent("ADVISOR_INQUIRY_SUCCESS", "INFO", ip, `Processed advisory session on: "${prompt.slice(0, 40)}..."`);
    
    res.json({ answer: outputText });
  } catch (err: any) {
    dbInstance.logSystemEvent("ADVISOR_FAILED_CALL", "ALERT", ip, `Trade Advisor failed with: ${err.message}`);
    
    // Fallback response with detailed self-help if secrets are missing
    res.status(200).json({ 
      answer: `### Technical Notice - Offline Advisor\nOur specialized AI Trade consultant is currently on stand-by.\n\n**Integration Guide for Developers:**\nEnsure the \`GEMINI_API_KEY\` is securely defined inside the **Settings > Secrets** panel in the Google AI Studio build dashboard. Once verified and restarted, the automated multi-lingual consultant will become live immediately.`,
      isFallback: true
    });
  }
});


// --- Secure Authenticated Administration Endpoints (Protected with Custom CSRF + Security Audit Records) ---

// Active in-memory session registry with sliding expiration support
const ACTIVE_SESSIONS = new Map<string, { username: string; role: string; email: string; expires: number }>();

// Session verification middleware with HttpOnly cookie extraction and key-header fallbacks
const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  let token = "";
  
  // 1. Try Cookie-based extraction (Standard)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const sessionCookie = cookieHeader.split(";").find(c => c.trim().startsWith("admin_session="));
    if (sessionCookie) {
      token = sessionCookie.split("=")[1];
    }
  }

  // 2. Try Authorization Bearer header fallback (Safe for sandboxes/iframes blocking third-party cookies)
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // 3. Try custom header fallback
  if (!token) {
    const customHeader = req.headers["x-admin-token"];
    if (customHeader && typeof customHeader === "string") {
      token = customHeader;
    }
  }

  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Administrative credentials required for resource extraction." });
    return;
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session) {
    res.status(401).json({ error: "Session Expired", message: "Your active session lookup has expired or is invalid." });
    return;
  }

  if (Date.now() > session.expires) {
    ACTIVE_SESSIONS.delete(token);
    res.status(401).json({ error: "Session Expired", message: "Your session duration limit has been exceeded. Please log back in." });
    return;
  }

  // Session is valid. If it expires in less than 30 minutes, bump sliding window
  if (session.expires - Date.now() < 1800000) {
    session.expires = Date.now() + 2 * 3600 * 1000;
  }

  (req as any).admin = session;
  next();
};

// Secure Login Pipeline validating hashes from the Local Database
app.post("/api/admin/login", (req, res) => {
  const ip = getClientIp(req);
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Bad Request", message: "A valid username and password pair must be declared." });
    return;
  }

  // Query database hashes
  const validatedProfile = dbInstance.verifyAdminCredentials(username, password);

  if (validatedProfile) {
    dbInstance.logSystemEvent("ADMIN_LOGIN_SUCCESS", "SECURITY", ip, `Administrative operator [${validatedProfile.username}] authenticated with role [${validatedProfile.role}]`);

    // Generate cryptographic high-entropy session token
    const token = crypto.randomBytes(32).toString("hex");
    const maxAgeMs = rememberMe === true ? 30 * 24 * 3600 * 1000 : 2 * 3600 * 1000;
    const expiryTime = Date.now() + maxAgeMs;

    // Cache active session
    ACTIVE_SESSIONS.set(token, {
      username: validatedProfile.username,
      role: validatedProfile.role,
      email: validatedProfile.email,
      expires: expiryTime
    });

    // Write HttpOnly secure cookie structure
    res.setHeader("Set-Cookie", `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeMs / 1000}`);
    
    // Return both token (for localStorage headers fallback) and operator details
    res.json({
      success: true,
      token,
      adminProfile: {
        username: validatedProfile.username,
        email: validatedProfile.email,
        role: validatedProfile.role,
        lastLogin: validatedProfile.lastLogin
      }
    });
  } else {
    dbInstance.logSystemEvent("ADMIN_LOGIN_FAIL", "ALERT", ip, `Failed administrative access attempt. Username entered: ${username}`);
    res.status(401).json({ error: "Access Denied", message: "Invalid credentials recorded under compliance logging shields." });
  }
});

// Logout endpoint purging cookie and active session entries
app.post("/api/admin/logout", (req, res) => {
  let token = "";
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const sessionCookie = cookieHeader.split(";").find(c => c.trim().startsWith("admin_session="));
    if (sessionCookie) token = sessionCookie.split("=")[1];
  }
  if (!token) token = (req.headers["x-admin-token"] || "") as string;

  if (token) {
    ACTIVE_SESSIONS.delete(token);
  }

  res.setHeader("Set-Cookie", "admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  res.json({ success: true, message: "Session securely terminated from core active registers." });
});

// Current administrator session validator
app.get("/api/admin/me", adminAuthMiddleware, (req, res) => {
  res.json({ loggedIn: true, admin: (req as any).admin });
});

// Update operator password securely
app.post("/api/admin/password", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { newPassword } = req.body;
  const admin = (req as any).admin;

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Invalid Password", message: "Passwords must be at least 8 characters in length including security layers." });
    return;
  }

  const updatedPassword = dbInstance.changeAdminPassword(admin.username, newPassword, ip);
  if (updatedPassword) {
    // Audit log force clear all other sessions matching this user for safety
    for (const [key, value] of ACTIVE_SESSIONS.entries()) {
      if (value.username.toLowerCase() === admin.username.toLowerCase()) {
        ACTIVE_SESSIONS.delete(key);
      }
    }
    res.json({ success: true, message: "Credentials rotated successfully. Please login again with your new credentials." });
  } else {
    res.status(500).json({ error: "Database Error", message: "An unexpected error occurred while writing credentials to disk." });
  }
});

// Retrieve dynamic lead intake logs
app.get("/api/admin/rfqs", adminAuthMiddleware, (req, res) => {
  res.json(dbInstance.getRFQs());
});

// Alter Lead/RFQ Status
app.post("/api/admin/rfq/status", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { id, status } = req.body;
  if (!id || !status) {
    res.status(400).json({ error: "Bad Request", message: "Invalid lead identifier or target status." });
    return;
  }
  const statusAltered = dbInstance.updateRFQStatus(id, status, ip);
  if (statusAltered) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not Found", message: "Quotation registry target index mismatch." });
  }
});

// Access Security Audit Logs
app.get("/api/admin/logs", adminAuthMiddleware, (req, res) => {
  res.json(dbInstance.getLogs());
});

// System Backup list
app.get("/api/admin/backups", adminAuthMiddleware, (req, res) => {
  res.json(dbInstance.getBackupsList());
});

// Create Backup archive
app.post("/api/admin/backups/create", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  try {
    const backupName = dbInstance.createBackup(ip);
    res.json({ success: true, backupName });
  } catch (err: any) {
    res.status(500).json({ error: "Backup creation failed", message: err.message });
  }
});

// Restore database rollback point
app.post("/api/admin/backups/restore", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { fileName } = req.body;
  if (!fileName) {
    res.status(400).json({ error: "Missing Target Backup Mappings" });
    return;
  }
  const restored = dbInstance.restoreBackup(fileName, ip);
  if (restored) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Backup restoration failed" });
  }
});

// Save new Product (Admin workflow)
app.post("/api/products/add", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const productData = req.body;
  try {
    const newProduct = dbInstance.addProduct(productData, ip);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to persist product profile" });
  }
});

// Delete Product
app.delete("/api/products/:id", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;
  const deleted = dbInstance.deleteProduct(id, ip);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Resource not found" });
  }
});

// Save Blog Post (Admin workflow)
app.post("/api/blogs/add", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const blogData = req.body;
  try {
    const newBlog = dbInstance.addBlog(blogData, ip);
    res.status(201).json({ success: true, blog: newBlog });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to post news content" });
  }
});

// Delete Blog
app.delete("/api/blogs/:id", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;
  const deleted = dbInstance.deleteBlog(id, ip);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Resource not found" });
  }
});

// Retrieve visitor traffic points
app.get("/api/admin/analytics", adminAuthMiddleware, (req, res) => {
  res.json(dbInstance.getVisitorAnalytics());
});

// Retrieve files
app.get("/api/admin/media", adminAuthMiddleware, (req, res) => {
  res.json(dbInstance.getMediaItems());
});

// Store file
app.post("/api/admin/media/add", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  try {
    const addedMedia = dbInstance.addMediaItem(req.body, ip);
    res.json({ success: true, item: addedMedia });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to upload file assets", message: err.message });
  }
});

// Purge file
app.delete("/api/admin/media/:id", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  const { id } = req.params;
  const deleted = dbInstance.deleteMediaItem(id, ip);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Resource not found" });
  }
});

// Save active SEO fields
app.post("/api/admin/seo", adminAuthMiddleware, (req, res) => {
  const ip = getClientIp(req);
  try {
    const updatedSEO = dbInstance.updateSEO(req.body, ip);
    res.json({ success: true, seo: updatedSEO });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to commit SEO records" });
  }
});


// --- Serve Static Assets and SPA Fallbacks ---

async function startServer() {
  // Integrate Vite dev server middleware in non-production mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraLux Server] System active, listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
