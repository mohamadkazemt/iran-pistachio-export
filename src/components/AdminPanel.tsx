import { useState, useEffect, FormEvent } from "react";
import { RFQ, SystemLog, BackupInfo, Product, Blog, SiteSettings, VisitorAnalytics, MediaItem, SEOSettings } from "../types.js";
import AuraMediaLibrary from "./AuraMediaLibrary";
import AuraPublishingDesk from "./AuraPublishingDesk";
import { 
  ShieldCheck, Terminal, Award, FileSpreadsheet, Lock, AlertTriangle, 
  RefreshCcw, Database, Play, CheckCircle2, ChevronRight, Eye, Trash2, Calendar,
  Sliders, Globe, Image as ImageIcon, Video, HelpCircle, Save, Plus, BarChart3,
  Key, Upload, Copy, Check, Search, Globe2, Laptop, Smartphone, LineChart
} from "lucide-react";

interface AdminPanelProps {
  lang: string;
  settings: SiteSettings | null;
  onSettingsUpdated: () => void;
}

const faTranslations: Record<string, string> = {
  // Login Page
  "Nazari Export Intranet": "اینترانت مدیریت صادرات شرکت نظری",
  "Global Shipping Control Panel": "کنسول جامع تجارت بین‌المللی و مدیریت محموله‌ها",
  "Operator Username": "نام کاربری اپراتور",
  "Cryptographic Keypass Phrase": "گذرواژه امنیتی رمزنگاری‌شده",
  "Remember this station for 30 days": "مرا به مدت ۳۰ روز در این دستگاه به خاطر بسپار",
  "Validate Credentials": "اعتبارسنجی و ورود به سامانه",
  "Vetted Demonstration Admin Coordinates": "اطلاعات ورود دمو مورد تایید سیستم جهت تست",
  "Invalid operator login phrase.": "نام کاربری یا گذرواژه اپراتور نامعتبر است.",
  "Authentication credentials failed verification check.": "خطا در بررسی اعتبارسنجی؛ مشخصات به درستی تایید نشد.",

  // Dashboard Header
  "Operator Console Live": "کنسول فعال اپراتور آنلاین",
  "NAZARI CARGO SHIPMENT SYSTEM": "سامانه جامع پورتال و ممیزی بازرگانی نظری",
  "Inbound RFQ Leads": "کل استعلام‌های دریافتی",
  "Needs Verification": "نیاز به بررسی و ممیزی",
  "Bulk Tonnage Quoted": "مجموع تناژ صادر شده",
  "Close Session": "خروج امن از سیستم",
  "Workspace Controls": "بخش‌های مدیریتی کنسول",

  // Tabs
  "Inbound Leads (RFQs)": "لیست سرنخ‌های دریافتی (RFQs)",
  "Traffic Analytics": "تحلیل ترافیک و روندهای ورودی",
  "Assets Gallery": "گالری منابع و رسانه‌ها",
  "Catalog Editor": "ویرایشگر کاتالوگ و سکو",
  "Portal Visual Theme": "تنظیمات پوسته و وب‌سایت (CMS)",
  "Failsafes & Keys": "پشتیبان‌گیری و امنیت شبکه",

  // RFQ Tab
  "No inquiries found in active database registries.": "هیچ استعلام قیمتی در پایگاه داده فعال یافت نشد.",
  "Destination": "کشور مقصد",
  "Required Quantity": "حجم تقاضا (تناژ)",
  "Incoterms Agreement": "شرایط ممیزی اینکوترمز",
  "Registry Point": "ایمیل ثبت شده",
  "Special Instructions": "دستورالعمل‌های ویژه لجستیک خریدار",
  "View Uploaded Compliance Attachment": "مشاهده برگه استاندارد و سند ترخیص ضمیمه",
  "POTENTIAL MALICIOUS EMAIL PATTERN // SPAM SCORE: ": "الگوی ایمیل احتمالاً مخرب یا فیشینگ // امتیاز هرزنامه: ",
  "Status Transitions": "تغییر وضعیت سرنخ",
  "✓ Mark Reviewed": "✓ علامت‌گذاری به عنوان بررسی شده",
  "✓ Issue Price Quote": "✓ صدور پیش‌فاکتور رسمی قیمت",
  "× Set Private Archive": "× انتقال به بایگانی ممیزی شده",

  // Analytics Tab
  "Portal Traffic Log Metrics": "آمارهای ترافیک و ورود مشتریان بین‌المللی",
  "Interactive telemetry mapping for the preceding 7 trading days": "نقشه‌برداری تعاملی تلوتری برای ۷ روز معاملاتی گذشته",
  "Uniques": "بازدیدکننده‌های یکتا",
  "Hits": "کل صفحات لود شده",
  "Consolidated Averages": "میانگین شاخص‌های تجمیعی",
  "Avg Session": "میانگین زمان جلسه",
  "Bounce Ratio": "نرخ پرش کلی",
  "DESKTOP SHARE": "سهم دسکتاپ کاربران",
  "MOBILE APP": "سهم دستگاه‌های موبایل",
  "Global Procurement Request Demographics": "توزیع جغرافیایی درخواست‌های تامین بین‌المللی",
  "Top regions emitting secure RFQs inside this dashboard": "کشورهای پیشرو صادرکننده ممیزی RFQ در سامانه",
  "inquiries": "استعلام ثبت شده",

  // Media Tab
  "Register Media Resource": "ثبت منبع رسانه‌ای جدید",
  "Link premium agricultures catalog photos or certificate pdfs": "آدرس‌دهی تصاویر کاتالوگ محصولات کشاورزی یا فایل‌های PDF گواهی‌نامه",
  "Display Asset Name": "نام فایل رسانه",
  "File Type Mime": "پسوند فنی فایل (Mime Type)",
  "Simulate File Weight": "حجم تقریبی فایل",
  "Direct Resource Link (URL)": "آدرس مستقیم فایل رسانه (URL)",
  "+ Save Asset Descriptors": "➕ ذخیره و ثبت اسناد کالا",
  "Unsplash Demo Photo Presets": "پیش‌فرض‌های تصویری Unsplash جهت دمو",
  "✓ Fresh Saffron Fields Layout": "✓ زمین‌های برداشت زعفران ارگانیک",
  "✓ Luxury Gift Boxes Display": "✓ بسته‌بندی‌های کادویی لوکس و صادراتی",
  "Stored Asset Files registries": "لیست کامل فایل‌ها و مستندات فعال ذخیره شده",
  "Sandboxed Assets Lock ✓": "قفل مخزن دارایی‌ها فعال است ✓",
  "Copy Link": "کپی آدرس فایل",
  "Copied": "کپی شد",

  // Catalog tab
  "Publish Export Cargo Item": "ثبت و انتشار محصول صادراتی جدید",
  "Seed premium agricultural food specs directly into catalog list": "درج مستقیم مشخصات محصولات لوکس کشاورزی در دیتابیس کاتالوگ پورتال",
  "Commodity Title name": "عنوان کالا (به انگلیسی)",
  "Catalog Description summary": "توضیحات و خلاصه کاتالوگ کالا",
  "Harmonized HS Code": "کد بین‌المللی تعرفه گمرکی (HS Code)",
  "Negotiable Price Range": "محدوده قیمت توافقی صادراتی",
  "Minimum Order (MOQ)": "حداقل تناژ سفارش (MOQ)",
  "Freight Lead Time": "زمان تقریبی آماده‌سازی محموله",
  "Geographic Origin": "خاستگاه بومی تولید محصول",
  "Select Broad Category": "انتخاب دسته‌بندی اصلی کالا",
  "Publish Catalog SKU": "انتشار SKU در کاتالوگ محصول",
  "Catalog Indices": "شاخص کدهای فعال کاتالوگ محصولات موجود",
  "Publish Intelligence Whitepaper": "انتشار گزارش علمی قرنطینه و هوش تجاری",
  "Broadcast import standards, phytosanitary requirements, or market research": "اطلاع‌رسانی استانداردهای ممیزی گیاهی صادرات، الزامات بهداشت گیاه یا تحولات بازار کالا",
  "Article / Briefing Heading": "عنوان مقاله / تحلیل تخصصی k",
  "One-Sentence Synopsis Highlight": "خلاصه کوتاه و برجسته مقاله (یک جمله)",
  "Briefing Content (Markdown standard parseable)": "محتوای مقاله (ساختار استاندارد مارک‌داون Markdown)",
  "Briefing Author": "نویسنده گزارش علمی",
  "Meta Tags (comma split)": "تگ‌های کلیدی و متادیتا (جداسازی با کامای انگلیسی)",
  "Active Papers Briefings": "سوابق اسناد و مقالات هوش فعال پورتال",

  // CMS Tab
  "Interactive Exporters Theme Customizer": "سفارشی‌ساز تعاملی پورتال بازرگانی نظری (CMS)",
  "Deploy brand copy, certificates auditing, sliders and translation sets": "تنظیم و استقرار آنی کپی برند، اسناد ممیزی بهداشتی، اسلایدرها و بسته‌های ترجمه وب‌سایت به صورت آنلاین",
  "Save Visual Theme Configuration": "ذخیره تغییرات پنل و پیکربندی وب‌سایت پورتال",
  "1. Headless Identity & Hotlines Registers": "۱. اطلاعات هویتی رسمی و خطوط ارتباطی",
  "Legal Trading Business Name": "نام رسمی و تجاری برند شرکت",
  "Logo Header Prefix": "پیشوند متنی لوگوی پورتال",
  "Logo Header Suffix Color": "پسوند متنی رنگ لوگوی پورتال",
  "Authorized Procurement Hotline": "تلفن مستقیم بخش سفارش کالا و بازاریابی ملل",
  "Procurement Officer Inbox": "ایمیل کارشناس ممیزی خرید",
  "Headquarters Address": "آدرس دفتر و مقر مرکزی کمپانی",
  "2. International Hompage Visual Translations Set": "۲. ترجمه‌ها و شعارهای صفحه نخست بر اساس زبان انتخاب شده",
  "Hero Over-badge Tagline": "عناوین فرعی و نشان طلایی هیرو",
  "Hero Heading Line 1": "عنوان بالا هیرو - خط اول",
  "Hero Heading Line 2": "عنوان بالا هیرو - خط دوم",
  "Main Brand Pitch/Slogan Box": "شعار استراتژیک و جعبه بیانیه صادراتی برند",
  "3. Dynamic Homepage Ambient Slider Banners & Audits List": "۳. اسلایدرهای متحرک و مستندات ممیزی بهداشتی در صفحه نخست",
  "Add Ambient Hero Background Slide": "افزودن اسلاید پیام به پس‌زمینه اول پورتال",
  "Slide Heading": "عنوان پیام اسلاید",
  "Slide Subtitle": "زیرنویس توضیحی اسلاید",
  "+ Register Slide banner": "➕ افزودن به اسلایدر",
  "Add compliance Authenticated Certificate": "ثبت استانداردها و تاییدیه ممیزی ارگانیک k",
  "ISO Certificate name": "عنوان تاییدیه ارگانیک یا گواهی‌نامه ISO",
  "Approved Issued Authority": "مرجع صادرکننده رسمی گواهی‌نامه",
  "+ Register Certificate Info": "➕ ثبت به جدول استانداردها",
  "Deploy Theme Parameters": "تکمیل و انتشار مستقیم تم پورتال",

  // Security Tab
  "System Dump Snapshots": "نقاط بازنشانی و پشتیبان‌گیری کل سیستم",
  "Generate dry files state backup to comply with trade cert constraints": "ایجاد گزارش زنده پشتبان‌گیری جهت تمکین از ممیزی‌های دفتری و مالیاتی بین‌الملل",
  "Instantly save states of products catalog, Rfq enquiries and system logs. Snapshot are secure and stored locally, instantly rolled back on mismatch.": "شما می‌توانید با یک کلیک وضعیت فعلی کاتالوگ محصولات، استعلام‌های دریافتی و گزارش‌های امنیتی را به صورت لوکال پشتیبان بگیرید.",
  "+ Export Global Database Snapshot": "➕ ایجاد فایل پشتیبان (بکاپ کامل دیتابیس)",
  "Rollback snapshot anchors": "لیست نقاط بازنشانی دیتابیس در سرور",
  "Restore": "بازنشانی دیتابیس",
  "Size": "حجم فایل",
  "Rotate Intranet Keyphrase": "تغییر و چرخش کلید گذرواژه مدیریت پورتال",
  "Keep credentials compliant with trade audit rules": "چرخش منظم اطلاعات و پسورد اپراتور جهت تطابق الزامات امنیتی وب‌دیوار سایبری",
  "Fresh Password pass-key": "گذرواژه جدید پورتال",
  "Must contain 8 characters minimum...": "حداقل باید دارای ۸ کاراکتر امنیتی باشد",
  "✓ Commit Rotated Keyphrase": "✓ چرخش و ثبت نهایی پسورد جدید",
  "Sitemaps & SEO Index configurations": "پیکربندی سئو (SEO) و تنظیم وب‌سایت در گوگل",
  "Deploy search engine title tags and index descriptors": "بارگذاری تگ‌های توضیحات، عناوین کلمات کلیدی صفحات جهت بالاترین رتبه گوگل",
  "Search Engine Meta Title": "عنوان متا برای کاتالوگ (Meta Title)",
  "Search Engine Meta Description": "شرح متای سئو برای پورتال (Meta Description)",
  "Deploy SEO Metadata Tags": "ذخیره و پیاده‌سازی سئوی وب‌سایت",
  "Intranet Entry & Security Audit Telemetries": " ممیزی لاگ‌های امنیتی سرور و ثبت ورود و خروج",
  "Refresh Stream Logs": "بروزرسانی لاگ‌ها",
  "Audit log initialized empty. No events registered.": "مسیر ممیزی لاگ‌ها بدون هیچ رویدادی خالی است.",

  // Attachment Viewer
  "Close Document Previewer": "بستن مرورگر سند",
  "Vetted Importer Cargo Certification File": "بررسی هویت و عیارسنجی گواهی استاندارد گمرکی ضمیمه",
  "PDF Base64 Encryption Verified": "سند رمزنگاری شده PDF تایید گردید",
  "Binary compliance seal is active inside container memory sandbox. Payload size: ": "مهر منطبق گواهی سایبری در جعبه حافظه فعال است. حجم پیلود دریافتی: "
};

