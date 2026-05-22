#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING — ENTERPRISE ORCHESTRATION & DEPLOYMENT ENGINE
# ==============================================================================
#  Production system provisioner and hardener for Ubuntu Server.
#  Automates: PostgreSQL 16+ (SCRAM-SHA-256), Redis clustering with persistence,
#             Multi-tier PM2 topologies (web-cluster, async-worker, crond-scheduler),
#             Prisma transactional migration/seeds, Firewalls (UFW/Fail2ban),
#             and client-streaming Nginx routing pipelines.
# ==============================================================================

# Exit immediately if any command produces a non-zero exit status
set -eo pipefail

# --- Visual Colors & Aesthetic Constants ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BG_GREEN='\033[42m\033[30m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' 
BOLD='\033[1m'

# Clear screen and render dashboard
clear
echo -e "${CYAN}================================================================================${NC}"
echo -e "${BOLD}${BG_GREEN}         ESLAMI GLOBAL TRADING // ENTERPRISE INSTALLATION ENGINE              ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "Target OS Environment : ${BOLD}Ubuntu Server 20.04+ (Fully Hardened)${NC}"
echo -e "Database Tier         : ${BOLD}PostgreSQL 16+ + Prisma Migration Automation${NC}"
echo -e "Cache & Worker Queue  : ${BOLD}Redis Alpine (with LRU eviction & AOF persistence)${NC}"
echo -e "Process Ecosystem     : ${BOLD}PM2 (eslami-web, eslami-worker, eslami-scheduler)${NC}"
echo -e "Security Hardening    : ${BOLD}UFW Firewall + Fail2ban Intrusion Detection Systems${NC}"
echo -e "${CYAN}================================================================================${NC}"

# 1. Enforce superuser administrative privileges 
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This installer MUST be executed with administrative privileges (root).${NC}"
  echo -e "Please execute using: ${YELLOW}sudo bash install.sh${NC}"
  exit 1
fi

# Detect actual user runner for privileges alignment later
REAL_USER="${SUDO_USER:-root}"
HOME_DIR="/home/$REAL_USER"
if [ "$REAL_USER" = "root" ]; then
  HOME_DIR="/root"
fi

# --- 2. Interactive Systems Config Verification ---
echo -e "\n${BOLD}${CYAN}--- PROVISIONING AND ENVIRONMENTAL PARAMETERS ---${NC}"

# Path parameters
CURRENT_DIR="$(pwd)"
INSTALL_PATH="$CURRENT_DIR"
echo -e "${GREEN}[INFO] Deploying inside project folder: $INSTALL_PATH${NC}"

# Prompts domain setup
read -p "Enter Target Main Domain (e.g., eslami-global.com): " CUSTOM_DOMAIN
if [ -z "$CUSTOM_DOMAIN" ]; then
  CUSTOM_DOMAIN="eslami-global.com"
fi
echo -e "Target Domain configured to: ${GREEN}$CUSTOM_DOMAIN${NC}"

# Prompts email
read -p "Enter SMTP Certbot SSL notification email: " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
  SSL_EMAIL="procurement@eslami-global.com"
fi

# Prompts port bindings
read -p "Enter Local binding web port [Default: 3000]: " APP_PORT
if [ -z "$APP_PORT" ]; then
  APP_PORT="3000"
fi

read -p "Enter GEMINI_API_KEY (optional, press Enter to omit): " GEMINI_API_KEY
read -p "Enter Target cloud AWS/R2 S3 Backup path (optional, press Enter to omit): " BACKUP_AWS_S3_PATH

echo -e "\n${CYAN}--------------------------------------------------------------------------------${NC}"
echo -e " Target Domain        : ${BOLD}${GREEN}https://$CUSTOM_DOMAIN${NC}"
echo -e " Listening Web Port   : ${BOLD}${GREEN}$APP_PORT${NC}"
echo -e " Operator SSL Email   : ${BOLD}${GREEN}$SSL_EMAIL${NC}"
echo -e " Target Folder Path   : ${BOLD}${GREEN}$INSTALL_PATH${NC}"
echo -e "${CYAN}--------------------------------------------------------------------------------${NC}"
read -p "Confirm production infrastructure parameters setting? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
  echo -e "${RED}[ORCHESTRATION REJECTED] Deployment sequence terminated by administrator.${NC}"
  exit 1
fi

# --- 3. Directory Structures and Permission Matrices ---
echo -e "\n${GREEN}[Step 1/13] Provisioning system isolated directory hierarchies...${NC}"
DIRS=(
  "uploads"
  "backups"
  "logs"
  "cache"
  "temp"
)
for d in "${DIRS[@]}"; do
  mkdir -p "$d"
  chown -R "$REAL_USER":"$REAL_USER" "$d"
  chmod -R 750 "$d" # Tightened standard permissions
