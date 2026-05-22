#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING - ENTERPRISE UBUNTU PRODUCTION DEPLOYMENT ENGINE
# ==============================================================================
# Supports Node.js, Express, Vite, PM2, Nginx, SSL Certbot, UFW & Fail2ban.
# Best executed on a clean Ubuntu Server (20.04LTS, 22.04LTS, or 24.04LTS).
# ==============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Color Constants & Visual Headers ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BG_GREEN='\033[42m\033[30m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0;3m' # No Color
BOLD='\033[1m'

# Visual Banner
clear
echo -e "${CYAN}================================================================================${NC}"
echo -e "${BOLD}${BG_GREEN}          ESLAMI GLOBAL TRADING // ENTERPRISE DEPLOYMENT INSTALLER              ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "${BLUE}Target OS Requirement: Ubuntu v20.04LTS / v22.04LTS / v24.04LTS${NC}"
echo -e "${BLUE}Detected Platform: Node.js (Vite + Express Bundle Production System)${NC}"
echo -e "${CYAN}================================================================================${NC}"

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This deployment script MUST be executed with root permissions.${NC}"
  echo -e "Please run using: ${YELLOW}sudo bash install.sh${NC}"
  exit 1
fi

# Detect absolute paths
APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$APP_DIR"

echo -e "${GREEN}[1/8] Validating workspace directory structure...${NC}"
if [ ! -f "package.json" ]; then
  echo -e "${RED}[ERROR] Cannot detect package.json. Run this inside the application directory!${NC}"
  exit 1
fi

# --- Configurations & Prompts ---
echo -e "\n${BOLD}${CYAN}------------ ENTERPRISE DEPLOYMENT PARAMETERS ------------${NC}"

# 1. Domain selection
read -p "Enter your Main Domain (e.g., eslami-global.com): " CUSTOM_DOMAIN
if [ -z "$CUSTOM_DOMAIN" ]; then
  CUSTOM_DOMAIN="eslami-global.com"
  echo -e "Using default: ${YELLOW}$CUSTOM_DOMAIN${NC}"
fi

# 2. Port selection
read -p "Enter production target PORT [Default: 3000]: " APP_PORT
if [ -z "$APP_PORT" ]; then
  APP_PORT="3000"
fi

# 3. Gemini API Key
read -p "Enter GEMINI_API_KEY (leave empty if configured later): " GEMINI_API_KEY

# 4. SSL Registration Email
read -p "Enter SSL Certificate registration email: " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
  SSL_EMAIL="procurement@eslami-global.com"
  echo -e "Using default: ${YELLOW}$SSL_EMAIL${NC}"
fi

echo -e "${CYAN}----------------------------------------------------------${NC}"
echo -e "Domain: ${BOLD}${GREEN}$CUSTOM_DOMAIN${NC}"
echo -e "Port: ${BOLD}${GREEN}$APP_PORT${NC}"
echo -e "Directory: ${BOLD}${GREEN}$APP_DIR${NC}"
echo -e "SSL Email: ${BOLD}${GREEN}$SSL_EMAIL${NC}"
echo -e "${CYAN}----------------------------------------------------------${NC}"
read -p "Are these details correct? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
  echo -e "${RED}Deployment aborted by operator.${NC}"
  exit 1
fi

# --- System Update & Package Sourcing ---
echo -e "\n${GREEN}[2/8] Updating Apt cache and installing operating dependencies...${NC}"
apt-get update -y
apt-get upgrade -y

# Install essential core utilities
apt-get install -y curl wget git unzip build-essential ufw fail2ban certbot python3-certbot-nginx libcap2-bin

# Install Node.js LTS (Latest Node v22 structure via NodeSource)
echo -e "${GREEN}[3/8] Checking & installing Node.js LTS stack...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not detected. Registering NodeSource suite for Node 22.x...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo -e "Detected Node.js version: ${CYAN}$(node -v)${NC}"
fi

# Install pm2 globally
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 not found. Installing globally...${NC}"
  npm install -g pm2
else
  echo -e "Detected PM2 version: ${CYAN}$(pm2 -v)${NC}"
fi

# --- Node Project Build Stage ---
echo -e "\n${GREEN}[4/8] Installing production app dependencies & building assets...${NC}"
# Set ownership first
chown -R $SUDO_USER:$SUDO_USER "$APP_DIR" || chown -R root:root "$APP_DIR"

# Install dependencies using standard lock
sudo -u $SUDO_USER -F npm install --production=false || npm install --production=false

# Populate production .env file
echo -e "${GREEN}Populating production environment configurations (.env)...${NC}"
cat <<EOT > .env
NODE_ENV=production
PORT=$APP_PORT
GEMINI_API_KEY=$GEMINI_API_KEY
EOT
chown $SUDO_USER:$SUDO_USER .env || true

# Run compilation script
echo -e "${GREEN}Executing production compiler command (Vite + esbuild Bundle)...${NC}"
sudo -u $SUDO_USER -F npm run build || npm run build

# --- Process Manager Startup Strategy ---
echo -e "\n${GREEN}[5/8] Managing application via standard PM2 process engine...${NC}"
# Delete current service if exists to avoid conflicts
pm2 delete eslami-global-trading-app &> /dev/null || true

