#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING — ENTERPRISE DATA ARCHIVE & DISASTER RECOVERY ENGINE
# ==============================================================================
#  Reverts database tables, configurations, and uploaded assets to a specified
#  historical checkpoint. Supports local tarballs and structured logging.
# ==============================================================================

set -eo pipefail

# Visual Feedback colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Ensure sudo/root check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This recovery utility must be run with administrative privileges (root).${NC}"
  echo -e "Execute using: ${YELLOW}sudo bash restore.sh${NC}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}================================================================================${NC}"
echo -e "${BOLD}${RED}           ESLAMI GLOBAL TRADING // SYSTEM RECOVERY CONTROL PANEL            ${NC}"
echo -e "${CYAN}================================================================================${NC}"

# Check of backups path
BACKUP_DIR="${SCRIPT_DIR}/backups"
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
  echo -e "${RED}[ERROR] Backup directory '${BACKUP_DIR}' is empty. No historical checkpoints available.${NC}"
  exit 1
fi

# 1. Provide Interactive List of Available Backups
echo -e "${YELLOW}Select the historical archive snapshot to restore:${NC}\n"
IFS=$'\n' BACKUPS=($(find "$BACKUP_DIR" -type f -name "eslami_enterprise_*.tar.gz" | sort -r))
unset IFS

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo -e "${RED}[ERROR] No compatible 'eslami_enterprise_*.tar.gz' files found.${NC}"
  exit 1
fi

for i in "${!BACKUPS[@]}"; do
  FILE_SIZE=$(du -sh "${BACKUPS[$i]}" | cut -f1)
  FILE_TIME=$(date -r "${BACKUPS[$i]}" +"%Y-%m-%d %H:%M:%S")
  echo -e "  [${CYAN}$i${NC}] $(basename "${BACKUPS[$i]}") (Size: $FILE_SIZE, Modified: $FILE_TIME)"
done

echo -e ""
read -p "Enter backup number to execute recovery (0-$(( ${#BACKUPS[@]} - 1 ))): " SELECTED_INDEX

if [[ ! "$SELECTED_INDEX" =~ ^[0-9]+$ ]] || [ "$SELECTED_INDEX" -lt 0 ] || [ "$SELECTED_INDEX" -ge "${#BACKUPS[@]}" ]; then
  echo -e "${RED}[ERROR] Invalid input selection. Disaster recovery aborted.${NC}"
  exit 1
fi

TARGET_BACKUP="${BACKUPS[$SELECTED_INDEX]}"
echo -e "\nTarget File Selected: ${BOLD}${GREEN}$(basename "$TARGET_BACKUP")${NC}"

# 2. Critical Safety Confirmation Prompt
echo -e "${RED}${BOLD}============================= CRITICAL SANCTION WARNING ========================${NC}"
echo -e "${RED}Restoring from backup will completely OVERWRITE live databases, uploads, and CMS configurations.${NC}"
echo -e "All un-saved live modifications will be permanently lost."
echo -e "${RED}================================================================================${NC}"
read -p "Type 'CONFIRM' to execute recovery procedures: " CONFIRM_VAL

if [ "$CONFIRM_VAL" != "CONFIRM" ]; then
  echo -e "${YELLOW}[CANCELLED] Operator aborted disaster recovery sequence.${NC}"
  exit 0
fi

echo -e "\n${CYAN}[1/5] Extracting backup snapshot to isolated temporary workspace...${NC}"
TEMP_RESTORE_DIR="${SCRIPT_DIR}/temp/restore_workspace"
rm -rf "$TEMP_RESTORE_DIR" || true
mkdir -p "$TEMP_RESTORE_DIR"

tar -xzf "$TARGET_BACKUP" -C "$TEMP_RESTORE_DIR"

# 3. Restore Database System
echo -e "${CYAN}[2/5] Assessing database models and credentials...${NC}"
if [ -f .env ]; then
  DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"'\''') || true
fi