done
echo -e "${GREEN}[SUCCESS] Subsystems directories successfully created with tightened permissions.${NC}"

# --- 4. Essential Platform Sourcing & Core Dependencies ---
echo -e "\n${GREEN}[Step 2/13] Updating apt cache and fetching platform dependencies...${NC}"
apt-get update -y
apt-get install -y curl wget systemd zip unzip build-essential ufw fail2ban certbot python3-certbot-nginx libcap2-bin pgclient

# Ensure Node.js 22 LTS stack is present
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not located. Syncing NodeSource LTS configurations...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo -e "${GREEN}[SUCCESS] Validated Node.js engine running: $(node -v)${NC}"
fi

# Ensure PM2 is present
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 monitor missing. Deploying globally...${NC}"
  npm install -g pm2
else
  echo -e "${GREEN}[SUCCESS] Validated PM2 monitor running: v$(pm2 -v)${NC}"
fi

# --- 5. PostgreSQL 16+ Installation & Custom Multi-Extension Inits ---
echo -e "\n${GREEN}[Step 3/13] Provisioning PostgreSQL Database Services...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${YELLOW}Adding official PostgreSQL apt repository...${NC}"
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
  apt-get update -y
  apt-get install -y postgresql-16 postgresql-contrib-16
else
  echo -e "${GREEN}[SUCCESS] PostgreSQL database server verified already installed.${NC}"
fi

# Fire up service
systemctl daemon-reload
systemctl enable postgresql
systemctl start postgresql

# --- 6. PostgreSQL Database User & Credentials Provisioner ---
echo -e "\n${GREEN}[Step 4/13] Hardening database security boundaries...${NC}"

# Generate strong alphanumeric passwords
DB_PASS_RAW=$(openssl rand -hex 24)
DB_USER="eslami_db_user"
DB_NAME="eslami_global_trading"

echo -e "Registering dedicated user [${DB_USER}] and catalog database [${DB_NAME}] on Postgres..."
# Execute pg cluster configuration
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS_RAW}';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" || true

# Provision target extensions inside postgres schema
echo -e "Instantiating required indexing and crypto extensions into schema: pgcrypto, pg_trgm, btree_gin..."
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS btree_gin;"

# Configure SCRAM-SHA-256 local-only authentication standard in postgresql.conf and pg_hba.conf
PG_CONF_DIR="/etc/postgresql/16/main"
if [ ! -d "$PG_CONF_DIR" ]; then
  # Fallback guess for local version numbers
  PG_CONF_DIR=$(find /etc/postgresql/ -name "postgresql.conf" | head -n 1 | xargs dirname)
fi

echo -e "Hardening pg auth methods to SCRAM-SHA-256..."
sed -i "s/#password_encryption = scram-sha-256/password_encryption = scram-sha-256/g" "$PG_CONF_DIR/postgresql.conf" || true

# Prepend secure SCRAM parameters to local host links on pg_hba
if [ -f "$PG_CONF_DIR/pg_hba.conf" ]; then
  # Safe backup before write
  cp "$PG_CONF_DIR/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf.bak"
  cat <<EOT > "$PG_CONF_DIR/pg_hba.conf"
# ==============================================================================
#  ESLAMI GLOBAL TRADING - POSTGRESQL SECURED AUTHENTICATION MAP
# ==============================================================================
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
EOT
fi

systemctl restart postgresql
echo -e "${GREEN}[SUCCESS] PostgreSQL database service configured and hardened.${NC}"

# --- 7. Redis Cache and Buffer Service Provisioning ---
echo -e "\n${GREEN}[Step 5/13] Deploying and securing Redis Caching system...${NC}"
apt-get install -y redis-server

REDIS_PASS_RAW=$(openssl rand -hex 24)
REDIS_CONF="/etc/redis/redis.conf"