export default function AdminPanel({ lang, settings, onSettingsUpdated }: AdminPanelProps) {
  const isFa = lang === "fa";
  const t = (key: string, fallbackEn = "") => {
    const defaultEn = fallbackEn || key;
    if (!isFa) return defaultEn;
    return faTranslations[key] || defaultEn;
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "", rememberMe: false });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [messageNotice, setMessageNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Core Authorized Data State
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalytics[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [seo, setSeo] = useState<SEOSettings>({
    metaTitle: "Nazari Agro | Premium Saffron & Saffron Kernel Global Exports",
    metaDescription: "We provide high-purity saffron and agricultural pistachio directly from harvest-vetted groves to global buyers.",
    keywords: "pistachios, export nuts, premium agricultural, bulk nuts buying",
    ogImage: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format",
    sitemapLastUpdated: new Date().toISOString().substring(0, 10)
  });

  const [activeTab, setActiveTab] = useState<"leads" | "analytics" | "media" | "catalog" | "cms" | "security">("leads");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAttachment, setActiveAttachment] = useState<string | null>(null);

  // Form Submissions State
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", priceRange: "", unit: "", origin: "", hsCode: "", minOrder: "", leadTime: "", purityGrade: "", packaging: "", categories: "Raw Pistachio"
  });
  const [newBlog, setNewBlog] = useState({
    title: "", excerpt: "", content: "", author: "", tags: "Compliance, Intelligence"
  });
  
  // Settings Forms Structure
  const [settingsForm, setSettingsForm] = useState({
    brandName: "", logoText: "", logoSubtext: "", phone: "", email: "", address: "", linkedin: "", instagram: "", telegram: "", whatsApp: ""
  });
  const [sliders, setSliders] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [textsMap, setTextsMap] = useState<Record<string, any>>({});
  const [editingLang, setEditingLang] = useState("en");

  // New Items Temp Form state
  const [tmpSlider, setTmpSlider] = useState({ imageUrl: "", title: "", subtitle: "" });
  const [tmpCert, setTmpCert] = useState({ name: "", issuedBy: "", imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format" });
  const [tmpGallery, setTmpGallery] = useState({ title: "", imageUrl: "" });
  const [tmpMedia, setTmpMedia] = useState({ fileName: "", mimeType: "image/jpeg", size: "1.4 MB", url: "" });
  const [newPassword, setNewPassword] = useState("");

  // Load CSRF + verify active cookie/localStorage session on mount
  useEffect(() => {
    fetch("/api/csrf")
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
        // Verify active session
        const storedToken = localStorage.getItem("nazari_admin_token");
        const headers: Record<string, string> = { "X-CSRF-Token": data.csrfToken };
        if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

        fetch("/api/admin/me", { headers })
          .then(r => r.json())
          .then(meData => {
            if (meData.loggedIn) {
              setIsLoggedIn(true);
              triggerDataLoads(storedToken || "");
            }
          })
          .catch(() => {});
      });
  }, []);

  const triggerDataLoads = (tokenOverride?: string) => {
    const token = tokenOverride !== undefined ? tokenOverride : (localStorage.getItem("nazari_admin_token") || "");
    const headers = { "Authorization": `Bearer ${token}` };

    fetch("/api/admin/rfqs", { headers }).then(r => r.json()).then(data => Array.isArray(data) && setRfqs(data));
    fetch("/api/admin/logs", { headers }).then(r => r.json()).then(data => Array.isArray(data) && setLogs(data));
    fetch("/api/admin/backups", { headers }).then(r => r.json()).then(data => Array.isArray(data) && setBackups(data));
    fetch("/api/admin/analytics", { headers }).then(r => r.json()).then(data => Array.isArray(data) && setAnalytics(data));
    fetch("/api/admin/media", { headers }).then(r => r.json()).then(data => Array.isArray(data) && setMedia(data));
    fetch("/api/products").then(r => r.json()).then(data => Array.isArray(data) && setProducts(data));
    fetch("/api/blogs").then(r => r.json()).then(data => Array.isArray(data) && setBlogs(data));
  };

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        brandName: settings.brandName || "",
        logoText: settings.logoText || "",
        logoSubtext: settings.logoSubtext || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        linkedin: settings.linkedin || "",
        instagram: settings.instagram || "",
        telegram: settings.telegram || "",
        whatsApp: settings.whatsApp || ""
      });
      setSliders(settings.sliders || []);
      setCerts(settings.certificates || []);
      setGallery(settings.gallery || []);
      setVideos(settings.videos || []);
      setTextsMap(settings.homepageTexts || {});
      if (settings.seo) setSeo(settings.seo);
    }
  }, [settings]);

  // Secure API fetch client helper
  const apiCall = async (url: string, method = "GET", body: any = null) => {
    const token = localStorage.getItem("nazari_admin_token") || "";
    const headers: any = {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      "Authorization": `Bearer ${token}`,
      "x-admin-token": token
    };

    const config: RequestInit = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
      const response = await fetch(url, config);
      if (response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem("nazari_admin_token");
        throw new Error("Local session verification failed.");
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Operation failed.");
      return data;
    } catch (err: any) {
      showNotice("error", err.message || "Network request failed.");
      throw err;
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid operator login phrase.");
      
      localStorage.setItem("nazari_admin_token", data.token);
      setIsLoggedIn(true);
      triggerDataLoads(data.token);
      showNotice("success", `Authorized Operator space unlocked: (${data.adminProfile.username})`);
    } catch (err: any) {
      setLoginError(err.message || "Authentication credentials failed verification check.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", headers: { "X-CSRF-Token": csrfToken } });
    } catch {}
    localStorage.removeItem("nazari_admin_token");
    setIsLoggedIn(false);
    showNotice("success", "Administrative session revoked safely.");
  };

  const showNotice = (type: "success" | "error", text: string) => {
    setMessageNotice({ type, text });
    setTimeout(() => setMessageNotice(null), 6000);
  };

  const executeBackup = async () => {
    try {
      const db = await apiCall("/api/admin/backups/create", "POST");
      showNotice("success", `System snapshot backup generated: ${db.backupName}`);
      triggerDataLoads();
    } catch {}
  };

  const executeRestore = async (file: string) => {
    if (!confirm(`Deploying snapshot [ ${file} ] will purge all current records. Continue?`)) return;
    try {
      await apiCall("/api/admin/backups/restore", "POST", { fileName: file });
      showNotice("success", `System status reverted successfully to archive: ${file}`);
      triggerDataLoads();
    } catch {}
  };

  const rfqStatusChange = async (id: string, state: string) => {
    try {
      await apiCall("/api/admin/rfq/status", "POST", { id, status: state });
      showNotice("success", `RFQ ID: ${id} status set to [${state}]`);
      triggerDataLoads();
    } catch {}
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("/api/products/add", "POST", {
        ...newProduct,
        categories: [newProduct.categories],
        imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format",
        specifications: { "Certified Purity": "ISO Standard Grade A", "Shipping Shield": "Lined composite vacuum barrier" }
      });
      showNotice("success", `Product ${newProduct.name} catalog record published.`);
      setNewProduct({ name: "", description: "", priceRange: "", unit: "", origin: "", hsCode: "", minOrder: "", leadTime: "", purityGrade: "", packaging: "", categories: "Raw Pistachio" });
      triggerDataLoads();
    } catch {}
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Permanently delete this product profile?")) {
      try {
        await apiCall(`/api/products/${id}`, "DELETE");
        showNotice("success", "Product profile deleted successfully from catalog.");
        triggerDataLoads();
      } catch {}
    }
  };

  const handleAddBlog = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("/api/blogs/add", "POST", {
        ...newBlog,
        tags: newBlog.tags.split(",").map(t => t.trim()),
        publicationDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        readTime: "5 Min",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format"
      });
      showNotice("success", `Whitepaper [${newBlog.title}] published on global portal.`);
      setNewBlog({ title: "", excerpt: "", content: "", author: "", tags: "Compliance, Intelligence" });
      triggerDataLoads();
    } catch {}
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("Permantly pull this whitepaper from active circulation?")) {
      try {
        await apiCall(`/api/blogs/${id}`, "DELETE");
        showNotice("success", "Briefing post successfully pulled.");
        triggerDataLoads();
      } catch {}
    }
  };

  const handleUpdateSEO = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiCall("/api/admin/seo", "POST", seo);
      showNotice("success", "Global head meta tags and SEO keywords deployed successfully.");
    } catch {}
  };

  const handleAddMediaItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!tmpMedia.url || !tmpMedia.fileName) {
      showNotice("error", "Both display file URL and filename are required.");
      return;
    }
    try {
      await apiCall("/api/admin/media/add", "POST", tmpMedia);
      showNotice("success", `Media file [${tmpMedia.fileName}] cataloged successfully.`);
      setTmpMedia({ fileName: "", mimeType: "image/jpeg", size: "1.4 MB", url: "" });
      triggerDataLoads();
    } catch {}
  };

  const handleDeleteMediaItem = async (id: string) => {
    try {
      await apiCall(`/api/admin/media/${id}`, "DELETE");
      showNotice("success", "Media link descriptor removed from system.");
      triggerDataLoads();
    } catch {}
  };

  const handleSaveCMS = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const merged = { ...settings, ...settingsForm, sliders, certificates: certs, gallery, videos, homepageTexts: textsMap, seo };
      await apiCall("/api/admin/settings", "POST", merged);
      showNotice("success", "Web CMS settings written and deployed instantly to live servers.");
      onSettingsUpdated();
    } catch {}
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showNotice("error", "Secure keypass phrase must be at least 8 characters long.");
      return;
    }
    try {
      await apiCall("/api/admin/password", "POST", { newPassword });
      showNotice("success", "Admin password rotated. Previous active sessions forced clear, please log back in.");
      setNewPassword("");
      handleLogout();
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="py-24 px-4 max-w-sm mx-auto font-sans" id="admin-login-screen">
        <div className="bg-cream/45 border-2 border-pistachio-light/40 p-8 shadow-2xl rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-pistachio-light/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-pistachio hover:scale-105 transition-transform border-4 border-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-luxury-dark tracking-wide font-sans">
              {t("Nazari Export Intranet")}
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#81aa62] mt-1 block">
              {t("Global Shipping Control Panel")}
            </span>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg text-xs mb-6 flex gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{t(loginError)}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" id="login-auth-form">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-username" className="text-[9px] uppercase font-mono text-gray-400 tracking-wider">{t("Operator Username")}</label>
              <input
                id="login-username" type="text" required value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                className="border border-pistachio-light/40 bg-white/70 px-3.5 py-2.5 text-xs rounded-xl outline-none focus:border-pistachio text-luxury-dark"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-[9px] uppercase font-mono text-gray-400 tracking-wider">{t("Cryptographic Keypass Phrase")}</label>
              <input
                id="login-password" type="password" required value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Admin123456!"
                className="border border-pistachio-light/40 bg-white/70 px-3.5 py-2.5 text-xs rounded-xl outline-none focus:border-pistachio text-luxury-dark"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input 
                id="login-remember" type="checkbox" checked={credentials.rememberMe}
                onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                className="rounded border-pistachio text-pistachio outline-none"
              />
              <label htmlFor="login-remember" className="text-[10px] text-gray-500 font-sans cursor-pointer select-none">{t("Remember this station for 30 days")}</label>
            </div>

            <button
              type="submit"
              className="w-full bg-pistachio hover:bg-[#88ba67] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-pistachio/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t("Validate Credentials")}</span>
              <ShieldCheck className="w-4.5 h-4.5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-pistachio-light/30 text-center font-mono">
            <span className="block text-[8px] text-gray-400 uppercase tracking-widest leading-relaxed">
              {t("Vetted Demonstration Admin Coordinates")}<br />
              <strong className="text-pistachio font-bold">admin / Admin123456!</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high-level stats
  const pendingRFQs = rfqs.filter(r => r.status === "Pending").length;
  const processedRFQs = rfqs.filter(r => r.status !== "Pending").length;
  const totalInboundQty = rfqs.reduce((acc, current) => {
    const parsed = parseInt(current.quantityNeeded.replace(/[^0-9]/g, "")) || 0;
    return acc + parsed;
  }, 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans" id="authorized-admin-layout">
      {/* Dynamic Status Deck */}
      <div className="bg-gradient-to-r from-pistachio/80 to-[#84b563]/90 text-white rounded-3xl p-6 shadow-xl mb-8 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/25">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-widest">{t("Operator Console Live")}</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <h1 className="text-xl font-bold tracking-wide mt-1 text-white">{t("NAZARI CARGO SHIPMENT SYSTEM")}</h1>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-8 z-10 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
          <div className="text-center sm:text-start pe-4 sm:border-e border-white/15">
            <span className="text-[8px] font-mono text-white/70 uppercase">{t("Inbound RFQ Leads")}</span>
            <span className="block text-xl font-bold font-mono mt-0.5">{rfqs.length}</span>
          </div>
          <div className="text-center sm:text-start pe-4 sm:border-e border-white/15">
            <span className="text-[8px] font-mono text-white/70 uppercase">{t("Needs Verification")}</span>
            <span className="block text-xl font-bold font-mono text-amber-300 mt-0.5">{pendingRFQs}</span>
          </div>
          <div className="text-center sm:text-start">
            <span className="text-[8px] font-mono text-white/70 uppercase">{t("Bulk Tonnage Quoted")}</span>
            <span className="block text-xl font-bold font-mono mt-0.5">{totalInboundQty.toLocaleString()} TN</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white text-white hover:text-pistachio border border-white/20 hover:border-white transition-all px-4 py-2 text-xs rounded-xl uppercase font-mono font-bold tracking-wider cursor-pointer z-10"
        >
          {t("Close Session")}
        </button>
      </div>

      {notificationBubble(messageNotice)}

      {/* Advanced Sidebar/Tab Interface */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Rail */}
        <div className="w-full lg:w-64 bg-cream/35 border border-pistachio-light/40 rounded-3xl p-4 shrink-0 shadow-sm space-y-1.5">
          <span className="block text-[8px] font-mono uppercase text-gray-400 tracking-widest ps-2.5 mb-2">{t("Workspace Controls")}</span>
          {[
            { id: "leads", label: t("Inbound Leads (RFQs)"), icon: FileSpreadsheet, badge: pendingRFQs },
            { id: "analytics", label: t("Traffic Analytics"), icon: BarChart3 },
            { id: "media", label: t("Assets Gallery"), icon: ImageIcon, badge: media.length },
            { id: "catalog", label: t("Catalog Editor"), icon: Play },
            { id: "cms", label: t("Portal Visual Theme"), icon: Sliders },
            { id: "security", label: t("Failsafes & Keys"), icon: Database }
          ].map(tab => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setActiveAttachment(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  active 
                    ? "bg-pistachio text-white border-pistachio shadow-md" 
                    : "bg-white/40 text-gray-500 hover:text-luxury-dark hover:bg-white border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold ${active ? "bg-white text-pistachio" : "bg-emerald-100 text-emerald-800"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Console Workspace Panels */}
        <div className="flex-1 w-full min-w-0">
          
          {/* TAB 1: RFQ LEADS MANAGEMENT */}
          {activeTab === "leads" && (
            <div className="space-y-6 animate-fadeIn" id="workspace-leads">
              {attachmentViewer(activeAttachment, () => setActiveAttachment(null), t)}

              {rfqs.length === 0 ? (
                <div className="bg-white border text-center p-14 text-xs text-gray-400 rounded-3xl">{t("No inquiries found in active database registries.")}</div>
              ) : (
                <div className="space-y-4">
                  {rfqs.map(r => {
                    const isHighSpam = r.spamScore >= 3;
                    return (
                      <div 
                        key={r.id} 
                        className={`bg-white border rounded-3xl p-6 transition-all duration-300 shadow-xs flex flex-col md:flex-row justify-between gap-6 ${
                          isHighSpam ? "border-rose-200 bg-rose-50/10" : "border-pistachio-light/30"
                        }`}
                        id={`lead-item-${r.id}`}
                      >
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xs font-bold text-pistachio">{r.id}</span>
                            <h3 className="font-bold text-sm text-luxury-dark tracking-wide">{r.clientName}</h3>
                            <span className="text-[10px] text-gray-400 lowercase font-mono">({r.company})</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-mono uppercase font-bold ${
                              r.status === "Pending" ? "bg-amber-100 text-amber-800" :
                              r.status === "Reviewed" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {r.status === "Pending" ? t("Needs Verification") : r.status === "Reviewed" ? t("✓ Mark Reviewed") : t("✓ Issue Price Quote")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="block text-[8px] font-mono uppercase text-gray-400">{t("Destination")}</span>
                              <span className="text-luxury-dark font-medium">{r.country}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-mono uppercase text-gray-400">{t("Required Quantity")}</span>
                              <span className="text-luxury-dark font-semibold font-mono">{r.quantityNeeded}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-mono uppercase text-gray-400">{t("Incoterms Agreement")}</span>
                              <span className="text-luxury-dark font-mono font-semibold">{r.preferredIncoterm}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-mono uppercase text-gray-400">{t("Registry Point")}</span>
                              <span className="text-luxury-dark break-words">{r.email}</span>
                            </div>
                          </div>

                          {r.comment && (
                            <div className="bg-cream/40 p-3 rounded-2xl border border-pistachio-light/25 text-xs text-gray-500 font-light">
                              <span className="block text-[8px] uppercase font-mono text-gray-400 mb-0.5 font-semibold">{t("Special Instructions")}</span>
                              "{r.comment}"
                            </div>
                          )}

                          {r.docUrl && (
                            <button
                              onClick={() => { setActiveAttachment(r.docUrl || null); }}
                              className="text-xs font-mono text-pistachio hover:text-[#7ba65a] underline font-bold uppercase flex items-center gap-1 cursor-pointer animate-pulse"
                            >
                              <Eye className="w-3.5 h-3.5" /> {t("View Uploaded Compliance Attachment")}
                            </button>
                          )}

                          {isHighSpam && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-[9.5px] font-mono flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>{t("POTENTIAL MALICIOUS EMAIL PATTERN // SPAM SCORE: ")} {r.spamScore} OF 5</span>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 w-full md:w-44 border-t md:border-t-0 md:border-s border-pistachio-light/35 pt-4 md:pt-0 md:ps-5 flex flex-col gap-2 justify-center font-mono">
                          <span className="text-[8px] text-gray-400 uppercase tracking-widest mb-1 font-bold">{t("Status Transitions")}</span>
                          <button
                            onClick={() => rfqStatusChange(r.id, "Reviewed")}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer text-start"
                          >
                            {t("✓ Mark Reviewed")}
                          </button>
                          <button
                            onClick={() => rfqStatusChange(r.id, "Quoted")}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer text-start"
                          >
                            {t("✓ Issue Price Quote")}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Permanently archive this lead file?")) {
                                rfqStatusChange(r.id, "Archived");
                              }
                            }}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer text-start"
                          >
                            {t("× Set Private Archive")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISITOR TRAFFIC ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fadeIn" id="workspace-analytics">
              {/* Daily view vector graph */}
              <div className="bg-white border border-pistachio-light/35 p-6 rounded-3xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide text-luxury-dark uppercase">{t("Portal Traffic Log Metrics")}</h3>
                    <span className="text-[10px] font-mono text-gray-400">{t("Interactive telemetry mapping for the preceding 7 trading days")}</span>
                  </div>
                  <div className="flex gap-4 font-mono text-[9px] font-bold uppercase">
                    <span className="flex items-center gap-1 text-[#8abf68]"><span className="w-2.5 h-2.5 bg-[#8abf68] rounded-full"></span> {t("Uniques")}</span>
                    <span className="flex items-center gap-1 text-gold"><span className="w-2.5 h-2.5 bg-[#d4af37] rounded-full"></span> {t("Hits")}</span>
                  </div>
                </div>

                {/* Micro clean SVG Chart */}
                <div className="h-64 w-full relative">
                  {analytics.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-mono">{t("Telemetry database records initialized empty.", "Telemetry database records initialized empty.")}</div>
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="uniquesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8abf68" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#8abf68" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      {[0, 60, 120, 180].map((y, idx) => (
                        <line key={idx} x1="0" y1={y} x2="700" y2={y} stroke="#f1f3f0" strokeDasharray="5" strokeWidth="1" />
                      ))}

                      {/* Uniques Area and Line path */}
                      <path 
                        d={generateSVGPath(analytics, "uniqueVisitors", 700, 240, true)} 
                        fill="url(#uniquesGrad)" 
                      />
                      <path 
                        d={generateSVGPath(analytics, "uniqueVisitors", 700, 240, false)} 
                        fill="none" stroke="#8abf68" strokeWidth="3" strokeLinecap="round" 
                      />

                      {/* Hits/Views line */}
                      <path 
                        d={generateSVGPath(analytics, "pageViews", 700, 240, false)} 
                        fill="none" stroke="#cca250" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"
                      />

                      {/* Interactive dots with metadata flags */}
                      {analytics.map((day, dIdx) => {
                        const stepX = 700 / (analytics.length - 1 || 1);
                        const cx = dIdx * stepX;
                        const cyU = 240 - ((day.uniqueVisitors / 300) * 160 + 30);
                        const cyH = 240 - ((day.pageViews / 1500) * 160 + 30);
                        return (
                          <g key={dIdx} className="group cursor-pointer">
                            <circle cx={cx} cy={cyU} r="4.5" fill="#8abf68" stroke="#ffffff" strokeWidth="2" />
                            <circle cx={cx} cy={cyH} r="3.5" fill="#cca250" stroke="#ffffff" strokeWidth="1.5" />
                            <foreignObject x={Math.max(10, cx - 40)} y={Math.max(15, cyU - 45)} width="100" height="35" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="bg-luxury-dark text-white rounded-lg p-1.5 text-[8px] font-mono shadow text-center">
                                {day.date}: Uniq {day.uniqueVisitors}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* X Axis dates axis label bar */}
                <div className="flex justify-between font-mono text-[9px] text-gray-400 pt-3 border-t border-gray-100">
                  {analytics.map((d, i) => <span key={i}>{d.date.substring(5)}</span>)}
                </div>
              </div>

              {/* Bento Grid layout with countries traffic mapping */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Traffic summary indicators */}
                <div className="bg-[#fbfcfa] border border-[#a3ca85]/35 p-6 rounded-3xl space-y-4">
                  <span className="text-[9px] font-mono uppercase text-gray-400 font-bold block">{t("Consolidated Averages")}</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-2xl border border-pistachio-light/20 text-center">
                      <span className="text-[8px] text-gray-400 block font-sans">{t("Avg Session")}</span>
                      <strong className="text-sm font-mono text-[#6c9a49] font-bold">184 Sec</strong>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-pistachio-light/20 text-center">
                      <span className="text-[8px] text-[#cca250] block font-sans">{t("Bounce Ratio")}</span>
                      <strong className="text-sm font-mono text-luxury-dark font-bold">32.8 %</strong>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-pistachio-light/20 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-mono">{t("DESKTOP SHARE")}</span>
                      <span className="text-xs font-bold text-luxury-dark font-sans flex items-center gap-1 mt-0.5"><Laptop className="w-3.5 h-3.5 text-pistachio" fill="none" /> 74.2%</span>
                    </div>
                    <div className="text-end">
                      <span className="text-[9px] text-gray-400 block font-mono">{t("MOBILE APP")}</span>
                      <span className="text-xs font-bold text-luxury-dark font-sans flex items-center gap-1 justify-end mt-0.5"><Smartphone className="w-3.5 h-3.5 text-gold" /> 25.8%</span>
                    </div>
                  </div>
                </div>

                {/* Country distribution mapping */}
                <div className="bg-white border border-pistachio-light/35 p-6 rounded-3xl md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs tracking-wide text-luxury-dark uppercase">{t("Global Procurement Request Demographics")}</h4>
                    <span className="text-[8px] font-mono uppercase text-gray-400 block">{t("Top regions emitting secure RFQs inside this dashboard")}</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Germany (European Core)", count: 182, percent: 38 },
                      { name: "UAE (Middle East Hub)", count: 125, percent: 26 },
                      { name: "Mainland China (East Asia)", count: 88, percent: 18 },
                      { name: "Vietnam & ASEAN", count: 50, percent: 10 },
                      { name: "Other Trading Nodes", count: 35, percent: 8 }
                    ].map((country, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-sans">
                          <span className="font-medium text-luxury-dark">{t(country.name)}</span>
                          <span className="font-mono text-gray-400 font-bold">{country.count} {t("inquiries")} ({country.percent} %)</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-pistachio to-[#acd28e] rounded-full transition-all duration-1000"
                            style={{ width: `${country.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: MEDIA EXPLORER AND DOCUMENTS MANAGER */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-fadeIn" id="workspace-media">
              <AuraMediaLibrary 
                media={media}
                t={t}
                apiCall={apiCall}
                showNotice={showNotice}
                triggerDataLoads={triggerDataLoads}
                lang={lang as any}
              />
            </div>
          )}

          {/* TAB 4: PRODUCTS CATALOG & TRADE Intelligence CURATOR */}
          {activeTab === "catalog" && (
            <div className="space-y-6 animate-fadeIn" id="workspace-catalog">
              <AuraPublishingDesk 
                products={products}
                blogs={blogs}
                media={media}
                t={t}
                apiCall={apiCall}
                showNotice={showNotice}
                triggerDataLoads={triggerDataLoads}
                lang={lang as any}
              />
            </div>
          )}

          {/* TAB 5: CMS VISUAL CONFIGURATORS, SLIDERS & MARKETING TRANSLATIONS */}
          {activeTab === "cms" && (
            <div className="bg-white border border-pistachio-light/35 p-6 sm:p-8 rounded-3xl shadow-xs space-y-10 animate-fadeIn text-luxury-dark font-sans" id="workspace-cms">
              <form onSubmit={handleSaveCMS} className="space-y-8" id="master-cms-controller">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-4">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide uppercase text-[#699a46]">{t("Interactive Exporters Theme Customizer")}</h3>
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-1 block">{t("Deploy brand copy, certificates auditing, sliders and translation sets")}</span>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-pistachio hover:bg-[#84b762] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md hover:shadow-pistachio/15 shrink-0 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> {t("Save Visual Theme Configuration")}
                  </button>
                </div>

                {/* Grid 1: Basic Identity Contacts */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono uppercase font-bold text-gold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" /> {t("1. Headless Identity & Hotlines Registers")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-brand" className="text-[9px] font-mono uppercase text-gray-400">{t("Legal Trading Business Name")}</label>
                      <input 
                        id="sett-brand" type="text" value={settingsForm.brandName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-logotext" className="text-[9px] font-mono uppercase text-gray-400">{t("Logo Header Prefix")}</label>
                      <input 
                        id="sett-logotext" type="text" value={settingsForm.logoText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-logosubtext" className="text-[9px] font-mono uppercase text-gray-400">{t("Logo Header Suffix Color")}</label>
                      <input 
                        id="sett-logosubtext" type="text" value={settingsForm.logoSubtext}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoSubtext: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-phone" className="text-[9px] font-mono uppercase text-gray-400">{t("Authorized Procurement Hotline")}</label>
                      <input 
                        id="sett-phone" type="text" value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-email" className="text-[9px] font-mono uppercase text-gray-400">{t("Procurement Officer Inbox")}</label>
                      <input 
                        id="sett-email" type="email" value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sett-address" className="text-[9px] font-mono uppercase text-gray-400">{t("Headquarters Address")}</label>
                      <input 
                        id="sett-address" type="text" value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub section 2: International Multilingual Homepage Text Translator */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-mono uppercase font-bold text-gold flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> {t("2. International Hompage Visual Translations Set")}
                  </h4>

                  <div className="flex gap-2 font-mono text-[9px] wrap">
                    {["en", "fa", "es", "zh", "ar", "de"].map(lk => {
                      const names: Record<string, string> = { en: "🇺🇸 English", fa: "🇮🇷 فارسی", es: "🇪🇸 Español", zh: "🇨🇳 中文", ar: "🇸🇦 العربية", de: "🇩🇪 Deutsch" };
                      return (
                        <button 
                           key={lk} type="button" onClick={() => setEditingLang(lk)}
                           className={`px-3.5 py-1.5 rounded-full border font-bold cursor-pointer transition-all ${
                             editingLang === lk ? "bg-pistachio text-white border-pistachio" : "bg-white text-gray-400 border-gray-200 hover:text-luxury-dark"
                           }`}
                        >
                          {names[lk]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-cream/30 p-5 rounded-3xl border border-pistachio-light/20 grid grid-cols-1 md:grid-cols-2 gap-5 text-luxury-dark">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8.5px] font-mono uppercase text-gray-400 font-bold">{t("Hero Over-badge Tagline")} ({editingLang.toUpperCase()})</label>
                      <input 
                        type="text" value={textsMap[editingLang]?.heroTag || ""}
                        onChange={(e) => {
                          const updated = { ...textsMap };
                          if (!updated[editingLang]) updated[editingLang] = {};
                          updated[editingLang].heroTag = e.target.value;
                          setTextsMap(updated);
                        }}
                        className="border border-pistachio-light/30 bg-white px-3 py-2 text-xs rounded-xl outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-mono uppercase text-gray-400 font-bold">{t("Hero Heading Line 1")}</label>
                        <input 
                          type="text" value={textsMap[editingLang]?.heroTitle1 || ""}
                          onChange={(e) => {
                            const updated = { ...textsMap };
                            if (!updated[editingLang]) updated[editingLang] = {};
                            updated[editingLang].heroTitle1 = e.target.value;
                            setTextsMap(updated);
                          }}
                          className="border border-pistachio-light/30 bg-white px-3 py-2 text-xs rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] font-mono uppercase text-gray-400 font-bold">{t("Hero Heading Line 2")}</label>
                        <input 
                          type="text" value={textsMap[editingLang]?.heroTitle2 || ""}
                          onChange={(e) => {
                            const updated = { ...textsMap };
                            if (!updated[editingLang]) updated[editingLang] = {};
                            updated[editingLang].heroTitle2 = e.target.value;
                            setTextsMap(updated);
                          }}
                          className="border border-pistachio-light/30 bg-white px-3 py-2 text-xs rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                       <label className="text-[8.5px] font-mono uppercase text-gray-400 font-bold">{t("Main Brand Pitch/Slogan Box")} ({editingLang})</label>
                      <textarea 
                        rows={2} value={textsMap[editingLang]?.heroDesc || ""}
                        onChange={(e) => {
                          const updated = { ...textsMap };
                          if (!updated[editingLang]) updated[editingLang] = {};
                          updated[editingLang].heroDesc = e.target.value;
                          setTextsMap(updated);
                        }}
                        className="border border-pistachio-light/30 bg-white px-3 py-2 text-xs rounded-xl outline-none text-[#5e6658]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub section 3: Dynamic interactive Slider Lists & compliance Certificates lists */}
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-mono uppercase font-bold text-gold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> {t("3. Dynamic Homepage Ambient Slider Banners & Audits List")}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hero sliders managers */}
                    <div className="bg-[#fbfcfa] border border-[#a3ca85]/35 p-5 rounded-3xl space-y-4">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-pistachio font-bold">{t("Add Ambient Hero Background Slide")}</span>
                        <div className="space-y-2.5 pt-2">
                          <input 
                            type="text" placeholder={t("Image URL...")} value={tmpSlider.imageUrl}
                            onChange={(e) => setTmpSlider({ ...tmpSlider, imageUrl: e.target.value })}
                            className="border border-pistachio-light/40 bg-white px-3 py-2 text-xs rounded-xl w-full"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              type="text" placeholder={t("Slide Heading...")} value={tmpSlider.title}
                              onChange={(e) => setTmpSlider({ ...tmpSlider, title: e.target.value })}
                              className="border border-pistachio-light/40 bg-white px-3 py-2 text-xs rounded-xl w-full"
                            />
                            <input 
                              type="text" placeholder={t("Slide Subtitle...")} value={tmpSlider.subtitle}
                              onChange={(e) => setTmpSlider({ ...tmpSlider, subtitle: e.target.value })}
                              className="border border-pistachio-light/40 bg-white px-3 py-2 text-xs rounded-xl w-full"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!tmpSlider.imageUrl) return;
                              setSliders([...sliders, { id: `slide-${Date.now()}`, ...tmpSlider }]);
                              setTmpSlider({ imageUrl: "", title: "", subtitle: "" });
                            }}
                            className="bg-pistachio text-white font-mono text-[9px] font-bold uppercase px-3 py-2 rounded-xl cursor-pointer"
                          >
                            {t("+ Register Slide banner")}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-pistachio-light/20 pt-3 space-y-1.5 max-h-36 overflow-auto">
                        {sliders.map((item, index) => (
                          <div key={item.id || index} className="flex justify-between items-center bg-white p-2 text-xs rounded-xl border border-pistachio-light/10 text-start">
                            <span className="truncate max-w-[240px] text-[11px] font-medium text-gray-500">{item.title || t("Untitled Ambient Frame")} ({item.imageUrl.substring(0, 32)}...)</span>
                            <button type="button" onClick={() => setSliders(sliders.filter(s => s.id !== item.id))} className="text-rose-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vetted Corporate compliance Audits certifications list manager */}
                    <div className="bg-[#fbfcfa] border border-[#a3ca85]/35 p-5 rounded-3xl space-y-4">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-pistachio font-bold">{t("Add compliance Authenticated Certificate")}</span>
                        <div className="space-y-2.5 pt-2">
                          <input 
                            type="text" placeholder={t("ISO Certificate name...")} value={tmpCert.name}
                            onChange={(e) => setTmpCert({ ...tmpCert, name: e.target.value })}
                            className="border border-pistachio-light/40 bg-white px-3 py-2 text-xs rounded-xl w-full"
                          />
                          <input 
                            type="text" placeholder={t("Approved Issued Authority...")} value={tmpCert.issuedBy}
                            onChange={(e) => setTmpCert({ ...tmpCert, issuedBy: e.target.value })}
                            className="border border-pistachio-light/40 bg-white px-3 py-2 text-xs rounded-xl w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!tmpCert.name || !tmpCert.issuedBy) return;
                              setCerts([...certs, { id: `cert-${Date.now()}`, ...tmpCert }]);
                              setTmpCert({ name: "", issuedBy: "", imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format" });
                            }}
                            className="bg-pistachio text-white font-mono text-[9px] font-bold uppercase px-3 py-2 rounded-xl cursor-pointer"
                          >
                            {t("+ Register Certificate Info")}
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-pistachio-light/20 pt-3 space-y-1.5 max-h-36 overflow-auto">
                        {certs.map((item, index) => (
                          <div key={item.id || index} className="flex justify-between items-center bg-white p-2 text-xs rounded-xl border border-pistachio-light/10 text-start">
                            <span className="truncate max-w-[240px] text-[11px] font-medium text-gray-500">{item.name} ({item.issuedBy})</span>
                            <button type="button" onClick={() => setCerts(certs.filter(c => c.id !== item.id))} className="text-rose-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit CMS Deck */}
                <div className="flex justify-end p-4 bg-cream/30 rounded-3xl border border-pistachio-light/20">
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-pistachio to-[#8fb86b] hover:from-white hover:to-white text-white hover:text-pistachio border border-transparent hover:border-pistachio px-8 py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-pistachio/10 cursor-pointer transition-all duration-300"
                  >
                    {t("Deploy Theme Parameters")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: BACKUPSsnap, SYSTEM SECURITY AUDIT LOGS, AND KEY ROTATIONS */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fadeIn font-sans" id="workspace-security">
              
              {/* Grid with system backups snapshot controls + administrative password changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Backups database Snapshot manager */}
                <div className="bg-white border border-pistachio-light/35 p-6 rounded-3xl space-y-4">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide text-luxury-dark uppercase flex items-center gap-1.5"><Database className="w-5 h-5 text-pistachio" /> {t("System Dump Snapshots")}</h3>
                    <span className="text-[8px] font-mono uppercase text-gray-400 block block-margins-dense">{t("Generate dry files state backup to comply with trade cert constraints")}</span>
                  </div>

                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    {t("Instantly save states of products catalog directories, Rfq enquiries and system logs. Snapshot are secure and stored locally, instantly rolled back on mismatch.")}
                  </p>

                  <button 
                    onClick={executeBackup}
                    className="bg-pistachio text-white font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl cursor-pointer"
                  >
                    {t("+ Export Global Database Snapshot")}
                  </button>

                  <div className="border-t border-pistachio-light/20 pt-4 space-y-2">
                    <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">{t("Rollback snapshot anchors")} ({backups.length})</span>
                    
                    <div className="space-y-2 max-h-48 overflow-auto pe-1">
                      {backups.map(item => (
                        <div key={item.fileName} className="bg-cream/25 border border-pistachio-light/20 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono text-start">
                          <div>
                            <span className="font-bold text-luxury-dark text-[11px] select-all block">{item.fileName}</span>
                            <span className="text-[8.5px] text-gray-400 block mt-0.5">{t("Size")} {item.size} • Gen {item.timestamp.substring(11,19)}</span>
                          </div>
                          <button
                            onClick={() => executeRestore(item.fileName)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-mono text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            {t("Restore")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Credentials password changes */}
                <div className="bg-white border border-pistachio-light/35 p-6 rounded-3xl space-y-4">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide text-luxury-dark uppercase flex items-center gap-1.5"><Key className="w-4.5 h-4.5 text-pistachio" strokeWidth="2.5" /> {t("Rotate Intranet Keyphrase")}</h3>
                    <span className="text-[8px] font-mono uppercase text-gray-400 block block-margins-dense">{t("Keep credentials compliant with trade audit rules")}</span>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4" id="pass-rotate-form">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="rot-pass" className="text-[9px] uppercase font-mono text-gray-400">{t("Fresh Password pass-key")}</label>
                      <input 
                        id="rot-pass" type="password" required value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("Must contain 8 characters minimum...")}
                        className="border border-pistachio-light/40 px-3 py-2 text-xs rounded-xl outline-none"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-luxury-dark text-white font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl cursor-pointer"
                    >
                      {t("✓ Commit Rotated Keyphrase")}
                    </button>
                  </form>

                  {/* SEO settings card integration */}
                  <div className="border-t border-pistachio-light/25 pt-4 space-y-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">{t("Sitemaps & SEO Index configurations")}</span>
                      <span className="text-[8px] text-gray-400 block">{t("Deploy search engine title tags and index descriptors")}</span>
                    </div>

                    <form onSubmit={handleUpdateSEO} className="space-y-3" id="seo-update-form">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="seo-metatitle" className="text-[8.5px] font-mono text-gray-400">{t("Search Engine Meta Title")}</label>
                        <input 
                          id="seo-metatitle" type="text" value={seo.metaTitle}
                          onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                          className="border border-pistachio-light/30 bg-white px-3 py-1.5 text-xs rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="seo-metadesc" className="text-[8.5px] font-mono text-gray-400">{t("Search Engine Meta Description")}</label>
                        <textarea 
                          id="seo-metadesc" rows={2} value={seo.metaDescription}
                          onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                          className="border border-pistachio-light/30 bg-white px-3 py-1.5 text-xs rounded-xl outline-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-pistachio text-white font-mono text-[9px] font-bold uppercase px-3 py-2 rounded-xl cursor-pointer"
                      >
                        {t("Deploy SEO Metadata Tags")}
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* Cybersecurity terminal telemetry logs */}
              <div className="bg-luxury-slate text-white border border-white/5 p-6 rounded-3xl font-mono text-xs space-y-3 shadow-md" id="admin-security-logs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-pistachio" />
                    <span className="font-bold text-[10.5px] uppercase tracking-wider text-pistachio">{t("Intranet Entry & Security Audit Telemetries")}</span>
                  </div>
                  <button 
                    onClick={() => triggerDataLoads()}
                    className="text-[9.5px] font-bold uppercase bg-gray-800 hover:bg-gray-700 hover:text-pistachio text-gray-300 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                  >
                    {t("Refresh Stream Logs")}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pe-2 divide-y divide-gray-800/20 text-[10px] leading-relaxed text-start">
                  {logs.length === 0 ? (
                    <span className="text-gray-500 italic">{t("Audit log initialized empty. No events registered.")}</span>
                  ) : (
                    logs.map(log => {
                      let tagColor = "text-gray-400";
                      if (log.level === "ALERT") tagColor = "text-rose-400 font-bold";
                      if (log.level === "SECURITY") tagColor = "text-amber-400 font-bold";
                      if (log.level === "INFO") tagColor = "text-[#acd28f]";

                      return (
                        <div key={log.id} className="pt-1.5 pb-1 select-text">
                          <span className="text-gray-500">[{log.timestamp.substring(11, 19)}]</span> &nbsp;
                          <span className={tagColor}>[{log.level}]</span> &nbsp;
                          <span className="text-cyan-400 font-bold">({log.ip})</span> &nbsp;
                          <span className="text-white font-sans">{t(log.details)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Custom simple helper for generating nice coordinate points inside line path equations on SVGs
function generateSVGPath(data: VisitorAnalytics[], key: "uniqueVisitors" | "pageViews", width: number, height: number, closeToBottom = false): string {
  if (data.length === 0) return "";
  const stepX = width / (data.length - 1 || 1);
  const maxVal = key === "uniqueVisitors" ? 300 : 1500;
  
  const points = data.map((item, index) => {
    const x = index * stepX;
    const rawValue = item[key] || 0;
    const y = height - ((rawValue / maxVal) * 160 + 30);
    return `${x},${y}`;
  });

  if (closeToBottom) {
    return `M0,${height} L${points.join(" L")} L${width},${height} Z`;
  }
  return `M${points.join(" L")}`;
}

// Modular visual attachment modal previewer
function attachmentViewer(attachmentUrl: string | null, onClose: () => void, t: any) {
  if (!attachmentUrl) return null;
  return (
    <div className="bg-luxury-dark border-2 border-pistachio-light/40 p-6 rounded-3xl text-white relative animate-fadeIn" id="document-preview-card">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 bg-white/10 hover:bg-rose-600 hover:text-white text-gray-300 rounded-xl px-3 py-1.5 text-[10px] font-mono font-bold cursor-pointer transition-all border border-white/5"
      >
        {t("Close Document Previewer")}
      </button>

      <h4 className="text-[10.5px] font-mono uppercase tracking-widest text-[#acd28e] font-bold flex items-center gap-1.5 mb-3">
        <ShieldCheck className="w-5 h-5 text-pistachio" /> {t("Vetted Importer Cargo Certification File")}
      </h4>

      <div className="max-w-2xl bg-white p-4 h-96 rounded-2xl overflow-auto flex justify-center items-center shadow-inner text-start">
        {attachmentUrl.startsWith("data:application/pdf") ? (
          <div className="text-center text-luxury-dark font-mono text-[10.5px]">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gold animate-bounce" />
            <span className="font-bold text-luxury-dark uppercase">{t("PDF Base64 Encryption Verified")}</span>
            <p className="text-gray-400 text-[9px] mt-1">{t("Binary compliance seal is active inside container memory sandbox. Payload size: ")} {attachmentUrl.length} symbols.</p>
          </div>
        ) : (
          <img src={attachmentUrl} alt={t("Attached certified standard certificate document")} className="max-h-full max-w-full object-contain border border-gray-100" referrerPolicy="no-referrer" />
        )}
      </div>
    </div>
  );
}

// Floating notification helper
function notificationBubble(messageNotice: { type: "success" | "error"; text: string } | null) {
  if (!messageNotice) return null;
  return (
    <div 
      className={`p-4 border text-white rounded-3xl mb-8 flex gap-3 text-xs font-mono animate-fadeIn ${
        messageNotice.type === "success" 
          ? "bg-[#6c9c48] border-[#81b55a]/40" 
          : "bg-rose-600 border-rose-500/40"
      }`} 
      id="notification-bubble"
    >
      <Award className="w-5 h-5 text-white/90 shrink-0" />
      <span>{messageNotice.text}</span>
    </div>
  );
}