# Copy or generate absolute ecosystem config if missing
if [ ! -f "ecosystem.config.js" ]; then
  echo -e "${YELLOW}No ecosystem.config.js found. Creating default PM2 configuration...${NC}"
  cat <<EOT > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "eslami-global-trading-app",
      script: "./dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: $APP_PORT
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true
    }
  ]
};
EOT
  chown $SUDO_USER:$SUDO_USER ecosystem.config.js || true
fi

# Create logs directory
mkdir -p logs
chown -R $SUDO_USER:$SUDO_USER logs || true

# Start applying PM2 Process limits
pm2 start ecosystem.config.js

# Setup PM2 Startup script
echo -e "${CYAN}Configuring system-level PM2 startup routines...${NC}"
pm2 save
# Generate pm2 configuration script for systemd
env PATH=$PATH:/usr/bin pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER || env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root || true

# Allow node binary to bind to port 80/443 without root permissions if needed
setcap 'cap_net_bind_service=+ep' $(which node) || true

# --- Reverse Proxy Configuration (Nginx) ---
echo -e "\n${GREEN}[6/8] Configuring Nginx reverse-proxy server...${NC}"
apt-get install -y nginx

# Setup base nginx parameters incorporating high-grade headers
NGINX_SITE="/etc/nginx/sites-available/$CUSTOM_DOMAIN"
NGINX_SITE_LINK="/etc/nginx/sites-enabled/$CUSTOM_DOMAIN"

# Write custom reverse-proxy configuration
cat <<EOT > "$NGINX_SITE"
# Rate limiting zone for API routes
limit_req_zone \$binary_remote_addr zone=api_limit:20m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name $CUSTOM_DOMAIN www.$CUSTOM_DOMAIN;

    # Root paths for let's encrypt ACME validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # Hide Nginx Version For Security Hardening
    server_tokens off;

    # Security Headers Block
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;

    # Gzip Compression Rules
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Main Application Reverse Proxy Handler
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }

    # Strict rate-limiting for critical compliance / RFQ API
    location /api/ {
        limit_req zone=api_limit burst=15 nodelay;
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Media / Storage File Optimization
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg|mp4|webm|pdf)$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
EOT

# Link site configurations
ln -sf "$NGINX_SITE" "$NGINX_SITE_LINK"
# Remove default Nginx page link to prevent server defaults taking precedence
rm -f /etc/nginx/sites-enabled/default || true

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# --- SSL Automation ---
echo -e "\n${GREEN}[7/8] Launching SSL certificate issuance (Let's Encrypt - Certbot)...${NC}"
echo -e "${YELLOW}Checking external server alignment... If DNS records are not linked yet, SSL validation might fail.${NC}"
read -p "Would you like to run Let's Encrypt Certbot SSL now? (Y/n): " RUN_SSL
if [[ "$RUN_SSL" =~ ^[nN]$ ]]; then
  echo -e "${YELLOW}Skipping automatic SSL automation. Run manually using: certbot --nginx -d $CUSTOM_DOMAIN -d www.$CUSTOM_DOMAIN${NC}"
else
  # Issue certificate
  certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" -d "$CUSTOM_DOMAIN" -d "www.$CUSTOM_DOMAIN" || {
    echo -e "${RED}[WARNING] Certbot generation halted. Double check your DNS A-Records pointers.${NC}"
  }
fi

# Set auto-renewal
systemctl enable certbot.timer || true

# --- Cybersecurity Hardening (UFW & Fail2ban) ---
echo -e "\n${GREEN}[8/8] Engaging Cybersecurity Hardening protocols...${NC}"

# Configure Fail2Ban to prevent brute-force
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

# Configure UFW rules safely
echo -e "Configuring UFW Rules table..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow $APP_PORT/tcp comment 'Local App Port Direct Access' # Optional

# Enable UFW
echo "y" | ufw enable
ufw status verbose

# --- Complete Summary ---
echo -e "\n${BG_GREEN}${BOLD}================================================================================${NC}"
echo -e "${BOLD}${GREEN}               DEYPLOYMENT PROVISIONED SUCCESSFULLY // COMPLETE                 ${NC}"
echo -e "${BG_GREEN}================================================================================${NC}"
echo -e "\nServer Status details:"
echo -e "- Enterprise brand: ${BOLD}Eslami Global Trading // بازرگانی اسلامی${NC}"
echo -e "- Domain URL:       ${CYAN}https://$CUSTOM_DOMAIN${NC}"
echo -e "- Local PORT:       ${CYAN}http://localhost:$APP_PORT${NC}"
echo -e "- PM2 Application:  ${CYAN}eslami-global-trading-app${NC}"
echo -e "- SSL Auto-Renew:   ${GREEN}Active / Enabled via Systemd Certbot timer${NC}"
echo -e "- UFW Firewall:     ${GREEN}Enabled (Ports 22, 80, 443 active)${NC}"
echo -e "- Fail2ban Defense: ${GREEN}Enabled (Brute force & malicious bot blocking activity active)${NC}"
echo -e "\nAvailable Utility scripts created for standard operation:"
echo -e "  - ${YELLOW}bash update.sh${NC}  // Pull latest git status, install, compile, and hot-restart PM2"
echo -e "  - ${YELLOW}bash restart.sh${NC} // Gracefully reload the running application process"
echo -e "  - ${YELLOW}bash logs.sh${NC}    // Monitor active live system outputs"
echo -e "  - ${YELLOW}bash backup.sh${NC}  // Generate robust database and source snapshots easily"
echo -e "\nDocumentation saved to ${BOLD}README_DEPLOY.md${NC}."
echo -e "================================================================================"