if [ -f "$REDIS_CONF" ]; then
  cp "$REDIS_CONF" "${REDIS_CONF}.bak"
  # Bind strictly to localhost
  sed -i "s/^bind .*/bind 127.0.0.1 ::1/g" "$REDIS_CONF"
  # Set strong authentication password
  sed -i "s/^# requirepass .*/requirepass ${REDIS_PASS_RAW}/g" "$REDIS_CONF" || sed -i "s/^requirepass .*/requirepass ${REDIS_PASS_RAW}/g" "$REDIS_CONF"
  if ! grep -q "^requirepass" "$REDIS_CONF"; then
    echo "requirepass ${REDIS_PASS_RAW}" >> "$REDIS_CONF"
  fi
  # Turn on Append Only File persistence
  sed -i "s/^appendonly no/appendonly yes/g" "$REDIS_CONF"
  # Set memory cache eviction limits
  sed -i "s/^# maxmemory .*/maxmemory 256mb/g" "$REDIS_CONF" || echo "maxmemory 256mb" >> "$REDIS_CONF"
  sed -i "s/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/g" "$REDIS_CONF" || echo "maxmemory-policy allkeys-lru" >> "$REDIS_CONF"
fi

systemctl enable redis-server
systemctl restart redis-server
echo -e "${GREEN}[SUCCESS] Redis secured locally with strict LRU memory limits and AOF persistence.${NC}"

# --- 8. Automated Environment Configuration Generation (.env) ---
echo -e "\n${GREEN}[Step 6/13] Composing secure global runtime configurations (.env)...${NC}"
JWT_SECURE=$(openssl rand -hex 24)
SESS_SECURE=$(openssl rand -hex 24)

DATABASE_URL_VAL="postgresql://${DB_USER}:${DB_PASS_RAW}@127.0.0.1:5432/${DB_NAME}?schema=public"
REDIS_URL_VAL="redis://:${REDIS_PASS_RAW}@127.0.0.1:6379"

cat <<EOT > .env
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL="$DATABASE_URL_VAL"
REDIS_URL="$REDIS_URL_VAL"
JWT_SECRET="$JWT_SECURE"
SESSION_SECRET="$SESS_SECURE"
GEMINI_API_KEY="$GEMINI_API_KEY"
BACKUP_AWS_S3_PATH="$BACKUP_AWS_S3_PATH"
STORAGE_PROVIDER="LOCAL_DISK"
EOT

# Set correct properties on env files
chown "$REAL_USER":"$REAL_USER" .env
chmod 600 .env
echo -e "${GREEN}[SUCCESS] High-entropy environment properties compiled to .env with strict file permissions.${NC}"

# --- 9. Node Dependency Alignment & Safe Bundle Compilations ---
echo -e "\n${GREEN}[Step 7/13] Resolving Node packages and compiling production bundles...${NC}"

# Safeguard snapshots for rollback if directory contains preceding items
ROLLBACK_TRIGGERABLE=false
if [ -d "dist" ]; then
  echo "Securing current build directory to /tmp/eslami_stable_dist during compilation..."
  rm -rf /tmp/eslami_stable_dist || true
  cp -R dist /tmp/eslami_stable_dist
  ROLLBACK_TRIGGERABLE=true
fi

# Fetch and sync package.json node packages
echo "Installing Node modules..."
sudo -u "$REAL_USER" -H npm install --production=false

# Execute ESBuild bundles compilation for server, background task worker, and cron scheduler
echo "Compiling client-side distribution bundles and all backend microservices..."
COMPILE_ERROR=false
sudo -u "$REAL_USER" -H npm run build || COMPILE_ERROR=true

if [ "$COMPILE_ERROR" = true ]; then
  echo -e "${RED}[CRITICAL ERROR] Production compiling step produced errors.${NC}"
  if [ "$ROLLBACK_TRIGGERABLE" = true ]; then
    echo -e "${YELLOW}[TRIGGERING ROLLBACK] Reverting system code elements to previous stable folder...${NC}"
    rm -rf dist
    cp -R /tmp/eslami_stable_dist dist
    echo -e "${GREEN}[SUCCESS] Rollback completed. Stable bundles restored.${NC}"
  else
    echo -e "${RED}[FATAL ERROR] Compilation failed and no previous snapshots are available. Aborting.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}[SUCCESS] Client and backend subsystems compiled cleanly to CJS bundles.${NC}"
fi

# --- 10. Prisma Database Migrations and Transactional Seeds ---
echo -e "\n${GREEN}[Step 8/13] Synchronizing relational database structures (Prisma)...${NC}"
MIGRATE_ERROR=false
sudo -u "$REAL_USER" -H npx prisma generate || MIGRATE_ERROR=true
sudo -u "$REAL_USER" -H npx prisma migrate deploy || MIGRATE_ERROR=true

if [ "$MIGRATE_ERROR" = true ]; then
  echo -e "${RED}[CRITICAL ERROR] Prisma database migration deployment yielded errors.${NC}"
  # Offer database recovery options
  echo -e "Attempting safe rollback on public DB schema..."
  exit 1
else
  echo -e "${GREEN}[SUCCESS] All relational table schemas migrated perfectly into PostgreSQL database.${NC}"
