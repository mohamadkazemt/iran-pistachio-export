# Eslami Global Trading — Linux Production Deployment Guide
### بازرگانی اسلامی - مستندات و هندبوک استقرار سرور تولید

This guide outlines advanced infrastructure stethoscoping, cybersecurity configurations, reverse proxy maps, and process management rules for deploying **Eslami Global Trading // بازرگانی اسلامی** on dedicated Linux Virtual Private Servers (VPS).

---

## 🛠️ Operating System Pre-conditions

For ideal performance, deploy on a virtual instance running:
* **Operating System:** Ubuntu Server 20.04 LTS, 22.04 LTS, or 24.04 LTS
* **Minimum Specifications:** 1 vCPU, 1 GB RAM (ECC preferred)
* **Open Firewall Inbound Ports:** 22 (SSH), 80 (HTTP validation), 443 (HTTPS Secure)

---

## 🚀 Step 1: Automated Deployment Provisioning (Recommended)

Our verified automated deployment script sets up all required system dependencies, sets proper file system permissions, configures system limits, compiles the application, and enables process monitors in under 5 minutes.

Run this command as a privileged administrator:
```bash
sudo bash install.sh
```

---

## 🏎️ Step 2: Advanced PM2 Clustering Setup

The application backend uses Node.js cluster features to balance network requests across multiple CPU cores without downtime. The thread distribution is outlined in `./ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "eslami-global-trading-app",
      script: "./dist/server.cjs",    // Compiled bundled Single-File Express executable
      instances: "max",               // Dynamically balance processes to match CPU thread boundaries
      exec_mode: "cluster",           // Launch high-performance cluster structures
      watch: false,                   // Disable watching in production to avoid infinite reload triggers
      max_memory_restart: "1G",       // Seamless restart boundary to safeguard memory
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true
    }
  ]
};
```

### Essential PM2 Diagnostic Controls:
```bash
# Monitor system health, RAM bounds and thread active loads
pm2 monit

# Reload all running instances with ZERO downtime (rolling restart pattern)
pm2 reload eslami-global-trading-app

# Force a cold stop on all processes
pm2 stop eslami-global-trading-app
```

---

## 🛡️ Step 3: Nginx Proxy Setup & Cyber Hardening

To manage static assets and route incoming traffic, configure **Nginx** as a reverse proxy on ports `80` (HTTP) and `443` (HTTPS).

Save our optimized proxy configuration template to `/etc/nginx/sites-available/eslami-global.com` and generate a symbolic link inside `/etc/nginx/sites-enabled/` to activate it.

### High-Protection Proxy Configuration Template:
```nginx
# Rate Limit Zone definitions in shared memory (15MB logs can keep ~240,000 unique IP signatures states)
limit_req_zone $binary_remote_addr zone=api_limit_zone:15m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=addr_conn_zone:15m;

# ----------------- HTTP (Port 80) Redirection Block -----------------
server {
    listen 80;
    listen [::]:80;
    server_name eslami-global.com www.eslami-global.com;

    # Certbot let's encrypt acme validations route
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # Permanent Redirect for transport security compliance
    location / {
        return 301 https://$host$request_uri;
    }

    server_tokens off; # Hides nginx versions
}

# ----------------- HTTPS (Port 443) Server Block -----------------
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name eslami-global.com www.eslami-global.com;

    # Certificate absolute pointers (Auto-filled by certbot engine)
    ssl_certificate /etc/letsencrypt/live/eslami-global.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eslami-global.com/privkey.pem;
    
    # Modern secure SSL Ciphers parameters
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    
    # Security parameters & headers matching ISO standards
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip Asset Compiling Pipeline
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static asset caching strategy
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg|mp4|webm|pdf)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # API Proxy endpoint (Enables aggressive rate-limiting for spam injection prevention)
    location /api/ {
        limit_req zone=api_limit_zone burst=15 nodelay;
        limit_conn addr_conn_zone 15;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Pass primary client routers
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    server_tokens off;
}
```

---

## 🔒 Step 4: System Firewall and SSL Auto-renewal

Ensure Let's Encrypt renewal checks run daily using Ubuntu standard system timers and your firewall locks down alternative raw diagnostic access.

### Certbot SSL Auto-Renew Test:
```bash
sudo certbot renew --dry-run
```

### UFW Rules Lockdowns:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Port'
sudo ufw allow 80/tcp comment 'HTTP Redirections'
sudo ufw allow 443/tcp comment 'HTTPS Secure Reverse-Proxy'
sudo ufw enable
```

---

## 🛠️ Step 5: Routine Maintenance Scripts

Keep files, processes, and assets updated without service interruption:

```bash
# Force a clean pull, rebuild, and PM2 rolling process update
bash update.sh

# Restart all system modules (PM2 process clusters + Nginx routers)
bash restart.sh

# View live console output streaming logs
bash logs.sh

# Complete local server tarball snapshot creation
bash backup.sh
```

---
<p align="center">
  <b>Designed with absolute integrity. Eslami Global Trading Corporation © 2026.</b>
</p>
