#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING - BACKUP ENGINE
# ==============================================================================

set -e

GREEN='\033[0;32m'
NC='\033[0m'

# Create backup storage directory
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/eslami_backup_$TIMESTAMP.tar.gz"

echo -e "${GREEN}Creating production snapshot archive...${NC}"

# Compress code bases, configs, DB schemas, env parameters
tar --exclude='./node_modules' \
    --exclude='./dist' \
    --exclude='./.git' \
    --exclude='./backups' \
    --exclude='./logs' \
    -czf "$BACKUP_FILE" .

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}   SNAPSHOT ARCHIVE SUCCESFULLY GENERATED!          ${NC}"
echo -e "Location:  ${BOLD}$BACKUP_FILE${NC}"
echo -e "Size:      $(du -sh "$BACKUP_FILE" | cut -f1)"
echo -e "${GREEN}====================================================${NC}"
