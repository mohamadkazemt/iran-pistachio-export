#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING - UPDATE & REDEPLOYMENT AUTOMATOR
# ==============================================================================
# Performs secure git updates, dependencies installs, and zero-downtime PM2 reload.
# ==============================================================================

set -e

# Visual formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[1/4] Checking workspace status & pulling latest source revisions...${NC}"
git pull || {
  echo -e "${YELLOW}[WARNING] Git pull failed or not initialized. Skipping...${NC}"
}

echo -e "${GREEN}[2/4] Installing dependencies...${NC}"
npm install --production=false

echo -e "${GREEN}[3/4] Re-compiling optimized assets (Vite production build)...${NC}"
npm run build

echo -e "${GREEN}[4/4] Performing zero-downtime rolling reload of application clusters...${NC}"
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
else
  echo -e "${RED}[ERROR] PM2 was not detected. Start using: npm run start${NC}"
  exit 1
fi

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}   ESLAMI GLOBAL TRADING PORTAL UPDATED SUCCESSFULLY   ${NC}"
echo -e "${GREEN}====================================================${NC}"
