#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING - LOG INTERFACE OUT
# ==============================================================================

if command -v pm2 &> /dev/null; then
  # Streams the output or error logs of the application
  pm2 logs eslami-global-trading-app --lines 100
else
  echo -e "\033[0;31mError: PM2 is not installed or available.\033[0m"
  exit 1
fi
