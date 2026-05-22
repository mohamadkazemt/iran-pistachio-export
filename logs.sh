#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING — COMPACT OPERATIONS LOG WATCHER
# ==============================================================================

if command -v pm2 &> /dev/null; then
  echo "Streaming logs from eslami-web, eslami-worker, and eslami-scheduler..."
  pm2 logs
else
  echo "[ERROR] PM2 is not active on this server. Checking systemd logs..."
  journalctl -u nginx --no-pager -n 50
fi