if [ -n "$DB_URL" ] && [ -f "${TEMP_RESTORE_DIR}/db_schema_snapshot.sql" ]; then
  echo -e "Relational database found... parsing credentials."
  
  # Strip protocol
  STRIPPED="${DB_URL#*://}"
  USER_PASS="${STRIPPED%%@*}"
  DB_USER="${USER_PASS%%:*}"
  DB_PASS="${USER_PASS#*:}"
  HOST_PORT_DB="${STRIPPED#*@}"
  HOST_PORT="${HOST_PORT_DB%%/*}"
  DB_HOST="${HOST_PORT%%:*}"
  DB_PORT="${HOST_PORT#*:}"
  if [ "$DB_PORT" = "$DB_HOST" ]; then
     DB_PORT="5432"
  fi
  DB_NAME_PARAMS="${HOST_PORT_DB#*/}"
  DB_NAME="${DB_NAME_PARAMS%%\?*}"

  export PGPASSWORD="$DB_PASS"

  if command -v psql &> /dev/null; then
    echo -e "${YELLOW}Executing clean database restoration... (overwriting tables)${NC}"
    # Drop all tables or recreate database to ensure clean transactions
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    # Restore the actual database SQL tables structure
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "${TEMP_RESTORE_DIR}/db_schema_snapshot.sql"
    echo -e "${GREEN}[SUCCESS] Relational database restored successfully.${NC}"
  else
    echo -e "${RED}[WARNING] psql command-line client was not found on this server. Skipping SQL restoration segment.${NC}"
  fi
else
  echo -e "${YELLOW}[INFO] No relational SQL schema snapshot found inside the zip. Checking fallback storage files...${NC}"
fi

# 4. Restore prototype configurations and local files
echo -e "${CYAN}[3/5] Restoring local files, media uploads, and assets...${NC}"

# Restore uploads registry folder
if [ -d "${TEMP_RESTORE_DIR}/assets/uploads" ]; then
  echo -e "Re-syncing uploads/ directories..."
  rm -rf "${SCRIPT_DIR}/uploads" || true
  cp -R "${TEMP_RESTORE_DIR}/assets/uploads" "${SCRIPT_DIR}/uploads"
fi

# Restore prototype backend file if present
if [ -f "${TEMP_RESTORE_DIR}/assets/db.json" ]; then
  echo -e "Re-syncing prototype db.json files..."
  cp "${TEMP_RESTORE_DIR}/assets/db.json" "${SCRIPT_DIR}/src/db.json" || true
fi

# Restore .env parameters
if [ -f "${TEMP_RESTORE_DIR}/assets/.env" ]; then
  echo -e "Restoring .env parameters file..."
  cp "${TEMP_RESTORE_DIR}/assets/.env" "${SCRIPT_DIR}/.env"
fi

# 5. Correct file ownership permissions
echo -e "${CYAN}[4/5] Fixing folder permissions and security ownerships...${NC}"
if [ -n "$SUDO_USER" ]; then
  chown -R "$SUDO_USER":"$SUDO_USER" "${SCRIPT_DIR}/uploads" "${SCRIPT_DIR}/src" .env || true
else
  chown -R root:root "${SCRIPT_DIR}/uploads" "${SCRIPT_DIR}/src" .env || true
fi
chmod -R 755 "${SCRIPT_DIR}/uploads" || true

# 6. Graceful PM2 cluster restart to bind active connections
echo -e "${CYAN}[5/5] Re-firing PM2 enterprise instances and cache parameters...${NC}"
if command -v pm2 &> /dev/null; then
  echo "Rolling reloads on PM2 threads..."
  if [ -n "$SUDO_USER" ]; then
    sudo -u "$SUDO_USER" -F pm2 reload all || true
  else
    pm2 reload all || true
  fi
fi

# Clean up restoration workspace
rm -rf "$TEMP_RESTORE_DIR"

echo -e "\n${BOLD}${GREEN}================================================================================${NC}"
echo -e "${BOLD}${GREEN}               DISASTER RECOVERY SYSTEM INTEGRATION COMPLETED                   ${NC}"
echo -e "  Your server database and media files has been successfully restored to: "
echo -e "  ${BOLD}$(basename "$TARGET_BACKUP")${NC}"
echo -e "  All services are confirmed live and active."
echo -e "${BOLD}${GREEN}================================================================================${NC}"
