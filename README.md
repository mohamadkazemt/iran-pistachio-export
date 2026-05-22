# Eslami Global Trading — Sovereign Trade, Purity & Logistics
### بازرگانی اسلامی — پرتال توسعه صادرات، هوش گمرکی و مدیریت بین‌المللی کالا

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge&logo=git" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Framework-React%2018%20%2B%20Vite-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-dimgray?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/AI-Gemini%203.5--Flash-indigo?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/SSL-Secured--256bit-gold?style=for-the-badge" alt="SSL Secured" />
</p>

---

## 🌎 Overview / پیش‌گفتار

### **English (EN)**
**Eslami Global Trading // بازرگانی اسلامی** is an enterprise-grade full-stack digital gateway designed to showcase high-purity agricultural exports (such as Premium Saffron, Pistachio, and dried reserves) to global markets. Engineered with a luxurious slate-and-gold visual style, it facilitates seamless lead generation through an advanced **Incoterms 2020 Cargo RFQ engine**, real-time secure messaging, system backups, and an intelligent **AI Trade Advisor powered server-side by the Gemini 3.5 API**.

### **فارسی (FA)**
**هلدینگ بازرگانی اسلامی** سامانه مدیریت لجستیک، تحلیل هوشمند گمرکی و پرتال نمایش و فروش کاتالوگ محصولات فوق‌لوکس کشاورزی (پسته دست‌چین اکبری، زعفران سرگل ارگانیک و فرآورده‌های ممتاز صادراتی) است. این پلتفرم مجهز به موتور اختصاصی صدور درخواست مظنه قیمت (RFQ) منطبق بر قوانین اینکوترمز ۲۰۲۰، پشتیبانی پیشرفته تمام رمزنگاری شده، میز هوش بازرگانی و داوری استانداردهای گمرکی بین‌الملل با استفاده از ظرفیت پردازش سرور-ساید **مدل هوش مصنوعی Gemini 3.5** می‌باشد.

---

## ⚡ Automated One-Click Production Deployment / نصب و راه‌اندازی خودکار تنها با یک دستور

### **English (EN)**
Deploy our fully autonomous installation directly on a clean **Ubuntu Server (v20.04LTS / v22.04LTS / v24.04LTS)** in under 5 minutes. If no local project directory is detected, the installer automatically installs Git, clones the repository, checks out the specified branch, writes production configurations, compiles the Vite static bundles, launches safe PM2 cluster pools, registers Let's Encrypt SSL certificates, configures UFW firewall restrictions, and engages Fail2ban brute-force blockades under absolute zero-downtime guidelines.

Execute this command as the root user:
```bash
# Option A: One-line direct execution
bash <(curl -fsSL https://raw.githubusercontent.com/m-torkzade/eslami-global-trading/main/install.sh)

# Option B: Standard curl pipelining
curl -fsSL https://raw.githubusercontent.com/m-torkzade/eslami-global-trading/main/install.sh | bash
```

### **فارسی (FA)**
امکان استقرار همه‌جانبه‌ی این سامانه روی **سرورهای خام لینوکس اوبونتو** به صورت کاملاً خودکار در کمتر از ۵ دقیقه فراهم گردیده است. در صورتی که فایل‌های پروژه روی سرور موجود نباشد، نصب‌کننده هوشمند ابتدا اقدام به نصب گیت کرده، مخزن گیت‌هاب را شبیه‌سازی (Clone) می‌کند، کدهای پروداکشن را بیلد کرده، فرآیندهای پس‌زمینه PM2 را خوشه‌بندی کرده، فایروال سرورUFW و سیستم حفاظتی Fail2ban را فعال نموده و نهایتاً گواهینامه امنیتی رایگان SSL Let's Encrypt را برای دامنه شما صادر و متصل می‌کند.

کافی‌ست دستور زیر را به عنوان کاربر ارشد سیستم (`root`) خط فرمان اوبونتو وارد نمایید:
```bash
# روش اول: اجرای تک خطی مستقیم از گیت‌هاب
bash <(curl -fsSL https://raw.githubusercontent.com/m-torkzade/eslami-global-trading/main/install.sh)

# روش دوم: با استفاده از لوله‌کشی استاندارد curl 
curl -fsSL https://raw.githubusercontent.com/m-torkzade/eslami-global-trading/main/install.sh | bash
```

---

## 🧭 Project Architecture / ساختار فایل‌های پروژه

