# 👑 Eslami Global Trading — Enterprise Production Deployment Guide
## راهنمای استقرار و مدیریت زیرساخت‌های سازمانی بازرگانی اسلامی

---

### ENGLISH SECTION (EN)

This guide documents the enterprise-grade production infrastructure designed for the **Eslami Global Trading Platform**. This architecture scales from a single hardened Ubuntu server to a high-availability multi-node container orchestration topology.

---

### 1. ONE-CLICK PRODUCTION INSTALLER
The `install.sh` script automates the complete provisioning, compilation, database migration, and routing security setup on a clean **Ubuntu 20.04/22.04+ LTS** VPS.

#### Execution Command
```bash
sudo bash install.sh
```

#### Automated Pipelines Covered:
*   **Apt Syncs & Packages**: Sets up compiler utilities (`build-essential`), `fail2ban`, `ufw`, and `nginx`.
*   **Node.js 22 LTS & PM2 Deployment**: Resolves runtime packages and locks process persistence.
*   **PostgreSQL 16 Engine Configuration**: Sets up database and creates dedicated users.
*   **Redis Cache Subsystem**: Provisions caching cluster boundaries.
*   **Secure Environment generation**: Generates cryptographically secure JWT and session cookies.
*   **Prisma Migration & Seeds**: Synchronizes SQL structural schemas and triggers seeds.
*   **Hardened Nginx Proxy**: Configures SSL terminations and optimized request bufferes.
*   **Network Firewalling**: Configures UFW access ports.

---

### 2. ENTERPRISE POSTGRESQL & PRISMA MATRIX
*   **SCRAM-SHA-256 Authentication**: Plaintext pass tables are forbidden. Postgres is config-hardened to use salted scram-sha-256 password hashing.
*   **Extension Ecosystem**: Uses standard geographic indices and fast cryptographic decryptions:
    -   `pgcrypto`: High-compliance binary password hash generation.
    -   `pg_trgm`: Weighted fuzzy Trigram searches across multilingual catalogs.
    -   `btree_gin`: Fast, indexed complex array lookups for commodity categories.
*   **Safe Schema Synchronizations**:
    -   Generate runtime client types: `npx prisma generate`
    -   Execute safe migrations: `npx prisma migrate deploy`
    -   Initialize seed records: `npx prisma db seed`

---

### 3. REDIS MEMORY EVICITION & BUFFERING
Redis acts as the core key-value session cache, API rate limiter, and task queue broker.
*   **Memory Policy**: Capped at `256mb` inside `/etc/redis/redis.conf`.
*   **Eviction**: Set to `allkeys-lru` (Least Recently Used) to prevent RAM crashes when rate limits trigger.
*   **Persistence**: Activated standard AOF (`appendonly yes`) saving transaction logs to disk in real time.

---

### 4. MULTI-TIER PROCESS TOPOLOGY (PM2 CLUSTERS)
Operations are split into three isolated services inside `ecosystem.config.js` to decouple API traffic from background task execution:
1.  **`eslami-web`**: Running in `cluster` mode spanning CPUs. Serves dynamic JSON APIs and client bundles.
2.  **`eslami-worker`**: Running in `fork` mode. Constantly consumes background DB queues (`Job` tables) executing AI analyses, report exports, and media compressions.
3.  **`eslami-scheduler`**: Running in `fork` mode. Coordinates cron schedules, adding jobs to the database queue when due.

---

### 5. AUTOMATED OPERATION & DISASTER RECOVERY
Two zero-dependency backup utilities are bundled in the system:
*   **Automated Backups (`backup.sh`)**:
    -   Creates a Postgres dump using authenticated `pg_dump`.
    -   Zips `/uploads` media files and system files.
    -   Reviews file size and checksum.
    -   Clears snapshots older than 30 days.
    -   Runs daily at **02:00 AM** automatically via Crontab.
*   **Surgical Restore Panel (`restore.sh`)**:
    -    Provides interactive file selection of available snapshots.
    -    Drops current schemas, restores SQL table entries cleanly via `psql`.
    -    Overwrites local media assets and initiates rolling reloads on PM2 threads.

```bash
# Force an immediate manual cold snapshot
bash backup.sh

# Open the interactive rollback recovery wizard
sudo bash restore.sh
```

---

### 6. HIGH-AVAILABILITY (HA) & FAILOVER ARCHITECTURES
As traffic scales internationally, transition from a single VPS to this high-availability topology:

```
                            [ Active Cloudflare DNS ]
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
          [ Hardened Nginx LB 01 ]              [ Hardened Nginx LB 02 ]
          (Keepalived Virtual IP)               (Keepalived Virtual IP)
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
          ┌────────────────────────────┴────────────────────────────┐
          ▼                                                         ▼
  [ App Node 01 - PM2 ]                                     [ App Node 02 - PM2 ]
  (Express Server API)                                      (Express Server API)
          │                                                         │
          └────────────────────────────┬────────────────────────────┘
                                       ▼
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [ Redis HA Sentinel (Master) ]        [ Redis HA Sentinel (Replica) ]
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [ PostgreSQL Master Database ]       ──►  [ PostgreSQL Hot Standby ]
          (pg_auto_failover / Barman)             (Read-Only Replication Node)
                    │
                    ▼
          [ Shared Mount: S3 / GlusterFS ]
              (Media Assets & RFQs)
```

