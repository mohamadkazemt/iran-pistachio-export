# Eslami Global Trading - Sovereign Trade, Purity & Logistics

Eslami Global Trading is a premier, high-integrity international export-company portal. It is engineered from the ground up to establish trust, project luxury, and capture verified corporate buyer leads through advanced cargo RFQ wizards, trade analysis whitepapers, and a secure server-side AI-Powered Multilingual Trade Advisor.

---

## 🚀 Key Architectural Modules

1. **Brand Identity Overview**: Centered on an elegant, high-contrast dark-themed Slate & Gold design focusing on corporate pillars and verified logistics audit metrics.
2. **Exquisite Portfolios Catalog**: Highly detailed inventories including **Harmonized System (HS) classifications**, Origin tracing, precision chemical/purity specifications table, packaging safety standards, and instant deep-linking.
3. **Verified Cargo RFQs wizard**: Lead generation machine allowing importers to request custom quotes under designated **Incoterms 2020 (FOB, CIF, EXW, DDP, CFR)** and attach technical spec files (with strict size checks).
4. **Compliance Desk Trade IQ Desk**: Powered by server-side **Gemini 3.5**, facilitating multi-lingual discussions about customs certificates, shipping schedules, and phytosanitary clearance regulations.
5. **Secure Administrative cockpit**: Complete operator control deck (`admin` / `auras_export_2026`) tracking Lead statuses, reviewing Calculated Spam quarantine ratings, checking realtime security audit streams, and managing databases.
6. **Db Snapshot Backups**: Complete snapshot database dump creation and recovery runbooks.

---

## 🛡️ Integrated Cybersecurity Safeguards

- **CSRF Defense**: Stateless token integrity check via header `X-CSRF-Token` on all mutative operations.
- **Client Rate Limiting**: Limit of 60 requests per minute per IP with dynamic safety lockouts.
- **Image/Doc Verification**: Strictly rejects any attached documentation exceeding 2.5MB or displaying malicious MIME headers.
- **Automated Spam Score Quarantine**: Advanced algorithmic scanning score quarantine indicators for inbound comments.
- **Audit Trails Logger**: In-memory security logs monitoring access success rates, CSRF failures, and IP quarantines.

---

## 🛠️ Local Development & Quickstart

To run the full-stack Express + Vite application in your local container space:

```bash
# Install node packages
npm install

# Start development full-stack proxy (tsx server.ts is engaged automatically)
npm run dev
```

The portal will become active on `http://localhost:3000`. Provide your `GEMINI_API_KEY` in the Secrets configurations tab to turn on the live Trademarks and Regulatory compliance assistant.