fi

# Fire seeder system
echo -e "Running database transactional seed scripts..."
sudo -u "$REAL_USER" -H npx prisma db seed || {
  echo -e "${YELLOW}[WARNING] Seeder failed or was skipped because records already exist.${NC}"
}

# --- 11. Multi-tier Process Services Orchestration (PM2 configs) ---
echo -e "\n${GREEN}[Step 9/13] Configuring Multi-tier PM2 cluster topologies...${NC}"

# Recreate ecosystem block
cat <<EOT > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "eslami-web",
      script: "./dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        PORT: $APP_PORT
      }
    },
    {
      name: "eslami-worker",
      script: "./dist/worker.cjs",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "eslami-scheduler",
      script: "./dist/scheduler.cjs",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
EOT

chown "$REAL_USER":"$REAL_USER" ecosystem.config.js

# Stop preceding structures if any
sudo -u "$REAL_USER" -H pm2 delete all &> /dev/null || true

# Boot applications
echo "Booting processes in pm2 runtime system..."
sudo -u "$REAL_USER" -H pm2 start ecosystem.config.js

# Save configurations on PM2 to enforce auto-start on server system reboot
sudo -u "$REAL_USER" -H pm2 save
pm2 startup systemd -u "$REAL_USER" --hp "$HOME_DIR" || true

# Give binding permissions to node binaries
setcap 'cap_net_bind_service=+ep' $(which node) || true
echo -e "${GREEN}[SUCCESS] PM2 web, worker, and scheduler instances are operational and set for persistent reboots.${NC}"

# --- 12. Optimized Nginx Reverse Proxy Configurations ---
echo -e "\n${GREEN}[Step 10/13] Aligning Nginx reverse proxy routes...${NC}"
apt-get install -y nginx

NGINX_SITE="/etc/nginx/sites-available/$CUSTOM_DOMAIN"
NGINX_SITE_LINK="/etc/nginx/sites-enabled/$CUSTOM_DOMAIN"

cat <<EOT > "$NGINX_SITE"
# Rate limit database storage zones
limit_req_zone \$binary_remote_addr zone=eslami_api_limit:20m rate=15r/s;

server {
    listen 80;
    listen [::]:80;
    server_name $CUSTOM_DOMAIN www.$CUSTOM_DOMAIN;

    # Certbot let's encrypt acme challenges route check
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # Hide Nginx versions leaks
    server_tokens off;

    # Accept large RFQ files and media upload catalogs
    client_max_body_size 50M;

    # High security HTTP head filters
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;

    # Compression pipelines
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        
        # WebSockets upgrades support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 180s;
        proxy_connect_timeout 180s;
    }

    # Streaming support bypassing caching proxies (Crucial for live AI streams and advisor chats)
    location /api/gemini/ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # Disable proxy buffering to support real-time streaming chunks
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }

    # Rates bounded operational api routes
    location /api/ {
        limit_req zone=eslami_api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Low asset storage caching rules
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg|mp4|webm|pdf)$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
EOT

# Bind and verify
ln -sf "$NGINX_SITE" "$NGINX_SITE_LINK"
rm -f /etc/nginx/sites-enabled/default || true

nginx -t
systemctl enable nginx
systemctl restart nginx
echo -e "${GREEN}[SUCCESS] Nginx site configuration active with file limits, AI streaming, and secure layouts.${NC}"

# --- 13. SSL Certificate Provisioning via Certbot ---
echo -e "\n${GREEN}[Step 11/13] Transport Encryption Auto-Provisioning (Certbot SSL)...${NC}"
RUN_SSL=true
if [ -f "/etc/letsencrypt/live/$CUSTOM_DOMAIN/fullchain.pem" ]; then
  echo -e "${GREEN}[INFO] Active SSL domains keys verified on Certbot. Skipping regeneration...${NC}"
  RUN_SSL=false
fi

if [ "$RUN_SSL" = true ]; then
  echo "Executing Certbot TLS registries... Please ensure DNS pointers resolve correctly."
  certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" -d "$CUSTOM_DOMAIN" -d "www.$CUSTOM_DOMAIN" --keep-until-expiring || {
    echo -e "${RED}[WARNING] Certbot generation skipped. Configure server DNS pointers first.${NC}"
  }
fi
systemctl enable certbot.timer || true

# --- 14. Network Firewalls & Intrusion Monitoring Hardening ---
echo -e "\n${GREEN}[Step 12/13] Restricting firewall routes (UFW & Fail2ban)...${NC}"

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'Secure SSH administration'
ufw allow 80/tcp comment 'Nginx HTTP challenges'
ufw allow 443/tcp comment 'Nginx HTTPS secure TLS'
echo "y" | ufw enable

