# Eslami Global Trading — Full-Stack Corporate Portal & Logistics Engine

Official, developer-friendly guide detailing the local setup, architectural modules, production operations, and server administration protocols of **Eslami Global Trading // بازرگانی اسلامی** portal.

---

## ⚡ Quick One-Click Linux Provisioner

For rapid server setups on a clean Ubuntu Server (v20.04LTS/v22.04LTS/v24.04LTS), execute our optimized setup bash script as user `root` to configure your packages, establish system environment pools, compile source targets, start auto-reloading service clusters, rate limit ports, and secure SSL certifications automatically:

```bash
sudo bash install.sh
```

---

## 🧭 Functional Core Modules

Eslami Global Trading utilizes an integrated SPA Client (Vite, React 18, Tailwind, Lucide, Framer Motion) + Stateful Node/Express runtime container stack.

1. **Auto-Aligning RTL Header**: Dynamically repositions information banners, navigation menus, and grid layouts when shifting to the Persian (RTL) mode.
2. **Dynamic Cargo RFQ Wizard**: Captures prospective leads via detailed form inputs validating under International Commerce Incoterms 2020 rules (FOB, CIF, EXW, CFR) with rigid schema parsing.
3. **Phytosanitary & Sourcing Knowledge Desk**: Multi-lingual, server-side AI-powered interface responding instantly to legal maritime queries (Certificate compliance, moisture holds, toxic aflatoxins thresholds, HS-codes).
4. **Operations Command Center (Admin)**: Real-time leads tracker enabling operators to change pipeline states, flag calculated spam risk scores, view SSL logs, and configure CMS defaults.

---

## 🔑 Operator Authentication Details

Administrative controls can be accessed via the UI by click on **Operator Login** inside the header, or referencing the cockpit directly:

* **Cockpit Hyperlink:** `https://your-domain.com/admin`
* **Default Setup Keypass Parameters:**
  * **Operator Username:** `admin`
  * **Operator Keypass Phrase:** `Admin123456!`

> ⚠️ **CRITICAL SECURITY NOTICES**:
> Once logged in, scroll immediately down toward the **System Configuration / Change Password** sub-module, declare a complex password, and execute the rotation command. This flushes the secure JWT cookie verification payload internationally and prevents unauthorized back-access.

---

## 🤖 Gemini AI Config & Server Proxy setup

To retain enterprise API credentials securely, query completions are managed on the Express backend (`server.ts` routes). The web UI requests answers through `/api/chat` proxies without exposing secrets in public JS bundles.

Initialize the API configuration inside your default `.env` properties:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=AIzaSyA_YourGoogleGeminiApiKeySecureString
```

---

## 🛠️ Local Development & Compiler Sequences

To run double-ended hot developments or trace live network structures locally:

```bash
# 1. Package install
npm install

# 2. Start full-stack proxy systems (tsx server.ts maps Vite middleware seamlessly)
npm run dev
```
The client serves at `http://localhost:3000`. Once finished, run compilation optimization commands:
```bash
# Builds static output assets and bundles backend scripts
npm run build
```

---

## 📁 System Files & Backup Management

All database actions and structural settings persist bimonthly in a single JSON file. This guarantees painless server relocations:
- **Registry File Location:** `./src/db.json`
- **Dynamic Snapshots:** Leverage our operational shell utility to compress current indices, logs, certificates, and settings into timestamped tarballs:
```bash
bash backup.sh
```
Files compile as `./backups/eslami_backup_<TIMESTAMP>.tar.gz`. Move these to non-volatile object storage grids regularly.

---

## 🚨 Troubleshooting Guidelines

### 1. The Gateway Renders a 502 Bad Gateway Output
* **Cause:** The Express backend service is offline, or binding port 3000 is occupied.
* **Resolution:** Run `bash logs.sh` to check startup logs. Force restart utilizing `bash restart.sh` to free port processes.

### 2. Live AI Advisor Responds with Network Error Timed Out
* **Cause:** The Google API has throttled requests or the environmental property `GEMINI_API_KEY` is not matching requirements.
* **Resolution:** Ensure node is running under `NODE_ENV=production` and `.env` has no empty characters. Use `journalctl -u eslami` to check operating logs.

---

## 📝 Brand Alignment Metrics

Ensure these brand nomenclatures are honored across all collateral materials, emails, SEO schema metadata descriptions, and OpenGraph components:
* **Official Persian:** بازرگانی اسلامی
* **Official English:** Eslami Global Trading
* **Corporate Exports Unit:** Eslami Global Export
* **Root Domain Sourcing:** `eslamiglobal.com`

---
<p align="center">
  <b>High-Integrity Global Trade Analytics for Sovereigns & Enterprises</b><br>
  Eslami Global Trading Corporation © 2026. All rights secured.
</p>
