# Eslami Global Trading — Cyber Hardening, Audit & Compliance Manual
### بازرگانی اسلامی - سند امنیت سایبری و استانداردهای حفاظتی سامانه

This document explains the multi-layer security protections, cryptographic configurations, and defensive parameters implemented inside the **Eslami Global Trading // بازرگانی اسلامی** full-stack system.

---

## 🔒 Security Protection Matrix

Our system features a 5-layer security stack designed to survive automatic bot attacks, brute-force attempts, and injection vulnerabilities:

```
    [ External Web Requests ]
               │
      [ LAYER 1: UFW Firewall ] ────► Drops all ports except 22, 80, 443
               │
     [ LAYER 2: Fail2ban IDS ]  ────► Blocks scanning IPs for 1 hour
               │
    [ LAYER 3: Nginx Rate Limit ] ──► Restricts request frequency to 10 reqs/sec
               │
    [ LAYER 4: State CSRF Header ] ──► Validates cryptographic 'X-CSRF-Token'
               │
   [ LAYER 5: Logic Guardrails ] ───► Size limit (2.5MB), Spam Filter & Hash verify
```

---

## 🛡️ Layer-by-Layer Security Configurations

### 1. Inbound Network Security (UFW)
Operating-level access is protected by **Uncomplicated Firewall (UFW)**. Only essential ports are open, dropping all other direct scanner requests. This configuration is deployed during the `install.sh` sequence.
- **Port 22:** Restricted SSH Management.
- **Port 80/443:** HTTP/HTTPS Web Entrypoints (mapped to Nginx).
- **Port 3000:** Express Server proxy (bound only to localhost to block direct database queries from the public).

---

### 2. Brute-Force Protection (Fail2ban)
The system blocks malicious scanning traffic using **Fail2ban**. It monitors Nginx logs for repeating unauthorized requests and blocks offending IPs at the firewall level.

A custom jail is created in `/etc/fail2ban/jail.local`:
```ini
[nginx-http-auth]
enabled = true
port    = http,https
logpath = %(nginx_error_log)s

[sshd]
enabled = true
port    = ssh
maxretry = 3
findtime = 600
bantime = 3600
```
*If an IP fails SSH authentication 3 times within 10 minutes, it is blocked from accessing the server for 1 hour.*

---

### 3. Rate Limiting (Web Server & Application)
To prevent Denial of Service (DoS) attacks and crawler abuse:
- **Nginx Protection:** Defines a shared-memory rate-limiting zone that limits request speeds to 10 requests per second (`10r/s`), with a burst allowance of 15.
- **Backend Application Protection:** Features an internal sliding-window rate limit module in the Express server. It limits standard browser requests to 60 per minute per IP. Mutative paths like `/api/chat` and `/api/rfq` are limited to 15 per minute.

---

### 4. Cross-Site Request Forgery (CSRF) Actions Protection
Every non-GET request (such as RFQ submission, editor publishing, and admin login attempts) is protected with a stateful check.
- The React client extracts a randomized security token key from state headers.
- It attaches this variable under the custom header: `X-CSRF-Token`.
- The Express server (`server.ts`) inspects and validates the token. If the header is missing or incorrect, it drops the connection, audits the event, and returns a `403 Forbidden` response.

---

### 5. Secure Admin Authentication (PBKDF2 Hashing)
Administrative passwords are encrypted using **PBKDF2 (Password-Based Key Derivation Function 2)** with a unique, randomized 12-character salt and 1,000 hash iterations. The output is processed through the standard SHA-512 cryptographic model. 

```typescript
// From server.ts/db.ts validation sequence
const computedHash = crypto.pbkdf2Sync(password_attempt, admin.salt, 1000, 64, "sha512").toString("hex");
```
*Plain-text passwords are never stored in the file system, protecting the system against database leak exploits.*

### Admin Password Rotation Guide:
1. Access the cockpit dashboard at `/admin`.
2. Scroll to the **Credentials Optimization and Security Rotate** panel.
3. Enter your new complex passphrase (must contain uppercase, numbers, and symbols).
4. Save adjustments. The database updates the salt, recalculates the PBKDF2 hash, invalidates all existing active browser cookie sessions, and prompts users to log in again.

---

### 6. Strict File Upload Scans
Importers uploading technical files or specifications during the RFQ creation process must pass strict validation checks:
- **Maximum File Size:** Strictly limited to `2.5 MB`.
- **Mime Filtering:** The server validates the file extension and MIME type. Only secure file structures (such as `application/pdf`, `.docx`, `.xlsx`, and standard image formats like `.jpg`, `.png`) are permitted.
- **Data Obfuscation:** Retains database indexes in `/src/db.json` but masks sensitive user attributes and contact coordinates behind authorized sessions.

---

### 7. Private Gemini API Key Protection
To keep your private **GEMINI_API_KEY** secure:
- **Server Isolation:** The client never requests the Gemini API directly. 
- **API Proxy Routing:** The React app sends chatbot questions to the backend Express route at `/api/chat`. The server attaches the API key from `.env` and forwards the request to Google's servers.
- **Public JS Bundle Protection:** Your Gemini key is never bundled in public JavaScript assets, preventing unauthorized use or unexpected billing.

---
<p align="center">
  <b>Designed with absolute integrity. Eslami Global Trading Corporation © 2026.</b>
</p>