```
.
├── server.ts                 # Full-stack Express server coordinating APIs, backup schedules, and Gemini proxy
├── install.sh                # Linux primary auto-installer & dependency compiler
├── update.sh                 # Zero-downtime rolling pull, rebuild, and node reloader
├── restart.sh                # Graceful service restarter script
├── backup.sh                 # Local system snapshots packager
├── logs.sh                   # Real-time PM2 log monitoring interface
├── ecosystem.config.js       # PM2 multi-instance clustering settings
├── nginx.conf                # Nginx TLS/SSL & HTTP-to-HTTPS redirect templates
├── src/
│   ├── App.tsx               # Client router root controlling the slate layouts
│   ├── main.tsx              # React mounting root
│   ├── db.ts                 # Multi-lingual local system database controller file
│   ├── db.json               # Seed content, metadata registries, & admin login accounts
│   ├── types.ts              # Global TypeScript strict interface definitions
│   └── components/
│       ├── Header.tsx        # High-precision responsive header supporting RTL/LTR alignment controls
│       ├── AdminPanel.tsx    # Administrator lead tracking & database modification center
│       ├── InquiryAgent.tsx  # Server-side Gemini intelligence chat workspace
│       ├── RfqForm.tsx       # Dynamic RFQ creation wizard including Incoterms selectors
│       └── ...
```

---

## 🔑 Administrative Control Cockpit / میز مدیریت پیشرفته

The administrative dashboard allows trade directors to modify default system variables, download generated lead attachments under strict safety filters, view login auditing streams, and manage system databases.

* **Admin Access URL:** `https://your-domain.com/admin` (or click top "Operator Login" icon)
* **Default Setup Credentials:**
  * **Username / نام کاربری:** `admin`
  * **Password / رمز عبور:** `Admin123456!`

> ⚠️ **SECURITY RECOMMENDATION / توصیه امنیتی مهم**:
> Upon first successful login, navigate to the **System Backups & Credentials Settings** panel inside the admin dashboard and instantly rotate your cryptographic password passphrase. This will terminate all stale active token sessions globally.

---

## 🤖 Server-Side Gemini Intelligence Suite / هوش مصنوعی و اتصالات شبکه

Importers can communicate with the server-side **Eslami Global Trade IQ Desk** chatbot to navigate Complex Customs Regulations, Quarantine Certifications, HS-Codes indexing, and shipping channels.

To ensure third-party developer secrets remain strictly secure, all AI queries are routed server-side through `server.ts`. Client components never have visibility over the private key.

### Configuration (`.env` properties):
Make sure to expose your key inside the root `.env` config file:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=YOUR_SECURE_GOOGLE_GEMINI_KEY
```

---

## 👥 Multilingual Brand Formats / شناسه‌های رسمی برند

These brand naming matrices are deeply integrated into the SEO, JSON-LD, schema data, and mobile layouts:

| Language | Official Brand Representation | Target Focus |
| :--- | :--- | :--- |
| **Persian (Primary)** | **بازرگانی اسلامی** | هویت رسمی ثبت شده و کاتالوگ داخلی صادراتی |
| **English (Global)** | **Eslami Global Trading** | International corporate procurement and transport |
| **English (Alternative)** | **Eslami Trading** | Supply chain listings and clearance schedules |
| **English (Direct Export)** | **Eslami Global Export** | Saffron and premium pistachio export pipeline |

---

## 📄 Documentation Directory System / راهنماهای گام‌به‌گام و مراجع فنی

For itemized walkthroughs and configurations, consult the specialized files below:

1. **[DATABASE_ARCHITECTURE.md (Enterprise DB & Hardening Blueprint)](./docs/DATABASE_ARCHITECTURE.md)** — Comprehensive review of PostgreSQL schemas, GIN weighted search indices, range partitioning strategy, security controls, and data migration roadmap.
2. **[README_FA.md (راهنمای جامع فارسی)](./README_FA.md)** — مستندات کامل گام‌به‌گام پیکربندی و نگهداری فرآیند توسعه لایه فرانت‌اند و بک‌اند به زبان شیرین فارسی.
3. **[README_EN.md (English Operations Guide)](./README_EN.md)** — Complete step-by-step developer walkthrough for the full-stack portal in English.
4. **[DEPLOYMENT.md (Advanced Server Infrastructure)](./DEPLOYMENT.md)** — In-depth configurations for running under systemd, reverse proxies, and continuous integration engines.
5. **[SECURITY.md (Cybersecurity Matrix & Hardening)](./SECURITY.md)** — Guide to active security setups including Fail2ban, Rate Limiting, CORS headers, CSRF validation, and input sanitation.
6. **[BACKUPS.md (Data Reprepositories & Restoration)](./BACKUPS.md)** — Details regarding local JSON-LD databases backends, backup cron schedules, and disaster recovery.

---

<p align="center">
  <b>Designed with integrity in Kerman, Tehran & Rafsanjan</b><br>
  <i>Eslami Global Trading Corporation © 2026. All rights global-shipping secure.</i>
</p>
