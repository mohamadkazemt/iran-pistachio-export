# AuraLux Global - Enterprise Deployment & Operations Guide

This guide details the strategic deployment, performance optimization, and cybersecurity operations of the AuraLux Global premium export platform.

---

## 1. Production Docker Compilation

To deploy on containerized orchestration beds (such as Google Cloud Run or AWS Fargate), compile the multi-stage, lightweight production container:

```bash
# Build the production container tagged for reference
docker build -t gcr.io/auralux-export-corp/auralux-global:latest .

# Verify container compilation and run a local test
docker run -p 3000:3000 --env GEMINI_API_KEY="YOUR_KEY" gcr.io/auralux-export-corp/auralux-global:latest
```

---

## 2. Google Cloud Run Deployment

Cloud Run is the recommended platform. We support stateless scalability under tight container requirements.

### Deploy Command:
```bash
gcloud run deploy auralux-global-portal \
  --image gcr.io/auralux-export-corp/auralux-global:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=YOUR_SECURE_API_KEY"
```

---

## 3. High-Security Cybersecurity Guidelines

### A. SSL & Transport Validation (SSL-Ready)
- AuraLux endpoints require strict transport level encryption (HTTPS/TLS 1.3).
- When deploying behind a Cloud Load Balancer (or Cloudflare), enable **SSL Full (Strict)** to protect user data from MITM vulnerabilities.
- Set HSTS Headers:
  `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### B. Global CDN & Caching (CDN-Ready)
- All static assets in `/dist` are fully optimized for edge CDN caching nodes.
- Expose caching control rules in reverse proxies (nginx/Cloudflare Edge Rules):
  - Static images (`/assets/*.png`, `*.jpg`): `Cache-Control: public, max-age=31536000, immutable`
  - Dynamic APIs (`/api/*`): `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`

### C. Stateless Rate Limiting & CSRF Safeguards
- **Rate Limits**: The backend monitors active IP counts to isolate script pollers. Mutative endpoints limits block abusers automatically.
- **CSRF Token Verification**: Every mutative post request is validated with a security custom request token header `X-CSRF-Token`.
- **Anti-Spam Filter**: Inbound Leads (RFQs) comments scores are analysed. High risk scores quarantine leads as Pending/Flagged rather than triggering immediate alerts.

---

## 4. Operational Backup & Recovery Runbook

AuraLux incorporates a robust file-based local JSON data manager matching complete TypeScript indices schemas. Backups can be triggered dynamically from our Operator Admin control panel.

### Manual Backup Checklist:
1. Authenticate under **Admin Controls** with Operator coordinates.
2. Select **System Snapshot Backups** tap.
3. Click **+ Create Secure System Snapshot**. A `.json` file containing all static product portfolios, compliance blog briefs, and lead enquiries is compiled in `src/backups/`.

### Restoration Fail-safe Procedure:
- To recover previous states, select the targeted archive from the **Recoverable Archive registries** list and click **Securely Restore Archive Dir**. This resets active memory instantly.
