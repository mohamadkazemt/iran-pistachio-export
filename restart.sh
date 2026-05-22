#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING — COMPACT GRACEFUL SERVICE RESTART UTILITY
# ==============================================================================

set -eo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}[Service Recycler] Triggering graceful rolling reload of PM2 nodes...${NC}"

if command -v pm2 &> /dev/null; then
  # Graceful reload propagates traffic seamlessly to new clusters before decommissioning old workers
  pm2 reload ecosystem.config.cjs || pm2 restart ecosystem.config.cjs
  echo -e "\n${GREEN}[SUCCESS] All threads (web cluster, worker, scheduler) gracefully recycled.${NC}"
else
  echo -e "${RED}[ERROR] PM2 runtime manager is not installed or active.${NC}"
  exit 1
fi
