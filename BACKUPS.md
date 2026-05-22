# Eslami Global Trading — Data Backups & Disaster Recovery Guide
### بازرگانی اسلامی - راهنمای پشتیبان‌گیری و بازیابی پایگاه‌داده

This operations runbook details backup schedules, local snapshots compilation, automated cron routines, and emergency recovery checklists for **Eslami Global Trading // بازرگانی اسلامی**.

---

## 🗄️ Database Architecture

The system uses a highly portable, file-based JSON database engine located at:
* **Production Database Path:** `./src/db.json` (Default seeded schema)
* **Pre-bundled Runtime State:** Fully synchronized with our Node Express runtime thread upon service start.

All modifications made in the CMS or administrative dashboard (such as creating compliance whitepapers, changing RFQ pipeline statuses, updating phone numbers and addresses, or rotating credentials) are written to this file with safety logs.

---

## 💾 Backup Strategy & Operations

### 1. Manual Backup Compilation
To generate an immediate, compressed tarball snapshot of your active database, assets, configurations, and environment parameters, trigger the automated backup utility script:

```bash
bash backup.sh
```

**What is compressed in this snapshot?**
- Active CMS variable inputs and log registries (`./src/db.json`)
- Product catalogs and certification attachments (`./src/components/*`)
- Inbound leads database indexes and media attachments.
- Operational config files (`.env`, `ecosystem.config.js`)

**Target Snapshot Location:**
Compressed snapshots are saved in `./backups/` using the format `eslami_backup_YYYYMMDD_HHMMSS.tar.gz`.

---

### 2. Automated Scheduled Backups (Cron Engine Setup)
To automate the backup process, schedule a daily cron job to run our backup utility and save snapshots to secure storage.

Open the system cron table using:
```bash
sudo crontab -e
```

Add this line to schedule a daily backup at **02:00 AM UTC**:
```cron
0 2 * * * cd /var/www/eslami-global-trading && bash backup.sh > /dev/null 2>&1
```

*Note: Change `/var/www/eslami-global-trading` to match your actual server directory path.*

---

## 🚨 Emergency Disaster Recovery Routine

If the database becomes corrupted, server hardware fails, or security settings are compromised, follow these recovery procedures:

### Checklist A: Quick Restoration via Admin Dashboard (Recommended)
1. Log into your Administrative Dashboard at `/admin`.
2. Scroll to the **Recovery Registry & Database Archives** panel.
3. Select your target backup from the backups grid list.
4. Click **Securely Restore Live Db Archive**.
5. The system will swap active database parameters instantly without requiring a server reboot.

---

### Checklist B: Manual Server Command Line Recovery
If the server's operating system crashes, provision a fresh virtual machine using `install.sh`, retrieve your backup tarball, and execute these commands:

```bash
# 1. Stop the active PM2 process cluster
pm2 stop eslami-global-trading-app

# 2. Extract your backup snapshot archive over the production directory
# (Assuming your path is /var/www/eslami-global-trading)
tar -xzf ./backups/eslami_backup_20260522_084530.tar.gz -C /var/www/eslami-global-trading/

# 3. Restore ownership rights
sudo chown -R root:root /var/www/eslami-global-trading/

# 4. Clean previous production builds and compile the restored states
npm run build

# 5. Hot restart all instance threads safely
pm2 start ecosystem.config.js || pm2 reload eslami-global-trading-app
```

---

## 💎 Long-term Cloud Storage Offloading Template
For high-availability enterprise environments, transfer snapshots to external secure cloud storage buckets (such as Google Cloud Storage or Amazon S3) regularly.

### Example transfer script (`upload-backups.sh`):
```bash
#!/usr/bin/env bash
# Trigger backup script
bash backup.sh

# Target Google Cloud Storage bucket
TARGET_BUCKET="gs://eslami-global-backups-bucket"

# Find latest generated tarball
LATEST_ZIP=$(ls -t ./backups/eslami_backup_*.tar.gz | head -n1)

# Upload to Bucket
gsutil cp "$LATEST_ZIP" "$TARGET_BUCKET/"
```

---
<p align="center">
  <b>Designed with absolute integrity. Eslami Global Trading Corporation © 2026.</b>
</p>
