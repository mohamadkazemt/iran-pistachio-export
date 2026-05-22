#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING - SERVICE GRACEFUL RESTARTER
# ==============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Initiating rolling reload of running application nodes...${NC}"
if command -v pm2 &> /dev/null; then
  pm2 reload eslami-global-trading-app || pm2 start ecosystem.config.js
  echo -e "${GREEN}PM2 processes reloaded!${NC}"
else
  echo -e "${RED}[WARNING] PM2 not installed globally or not in PATH.${NC}"
fi

# Reload Nginx if root permissions are allowed
if [ "$EUID" -eq 0 ]; then
  echo -e "${GREEN}Reloading Nginx service...${NC}"
  nginx -t && systemctl reload nginx
  echo -e "${GREEN}Nginx service reloaded!${NC}"
else
  echo -e "${YELLOW}[NOTE] Run as ROOT to reload Nginx automatically.${NC}"
fi

echo -e "${GREEN}Done.${NC}"