#### Failover Strategies:
1.  **PostgreSQL Replication**: Configure multi-regional streaming replication. Use standard pg_auto_failover to promote hot standby nodes within seconds of partition splits.
2.  **Redis Sentinel Cluster**: Spin up 3 Sentinel instances to run health checks on Master nodes and handle automatic failovers.
3.  **Media Upload Storage**: Transition `STORAGE_PROVIDER` inside `.env` from `LOCAL_DISK` to AWS S3/Cloudflare R2 to distribute static files.

---
---

### بخش فارسی (FA)

این سند توصیف‌کننده معماری زیرساخت استقرار و مدیریت پلتفرم بازرگانی اسلامی است. این سیستم قابلیت مقیاس‌پذیری از یک سرور خام تا خوشه‌بندی توزیع‌شده با قابلیت اطمینان بالا (HA) را داراست.

---

### ۱. راه‌انداز خودکار کل سیستم (یک‌کلیک)
سند `install.sh` فرآیند کامل راه‌اندازی، کامپایل، تست و مهاجرت دیتابیس را بر روی سرور جدید **Ubuntu OS** به طور خودکار انجام می‌دهد.

#### فرمان اجرا
```bash
sudo bash install.sh
```

---

### ۲. پایگاه داده امن PostgreSQL و مهاجرت تجمعی Prisma
*   **رمزنگاری پپیشرفته SCRAM-SHA-256**: استفاده از روش‌های منسوخ ذخیره سالت ممنوع شده است. ارتباطات بومی با پایگاه‌داده از استاندارد رمزنگاری SCRAM بهره می‌برند.
*   **افزونه‌های فعال‌شده در هسته پایگاه‌داده**:
    -   `pgcrypto`: بازشناسی عبارات رمزنگاری شده.
    -   `pg_trgm`: جستجوهای چندزبانه سریع و وزن‌دهی شده ترایگرام (Trigram) روی نام و کدهای کالا.
    -   `btree_gin`: اندیس‌گذاری با کارایی استثنایی برای جستجوی آرایه‌های دسته‌بندی محصولات.

---

### ۳. سرویس کش کارآمد Redis
کش هوشمند سیستم جهت ذخیره متغیرهای توانا، سشن‌ها و محدودکننده‌های نرخ دسترسی (Rate-Limits) به شرح زیر پیکربندی شده است:
*   **سیاست آزادسازی حافظه**: تخصیص سقف حافظه `256mb` و فعال‌سازی متد `allkeys-lru` جهت پیشگیری از خطای سرریز رم.
*   **ذخیره‌سازی پایا AOF**: فعال‌سازی فرآیند لاگ برداری همزمان تغییرات بر روی دیسک با هدف حفظ تمام سشن‌ها در زمان بروز ريبوت.

---

### ۴. تفکیک‌سازی لایه‌های سیستم پردازشی (PM2)
جهت آزادسازی توان پردازشی سرور و عدم تداخل ترافیک وب با کارهای پس‌زمینه، فرآیندها به سه لایه مجزا در `ecosystem.config.js` تقسیم شده‌اند:
1.  **`eslami-web`**: اجرای نسخه وب ترافیک HTTP به حالت کلاستر چندرشته‌ای.
2.  **`eslami-worker`**: پردازشگر صفوف کارهای سنگین نظیر هوش مصنوعی بازرگانی، خروجی گزارشات پیشرفته و پردازش تصاویر.
3.  **`eslami-scheduler`**: هماهنگ‌کننده برنامه کرون‌های مدیریتی و ارجاع آن به هسته صف دیتابیس.

---

### ۵. مدیریت خودکار کپی‌های پشتیبان و احیای اضطراری
سیستم به دو ابزار کارآمد بدون نیاز به وابستگی جانبی مجهز است:
*   **سیستم کپی پشتیبان خودکار (`backup.sh`)**:
    -   تهیه خروجی فشرده تراکنشی دیتابیس با ابزار `pg_dump`.
    -   فشرده‌سازی پوشه‌های مالتی‌مدیا و فایلهای پیوست RFQ در مسیر `/uploads`.
    -   انجام تست سلامت حجم فایل آرشیو و پاکسازی اتوماتیک آرشیوهای قدیمی‌تر از ۳۰ روز.
    -   فعال در کرون جاب سیستم رأس ساعت **۰۲:۰۰ صبح** هر روز.
*   **کنترل پنل بازگردانی اضطراری (`restore.sh`)**:
    -   امکان انتخاب نسخه از میان آرشیوهای موجود به صورت تعاملی.
    -   پاکسازی اتوماتیک داده‌های جاری و بازنشانی دیتابیس و فایل‌های فیزیکی آپلود شده.
    -   ريلود همزمان پراسس‌های PM2 بدون کوچکترین قطعی سیستم.

---

### ۶. معماری مقیاس‌پذیری و توازن بار (Topology High-Availability)
هر زمان که حجم تراکنش‌های بین‌المللی افزایش یافت، زیرساخت تک‌سروری را به این الگو گسترش دهید:
*   **اتصال پایگاه داده**: با فعال‌سازی پایگاه‌های داده Slave و مکانیزم Replication به صورت Master-Standby پایداری داده‌ها را گارانتی کنید.
*   **سرویس توزیع‌شده آپلودها**: مقدار پارامتر `STORAGE_PROVIDER` را در فایل تنظیمات به AWS S3 تغییر داده تا از فضای ذخیره‌سازی ابری توزیع‌شده بهره ببرید.