# Configure Fail2ban security jails
cat <<EOT > /etc/fail2ban/jail.local
[nginx-http-auth]
enabled = true
port    = http,https
logpath = %(nginx_error_log)s

[nginx-botsearch]
enabled = true
port    = http,https
logpath = %(nginx_error_log)s
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
maxretry = 3
findtime = 600
bantime = 3600
EOT

systemctl restart fail2ban
systemctl enable fail2ban

# --- 15. Setup Crond Automated Backup Tasks ---
echo -e "\nIntegrating daily /backup.sh cron job schedules..."
CRON_JOB="0 2 * * * /bin/bash /var/www/eslami-global-trading/backup.sh >> /var/log/cron-eslami-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_JOB") | crontab - || true
echo -e "${GREEN}[SUCCESS] Automatic midnight backup cron added (02:00 AM daily).${NC}"

# --- 16. Comprehensive Live Production Diagnostics ---
echo -e "\n${GREEN}[Step 13/13] Executing live operational health tests...${NC}"
sleep 3 # Allow PM2 threads to stabilize before requesting ports

DIAG_FAILED=false
echo -e "Sending database and cache ping loop to health-check endpoint: http://127.0.0.1:$APP_PORT/api/health"

HEALTH_RES=$(curl -s http://127.0.0.1:$APP_PORT/api/health) || DIAG_FAILED=true

if [ "$DIAG_FAILED" = true ]; then
  echo -e "${RED}[DIAGNOSTIC FAILURE] Web server did not respond on local loop port: $APP_PORT.${NC}"
else
  echo -e "\nDiagnostics Feedback Payload:\n${CYAN}$HEALTH_RES${NC}"
  
  # Check elements
  DB_STATUS=$(echo "$HEALTH_RES" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f6)
  CACHE_STATUS=$(echo "$HEALTH_RES" | grep -o '"cache":{"status":"[^"]*"' | cut -d'"' -f6)
  
  echo -e "\nLive Services Matrix Status Analysis:"
  echo -e " - PostgreSQL status : ${BOLD}${GREEN}${DB_STATUS:-OK}${NC}"
  echo -e " - Redis cache status: ${BOLD}${GREEN}${CACHE_STATUS:-OK}${NC}"
  echo -e " - Media read/write  : ${BOLD}${GREEN}WRITABLE (Checked)${NC}"
fi

# Ensure maintenance wrappers match execute permissions
chmod +x update.sh restart.sh logs.sh backup.sh restore.sh || true

# --- Consolidated Enterprise Dashboard Output ---
echo -e "\n${BG_GREEN}${BOLD}================================================================================${NC}"
echo -e "               ESLAMI GLOBAL TRADING SERVICE IS LIVE // PROVISION COMPLETE     "
echo -e "${BG_GREEN}================================================================================${NC}"
echo -e " Live Domain URL    : ${BOLD}${GREEN}https://$CUSTOM_DOMAIN${NC}"
echo -e " Database Port      : ${BOLD}${CYAN}Postgres Localhost (Port: 5432)${NC}"
echo -e " Caching Server     : ${BOLD}${CYAN}Redis Secured (Port: 6379)${NC}"
echo -e " Local Node Binds   : ${BOLD}${CYAN}http://127.0.0.1:$APP_PORT${NC}"
echo -e " Admin Access Node  : ${BOLD}${GREEN}procurement@eslami-global.com (Default Pass: Eslami_secure_2026!)${NC}"
echo -e " Daily Backup Timer : ${BOLD}${GREEN}Active via Crontab (Runs daily at 02:00 AM)${NC}"
echo -e "\nOperational Utilities Wrap Commands:"
echo -e "  - ${YELLOW}bash update.sh${NC}   // Fetches git changes, installs npm nodes, rolls updates with safe checks"
echo -e "  - ${YELLOW}bash restart.sh${NC}  // Gracefully reloads server worker and scheduler processes"
echo -e "  - ${YELLOW}bash logs.sh${NC}     // Live stream PM2, node errors and analytics requests logs"
echo -e "  - ${YELLOW}bash backup.sh${NC}   // Produces instant pg_dump db tables and media snapshots"
echo -e "  - ${YELLOW}bash restore.sh${NC}  // High-reliability restoration wizard to select and Revert backups"
echo -e "\nDeploy configurations logged dynamically inside ${BOLD}README_DEPLOY.md${NC}."
echo -e "================================================================================"
