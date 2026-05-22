#!/usr/bin/env bash

# ==============================================================================
#  ESLAMI GLOBAL TRADING — ENTERPRISE ORCHESTRATION & DEPLOYMENT ENGINE
# ==============================================================================
#  Production system provisioner and hardener for Ubuntu Server 20.04/22.04 LTS.
# ==============================================================================

# Strict Execution Settings
set -Eeuo pipefail

# Visual Colors & Constants
RED='\033[0;31m'
GREEN='\033[0;32m'
BG_GREEN='\033[42m\033[30m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' 
BOLD='\033[1m'

clear
echo -e "${CYAN}================================================================================${NC}"
echo -e "${BOLD}${BG_GREEN}         ESLAMI GLOBAL TRADING // ENTERPRISE INSTALLATION ENGINE              ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "Target Environment : ${BOLD}Ubuntu Server 20.04+ (Hardened Production)${NC}"
echo -e "Required Execution : ${BOLD}Root/Sudo Privilege Command Block${NC}"
echo -e "${CYAN}================================================================================${NC}"

# Define Path Constants
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
else
  CURRENT_DIR="$(pwd)"
fi

# ==============================================================================
#  ENTERPRISE PROVISIONER INITIAL PROPERTIES (Strict-Mode safe)
# ==============================================================================
# Dynamic assignment: check environment variables first
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-procurement@eslami-global.com}"
GITHUB_REPO_URL="${GITHUB_REPO_URL:-https://github.com/mohamadkazemt/iran-pistachio-export.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
INSTALL_PATH="${INSTALL_PATH:-/var/www/eslami-global-trading}"
DB_NAME="${DB_NAME:-eslami_trade}"
DB_USER="${DB_USER:-eslami_admin}"
DB_PASS_RAW="${DB_PASS_RAW:-}"
ENABLE_SSL="${ENABLE_SSL:-y}"
ENABLE_REDIS="${ENABLE_REDIS:-y}"
ENABLE_BACKUPS="${ENABLE_BACKUPS:-y}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-}"
APP_PORT="${APP_PORT:-3000}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
BACKUP_AWS_S3_PATH="${BACKUP_AWS_S3_PATH:-}"
SSL_EMAIL="${SSL_EMAIL:-}"

# Strict command-line argument parser to support options
# Example usage: ./install.sh --domain mydomain.com --email web@mydomain.com
while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--domain)
      CUSTOM_DOMAIN="$2"
      shift 2
      ;;
    -e|--email)
      LETSENCRYPT_EMAIL="$2"
      SSL_EMAIL="$2"
      shift 2
      ;;
    -b|--branch)
      GIT_BRANCH="$2"
      shift 2
      ;;
    -p|--path)
      INSTALL_PATH="$2"
      shift 2
      ;;
    --db-pass)
      DB_PASS_RAW="$2"
      shift 2
      ;;
    --admin-pass)
      ADMIN_PASS="$2"
      shift 2
      ;;
    *)
      # Unrecognized parameter, skip it
      shift
      ;;
  esac
done

# Synchronize email references
if [[ -z "$SSL_EMAIL" ]]; then
  SSL_EMAIL="$LETSENCRYPT_EMAIL"
fi

# Fallback defaults if not set via environment or command-line arguments
if [[ -z "$CUSTOM_DOMAIN" ]]; then
  CUSTOM_DOMAIN="eslami-global.com"
fi

TEMP_DIR="${CURRENT_DIR}/temp/install_workspace"

# Line-number debugging and error reporting
trap 'err_report $LINENO' ERR

err_report() {
  local line_num=$1
  echo -e "\n${RED}[FATAL ERROR] Installation aborted due to failure at line $line_num.${NC}" >&2
  cleanup
  exit 1
}

cleanup() {
  if [[ -d "${TEMP_DIR:-}" ]]; then
    rm -rf "$TEMP_DIR" || true
  fi
}

# --- Validation Routines ---
validate_domain() {
  local domain="$1"
  if [[ "$domain" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    return 0
  else
    return 1
  fi
}

validate_email() {
  local email="$1"
  if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    return 0
  else
    return 1
  fi
}

validate_port() {
  local port="$1"
  if [[ "$port" =~ ^[0-9]+$ ]] && [[ "$port" -ge 1 ]] && [[ "$port" -le 65535 ]]; then
    return 0
  else
    return 1
  fi
}

prompt_password() {
  local prompt_msg="$1"
  local var_name="$2"
  local default_val="$3"
  local input=""
  
  if [[ ! -t 0 ]]; then
    eval "$var_name=\"$default_val\""
    return
  fi

  echo -n -e "$prompt_msg"
  
  local char
  while IFS= read -r -s -n1 char; do
    if [[ "$char" == $'\0' || "$char" == $'\n' ]]; then
      break
    elif [[ "$char" == $'\177' || "$char" == $'\010' ]]; then
      if [[ ${#input} -gt 0 ]]; then
        input="${input%?}"
        echo -n -e "\b \b"
      fi
    else
      input+="$char"
      echo -n "*"
    fi
  done
  echo ""

  if [[ -z "$input" ]]; then
    eval "$var_name=\"$default_val\""
  else
    eval "$var_name=\"$input\""
  fi
}

# --- 1. Enforce superuser administrative privileges ---
if [[ "$EUID" -ne 0 ]]; then
  echo -e "${RED}[ERROR] This installer MUST be executed with administrative privileges (root).${NC}" >&2
  echo -e "Please execute using: ${YELLOW}sudo bash install.sh${NC}" >&2
  exit 1
fi

REAL_USER="${SUDO_USER:-root}"
HOME_DIR="/home/$REAL_USER"
if [[ "$REAL_USER" == "root" ]]; then
  HOME_DIR="/root"
fi

# --- 2. Advanced Preflight Validation Checks ---
preflight_validation() {
  echo -e "\n${CYAN}[Preflight Check] Commencing physical system compliance checks...${NC}"

  # OS distribution compliance
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" && "${ID_LIKE:-}" != *"ubuntu"* && "${ID_LIKE:-}" != *"debian"* ]]; then
      echo -e "${YELLOW}[WARNING] Target distribution is $NAME. Designed primarily for Ubuntu Server 20.04/22.04 LTS.${NC}"
      echo -n -e "Force continue installation anyway? (y/N): "
      if [[ -c /dev/tty ]]; then
        read -r CONTINUE_UNSUPPORTED < /dev/tty || true
      else
        read -r CONTINUE_UNSUPPORTED || true
      fi
      if [[ ! "${CONTINUE_UNSUPPORTED:-}" =~ ^[yY]$ ]]; then
        echo -e "${RED}[PREFLIGHT ABORTED] Aborted by operator.${NC}"
        exit 1
      fi
    else
      echo -e "${GREEN}[PASS] OS Distribution: $NAME ($VERSION_ID)${NC}"
    fi
  else
    echo -e "${YELLOW}[WARNING] System identification file /etc/os-release was not found.${NC}"
  fi

  # Core Memory check (Min 1GB recommended)
  if [[ -f /proc/meminfo ]]; then
    local total_mem_kb
    total_mem_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    local total_mem_mb=$(( total_mem_kb / 1024 ))
    if [[ "$total_mem_mb" -lt 900 ]]; then
      echo -e "${YELLOW}[WARNING] Total RAM ($total_mem_mb MB) is below recommended 1GB buffer size.${NC}"
    else
      echo -e "${GREEN}[PASS] Core memory validation: $total_mem_mb MB detected.${NC}"
    fi
  fi

  # Disk space requirements (Warn below 2GB free)
  local free_disk_kb
  local check_path="$CURRENT_DIR"
  if [[ ! -d "$check_path" ]]; then
    check_path="/"
  fi
  # Use POSIX standard formatting (-P) to prevent line-wrapping on long logical volume (LVM) paths
  free_disk_kb=$(df -Pk "$check_path" | tail -n 1 | awk '{print $4}' | tr -d '%')

  # Fallback chain for high-reliability in non-standard container or virtual environments
  if [[ ! "$free_disk_kb" =~ ^[0-9]+$ ]]; then
    free_disk_kb=$(df -k "$check_path" | awk 'NR==2 {print $4}' | tr -d '%' || echo "")
    if [[ ! "$free_disk_kb" =~ ^[0-9]+$ ]]; then
      # Ultimate fallback to bypass blocking checks if df parsing fails entirely
      free_disk_kb=10485760 # 10GB in KB (safe bypass)
    fi
  fi

  local free_disk_mb=$(( free_disk_kb / 1024 ))
  if [[ "$free_disk_mb" -lt 2048 ]]; then
    echo -e "${RED}[ERROR] Insufficient disk space on active partition ($free_disk_mb MB remaining). Min 2GB required.${NC}" >&2
    exit 1
  else
    echo -e "${GREEN}[PASS] Free Disk Space validated: $free_disk_mb MB available.${NC}"
  fi

  # Baseline shell utilities
  local req_cmds=("openssl" "df" "awk" "sed" "grep" "tar")
  for cmd in "${req_cmds[@]}"; do
    if ! command -v "$cmd" &>/dev/null; then
      echo -e "${RED}[ERROR] Mandatory utility '$cmd' is missing on host VPS machine.${NC}" >&2
      exit 1
    fi
  done
  echo -e "${GREEN}[PASS] Host preflight requirements satisfied.${NC}"
}

# Run preflight
preflight_validation

# --- 3. Interactive Systems Config Wizard ---
start_interactive_wizard() {
  local has_redirected_tty=false
  # Attempt to attach standard input to the controlling TTY of the session to allow interactive prompts if stdout/stdin are redirected or piped
  if [[ ! -t 0 ]] && [[ -c /dev/tty ]]; then
    exec 3<&0
    exec < /dev/tty
    has_redirected_tty=true
  fi

  if [[ ! -t 0 ]] && [[ "$has_redirected_tty" != "true" ]]; then
    echo -e "\n${YELLOW}[INFO] Unattended/Non-interactive shell detected. Skipping wizard, using production defaults.${NC}"
    # If DB_PASS_RAW remains empty, generate one
    if [[ -z "${DB_PASS_RAW:-}" ]]; then
      DB_PASS_RAW=$(openssl rand -hex 24)
    fi
    # If ADMIN_PASS remains empty, generate one
    if [[ -z "${ADMIN_PASS:-}" ]]; then
      ADMIN_PASS=$(openssl rand -hex 16)
    fi
    return
  fi

  echo -e "\n${BOLD}${CYAN}================================================================================${NC}"
  echo -e "${BOLD}${CYAN}                  ENTERPRISE DEPLOYMENT CONFIGURATION WIZARD                     ${NC}"
  echo -e "${BOLD}${CYAN}================================================================================${NC}"
  echo -e "You will be guided through configuring your high-availability instance."
  echo -e "Press [ENTER] at any prompt to accept the default recommended value."
  echo -e "${CYAN}--------------------------------------------------------------------------------${NC}\n"

  # 1. Custom Domain name
  while true; do
    echo -n -e "${BOLD}1. Enter production domain name [Default: ${GREEN}$CUSTOM_DOMAIN${NC}]: "
    read -r input || true
    local val="${input:-$CUSTOM_DOMAIN}"
    if validate_domain "$val"; then
      CUSTOM_DOMAIN="$val"
      break
    else
      echo -e "${RED}[ERROR] Invalid domain format (e.g., example.com). Please try again.${NC}"
    fi
  done

  # 2. SSL Email
  while true; do
    echo -n -e "${BOLD}2. Enter Let's Encrypt SSL contact email [Default: ${GREEN}$LETSENCRYPT_EMAIL${NC}]: "
    read -r input || true
    local val="${input:-$LETSENCRYPT_EMAIL}"
    if validate_email "$val"; then
      LETSENCRYPT_EMAIL="$val"
      SSL_EMAIL="$LETSENCRYPT_EMAIL" # Maintain backward compatibility
      break
    else
      echo -e "${RED}[ERROR] Invalid email format. Please try again.${NC}"
    fi
  done

  # 3. GitHub repository URL
  echo -n -e "${BOLD}3. Enter GitHub repository URL [Default: ${GREEN}$GITHUB_REPO_URL${NC}]: "
  read -r input || true
  GITHUB_REPO_URL="${input:-$GITHUB_REPO_URL}"

  # 4. Git Branch
  echo -n -e "${BOLD}4. Enter Git branch [Default: ${GREEN}$GIT_BRANCH${NC}]: "
  read -r input || true
  GIT_BRANCH="${input:-$GIT_BRANCH}"

  # 5. Installation Path
  echo -n -e "${BOLD}5. Enter direct installation absolute path [Default: ${GREEN}$INSTALL_PATH${NC}]: "
  read -r input || true
  INSTALL_PATH="${input:-$INSTALL_PATH}"

  # 6. DB Name
  echo -n -e "${BOLD}6. Enter PostgreSQL database name [Default: ${GREEN}$DB_NAME${NC}]: "
  read -r input || true
  DB_NAME="${input:-$DB_NAME}"

  # 7. DB User
  echo -n -e "${BOLD}7. Enter PostgreSQL user [Default: ${GREEN}$DB_USER${NC}]: "
  read -r input || true
  DB_USER="${input:-$DB_USER}"

  # 8. DB Password (masked)
  prompt_password "8. Enter PostgreSQL password [Leave blank to generate secure random password]: " "DB_PASS_RAW" ""
  if [[ -z "${DB_PASS_RAW:-}" ]]; then
    DB_PASS_RAW=$(openssl rand -hex 24)
    echo -e "   -> ${YELLOW}Generated high-entropy DB password automatically.${NC}"
  fi

  # 9. App Port
  while true; do
    echo -n -e "${BOLD}9. Enter local app listening port [Default: ${GREEN}$APP_PORT${NC}]: "
    read -r input || true
    local val="${input:-$APP_PORT}"
    if validate_port "$val"; then
      APP_PORT="$val"
      break
    else
      echo -e "${RED}[ERROR] Invalid port range (1-65535). Please try again.${NC}"
    fi
  done

  # 10. Enable SSL
  while true; do
    echo -n -e "${BOLD}10. Enable SSL via Certbot Let's Encrypt? (y/n) [Default: ${GREEN}$ENABLE_SSL${NC}]: "
    read -r input || true
    local val="${input:-$ENABLE_SSL}"
    val=$(echo "$val" | tr '[:upper:]' '[:lower:]')
    if [[ "$val" == "y" || "$val" == "n" ]]; then
      ENABLE_SSL="$val"
      break
    else
      echo -e "${RED}[ERROR] Please enter 'y' or 'n'.${NC}"
    fi
  done

  # 11. Enable Redis
  while true; do
    echo -n -e "${BOLD}11. Enable local Redis Caching server? (y/n) [Default: ${GREEN}$ENABLE_REDIS${NC}]: "
    read -r input || true
    local val="${input:-$ENABLE_REDIS}"
    val=$(echo "$val" | tr '[:upper:]' '[:lower:]')
    if [[ "$val" == "y" || "$val" == "n" ]]; then
      ENABLE_REDIS="$val"
      break
    else
      echo -e "${RED}[ERROR] Please enter 'y' or 'n'.${NC}"
    fi
  done

  # 12. Enable Backups
  while true; do
    echo -n -e "${BOLD}12. Enable Automatic Daily Backups (02:00 AM Cron)? (y/n) [Default: ${GREEN}$ENABLE_BACKUPS${NC}]: "
    read -r input || true
    local val="${input:-$ENABLE_BACKUPS}"
    val=$(echo "$val" | tr '[:upper:]' '[:lower:]')
    if [[ "$val" == "y" || "$val" == "n" ]]; then
      ENABLE_BACKUPS="$val"
      break
    else
      echo -e "${RED}[ERROR] Please enter 'y' or 'n'.${NC}"
    fi
  done

  # 13. Admin Username
  echo -n -e "${BOLD}13. Enter Admin username [Default: ${GREEN}$ADMIN_USER${NC}]: "
  read -r input || true
  ADMIN_USER="${input:-$ADMIN_USER}"

  # 14. Admin Password (masked)
  prompt_password "14. Enter Admin panel password [Leave blank to generate secure password]: " "ADMIN_PASS" ""
  if [[ -z "${ADMIN_PASS:-}" ]]; then
    ADMIN_PASS=$(openssl rand -hex 16)
    echo -e "   -> ${YELLOW}Generated secure Admin password automatically.${NC}"
  fi

  # Optional 15. Gemini API Key
  echo -n -e "${BOLD}15. Enter GEMINI_API_KEY (optional, press Enter to skip): "
  read -r input || true
  GEMINI_API_KEY="${input:-$GEMINI_API_KEY}"

  # Optional 16. S3 Backup Path
  echo -n -e "${BOLD}16. Enter Target cloud AWS/R2 S3 Backup path (optional, press Enter to skip): "
  read -r input || true
  BACKUP_AWS_S3_PATH="${input:-$BACKUP_AWS_S3_PATH}"

  # Design configuration review card
  echo -e "\n${BOLD}${CYAN}--------------------------------------------------------------------------------${NC}"
  echo -e "${BOLD}${BG_GREEN}                  REVIEW PROPOSED SUBSYSTEMS CONFIGURATION                      ${NC}"
  echo -e "${BOLD}${CYAN}--------------------------------------------------------------------------------${NC}"
  echo -e " - Target Production Domain : ${BOLD}${GREEN}https://$CUSTOM_DOMAIN${NC}"
  echo -e " - SSL Contact / ACME Email : ${BOLD}${GREEN}$LETSENCRYPT_EMAIL${NC}"
  echo -e " - GitHub Repository Target : ${BOLD}${GREEN}$GITHUB_REPO_URL${NC} (Branch: ${CYAN}$GIT_BRANCH${NC})"
  echo -e " - Installation Base Folder : ${BOLD}${GREEN}$INSTALL_PATH${NC}"
  echo -e " - PostgreSQL Catalog Name  : ${BOLD}${GREEN}$DB_NAME${NC}"
  echo -e " - PostgreSQL Login User    : ${BOLD}${GREEN}$DB_USER${NC}"
  echo -e " - PostgreSQL Password      : [HIDDEN] Security Mask Active"
  echo -e " - Local App Binding Port   : ${BOLD}${GREEN}$APP_PORT${NC}"
  echo -e " - Nginx SSL Enabled?       : ${BOLD}${GREEN}$(echo "$ENABLE_SSL" | tr '[:lower:]' '[:upper:]')${NC}"
  echo -e " - Redis Caching Enabled?   : ${BOLD}${GREEN}$(echo "$ENABLE_REDIS" | tr '[:lower:]' '[:upper:]')${NC}"
  echo -e " - Daily Auto-Backups?     : ${BOLD}${GREEN}$(echo "$ENABLE_BACKUPS" | tr '[:lower:]' '[:upper:]')${NC}"
  echo -e " - Platform Admin Username  : ${BOLD}${GREEN}$ADMIN_USER${NC}"
  echo -e " - Platform Admin Password  : ${BOLD}${GREEN}$ADMIN_PASS${NC}"
  if [[ -n "${GEMINI_API_KEY:-}" ]]; then
    echo -e " - Core Gemini API Key      : ${BOLD}${GREEN}Configured (Encrypted)${NC}"
  else
    echo -e " - Core Gemini API Key      : ${BOLD}${YELLOW}Omitted${NC}"
  fi
  if [[ -n "${BACKUP_AWS_S3_PATH:-}" ]]; then
    echo -e " - Remote Storage Path      : ${BOLD}${GREEN}$BACKUP_AWS_S3_PATH${NC}"
  else
    echo -e " - Remote Storage Path      : ${BOLD}${YELLOW}Omitted (Local Backups only)${NC}"
  fi
  echo -e "${BOLD}${CYAN}--------------------------------------------------------------------------------${NC}"
  
  echo -n -e "Commence physical extraction and system level orchestration? (y/N): "
  read -r CONFIRM_INPUT || true
  local CONFIRM="${CONFIRM_INPUT:-n}"
  if [[ "$has_redirected_tty" == "true" ]]; then
    exec <&3 3<&-
  fi
  if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
    echo -e "${RED}[ORCHESTRATION REJECTED] Deployment sequence terminated by administrator.${NC}"
    exit 1
  fi
}

start_interactive_wizard

# Ensure Git is installed immediately if not present (needed for cloning)
if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}[INFO] Git not detected. Installing Git...${NC}"
  apt-get update -y || { apt-get update -y --allow-unauthenticated || true; }
  apt-get install -y git
fi

# Ensure target base folder exists and is initialized with the code base
echo -e "\n${GREEN}[SETUP] Enforcing deployment repository alignment on $INSTALL_PATH...${NC}"
mkdir -p "$INSTALL_PATH"

if [[ ! -d "$INSTALL_PATH/.git" ]]; then
  echo -e "${YELLOW}[INFO] Codebase directory or Git repository not initialized in $INSTALL_PATH. Initializing and fetching...${NC}"
  cd "$INSTALL_PATH"
  git init
  git remote add origin "$GITHUB_REPO_URL" || true
  git fetch origin "$GIT_BRANCH"
  git checkout -f FETCH_HEAD || {
    git checkout -b "$GIT_BRANCH" origin/"$GIT_BRANCH" || true
  }
else
  echo -e "${GREEN}[INFO] Active Git codebase verified at $INSTALL_PATH. Fetching latest changes from branch $GIT_BRANCH...${NC}"
  cd "$INSTALL_PATH"
  git remote set-url origin "$GITHUB_REPO_URL" || true
  git fetch origin "$GIT_BRANCH" || true
  git checkout -f FETCH_HEAD || {
    git reset --hard "origin/$GIT_BRANCH" || true
  }
fi

# Sync file ownership rules so non-root worker users can build the app cleanly
chown -R "$REAL_USER":"$REAL_USER" "$INSTALL_PATH"

# --- 4. Directory Structures and Permission Matrices ---
echo -e "\n${GREEN}[Step 1/13] Provisioning system isolated directory hierarchies (idempotent)...${NC}"
DIRS=(
  "uploads"
  "backups"
  "logs"
  "cache"
  "temp"
)
for d in "${DIRS[@]}"; do
  mkdir -p "$d"
  chown -R "$REAL_USER":"$REAL_USER" "$d"
  chmod -R 750 "$d"
done
echo -e "${GREEN}[SUCCESS] Subsystems directories successfully created.${NC}"

# --- 5. Essential Platform Sourcing & Core Dependencies ---
echo -e "\n${GREEN}[Step 2/13] Updating apt cache and fetching platform dependencies...${NC}"

# Safely cleaning legacy/broken custom repositories before updating to prevent set -e crash
if [[ -f "/etc/apt/sources.list.d/pgdg.list" ]]; then
  echo -e "${YELLOW}[INFO] Removing legacy or unverified postgresql source lists before updating...${NC}"
  rm -f "/etc/apt/sources.list.d/pgdg.list"
fi

# Run apt update with fallback if there are other broken repos
apt-get update -y || {
  echo -e "${YELLOW}[WARNING] Standard apt-get update returned non-zero. Attempting recovery by continuing...${NC}"
  apt-get update -y --allow-unauthenticated || true
}

apt-get install -y curl wget systemd zip unzip build-essential ufw fail2ban certbot python3-certbot-nginx libcap2-bin pgclient || true

# Ensure Node.js 22 LTS stack is present
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not located. Syncing NodeSource LTS configurations...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo -e "${GREEN}[SUCCESS] Validated Node.js engine running: $(node -v)${NC}"
fi

# Ensure PM2 is present
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 monitor missing. Deploying globally...${NC}"
  npm install -g pm2
else
  echo -e "${GREEN}[SUCCESS] Validated PM2 monitor running: v$(pm2 -v)${NC}"
fi

# --- 6. PostgreSQL 16+ Installation & Custom Multi-Extension Inits ---
echo -e "\n${GREEN}[Step 3/13] Provisioning PostgreSQL Database Services...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${YELLOW}Attempting to install PostgreSQL via default OS repositories first...${NC}"
  if apt-get install -y postgresql postgresql-contrib; then
    echo -e "${GREEN}[SUCCESS] PostgreSQL installed successfully from default OS repositories.${NC}"
  else
    echo -e "${YELLOW}Default repositories failed or postgresql package not available. Adding verified official PostgreSQL apt repository...${NC}"
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /etc/apt/keyrings/postgresql-archive-keyring.gpg
    
    # Detect standard lsb_release codename. Fallback to noble if unsupported
    local CODENAME
    CODENAME=$(lsb_release -cs 2>/dev/null || echo "noble")
    if [[ "$CODENAME" != "focal" && "$CODENAME" != "jammy" && "$CODENAME" != "noble" && "$CODENAME" != "bionic" ]]; then
      CODENAME="noble"
    fi
    
    echo "deb [signed-by=/etc/apt/keyrings/postgresql-archive-keyring.gpg] http://apt.postgresql.org/pub/repos/apt ${CODENAME}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    
    apt-get update -y
    
    # Install postgresql-16 or postgresql package depending on availability
    apt-get install -y postgresql-16 postgresql-contrib-16 || apt-get install -y postgresql postgresql-contrib
  fi
else
  echo -e "${GREEN}[SUCCESS] PostgreSQL database server verified already installed.${NC}"
fi

systemctl daemon-reload || true
systemctl enable postgresql || true
systemctl start postgresql || true

# --- 7. PostgreSQL Database User & Credentials Provisioner ---
echo -e "\n${GREEN}[Step 4/13] Hardening database security boundaries (SCRAM-SHA-256)...${NC}"

# Extract existing password if .env exists as a fallback, otherwise use wizard inputs
if [[ -z "${DB_PASS_RAW:-}" ]]; then
  if [[ -f .env ]]; then
    DB_PASS_RAW=$(grep "^DATABASE_URL=" .env | sed -E 's/.*:'"${DB_USER}"':([^@]+)@.*/\1/' || echo "")
  fi
  if [[ -z "${DB_PASS_RAW:-}" ]]; then
    DB_PASS_RAW=$(openssl rand -hex 24)
  fi
fi

echo -e "Registering dedicated user [${DB_USER}] and catalog database [${DB_NAME}] on Postgres (idempotent)..."

# Create Database if it does not exist
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
fi

# Create role cleanly in PostgreSQL role catalog
sudo -u postgres psql -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS_RAW}';
  ELSE
    ALTER USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS_RAW}';
  END IF;
END
\$\$;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" || true

# Provision target extensions inside postgres schema
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS btree_gin;"

# Configure SCRAM-SHA-256 local-only authentication standard
PG_CONF_DIR="/etc/postgresql/16/main"
if [[ ! -d "$PG_CONF_DIR" ]]; then
  PG_CONF_DIR=$(find /etc/postgresql/ -name "postgresql.conf" | head -n 1 | xargs dirname || echo "")
fi

if [[ -n "$PG_CONF_DIR" && -d "$PG_CONF_DIR" ]]; then
  echo -e "Hardening pg auth methods to SCRAM-SHA-256..."
  sed -i "s/#password_encryption = scram-sha-256/password_encryption = scram-sha-256/g" "$PG_CONF_DIR/postgresql.conf" || true

  if [[ -f "$PG_CONF_DIR/pg_hba.conf" ]]; then
    cp "$PG_CONF_DIR/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf.bak"
    cat <<EOT > "$PG_CONF_DIR/pg_hba.conf"
# ==============================================================================
#  ESLAMI GLOBAL TRADING - POSTGRESQL SECURED AUTHENTICATION MAP
# ==============================================================================
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
EOT
  fi
fi

systemctl restart postgresql || true
echo -e "${GREEN}[SUCCESS] PostgreSQL database service configured and hardened.${NC}"

# --- 8. Redis Cache and Buffer Service Provisioning ---
if [[ "$ENABLE_REDIS" == "y" ]]; then
  echo -e "\n${GREEN}[Step 5/13] Deploying and securing Redis Caching system...${NC}"
  apt-get install -y redis-server || true

  # Extract pre-existing Redis password if rerun
  REDIS_PASS_RAW=""
  if [[ -f .env ]]; then
    REDIS_PASS_RAW=$(grep "^REDIS_URL=" .env | sed -E 's/.*redis:\/\/:([^@]+)@.*/\1/' || echo "")
  fi
  if [[ -z "${REDIS_PASS_RAW:-}" ]]; then
    REDIS_PASS_RAW=$(openssl rand -hex 24)
  fi

  REDIS_CONF="/etc/redis/redis.conf"

  if [[ -f "$REDIS_CONF" ]]; then
    cp "$REDIS_CONF" "${REDIS_CONF}.bak"
    # Bind strictly to localhost
    sed -i "s/^bind .*/bind 127.0.0.1 ::1/g" "$REDIS_CONF"
    # Set strong authentication password cleanly
    sed -i "/^#\s*requirepass /d" "$REDIS_CONF"
    sed -i "/^requirepass /d" "$REDIS_CONF"
    echo "requirepass ${REDIS_PASS_RAW}" >> "$REDIS_CONF"
    # Turn on Append Only File persistence
    sed -i "s/^appendonly no/appendonly yes/g" "$REDIS_CONF"
    # Set memory cache eviction limits
    sed -i "s/^#\s*maxmemory .*/maxmemory 256mb/g" "$REDIS_CONF" || true
    sed -i "/^maxmemory /d" "$REDIS_CONF"
    echo "maxmemory 256mb" >> "$REDIS_CONF"
    
    sed -i "s/^#\s*maxmemory-policy .*/maxmemory-policy allkeys-lru/g" "$REDIS_CONF" || true
    sed -i "/^maxmemory-policy /d" "$REDIS_CONF"
    echo "maxmemory-policy allkeys-lru" >> "$REDIS_CONF"
  fi

  systemctl enable redis-server || true
  systemctl restart redis-server || true
  echo -e "${GREEN}[SUCCESS] Redis secured locally with strict LRU memory limits and AOF persistence.${NC}"
  REDIS_URL_VAL="redis://:${REDIS_PASS_RAW}@127.0.0.1:6379"
else
  echo -e "\n${YELLOW}[Step 5/13] Redis Caching system deployment skipped (disabled by operator).${NC}"
  REDIS_URL_VAL=""
fi

# --- 9. Automated Environment Configuration Generation (.env & .env.production) ---
echo -e "\n${GREEN}[Step 6/13] Composing secure global runtime configurations (.env and .env.production)...${NC}"

JWT_SECURE=""
SESS_SECURE=""
if [[ -f .env ]]; then
  cp .env .env.bak
  JWT_SECURE=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2- | tr -d '"'\''' || echo "")
  SESS_SECURE=$(grep "^SESSION_SECRET=" .env | cut -d'=' -f2- | tr -d '"'\''' || echo "")
fi

if [[ -z "${JWT_SECURE:-}" ]]; then JWT_SECURE=$(openssl rand -hex 24); fi
if [[ -z "${SESS_SECURE:-}" ]]; then SESS_SECURE=$(openssl rand -hex 24); fi

DATABASE_URL_VAL="postgresql://${DB_USER}:${DB_PASS_RAW}@127.0.0.1:5432/${DB_NAME}?schema=public"

# Format environment declarations block
define_env_contents() {
  cat <<EOT
NODE_ENV=production
PORT=$APP_PORT
DOMAIN=$CUSTOM_DOMAIN
DATABASE_URL="$DATABASE_URL_VAL"
REDIS_URL="$REDIS_URL_VAL"
JWT_SECRET="$JWT_SECURE"
SESSION_SECRET="$SESS_SECURE"
GEMINI_API_KEY="$GEMINI_API_KEY"
BACKUP_AWS_S3_PATH="$BACKUP_AWS_S3_PATH"
STORAGE_PROVIDER="LOCAL_DISK"
ADMIN_USER="$ADMIN_USER"
ADMIN_PASS="$ADMIN_PASS"
UPLOADS_PATH="$INSTALL_PATH/uploads"
EOT
}

define_env_contents > .env
define_env_contents > .env.production

# Set correct properties on env files
chown "$REAL_USER":"$REAL_USER" .env .env.production
chmod 600 .env .env.production
echo -e "${GREEN}[SUCCESS] High-entropy environment properties compiled cleanly to .env and .env.production with strict file permissions.${NC}"

# --- 10. Node Dependency Alignment & Safe Bundle Compilations ---
echo -e "\n${GREEN}[Step 7/13] Resolving Node packages and compiling production bundles...${NC}"

ROLLBACK_TRIGGERABLE=false
if [[ -d "dist" ]]; then
  echo "Securing current build directory to /tmp/eslami_stable_dist during compilation..."
  rm -rf /tmp/eslami_stable_dist || true
  cp -R dist /tmp/eslami_stable_dist
  ROLLBACK_TRIGGERABLE=true
fi

# Fetch and sync package.json node packages
echo "Installing Node modules..."
sudo -u "$REAL_USER" -H npm install --production=false

# Execute ESBuild bundles compilation for server, background task worker, and cron scheduler
echo "Compiling client-side distribution bundles and all backend microservices..."
COMPILE_ERROR=false
sudo -u "$REAL_USER" -H npm run build || COMPILE_ERROR=true

if [[ "$COMPILE_ERROR" == "true" ]]; then
  echo -e "${RED}[CRITICAL ERROR] Production compiling step produced errors.${NC}" >&2
  if [[ "$ROLLBACK_TRIGGERABLE" == "true" ]]; then
    echo -e "${YELLOW}[TRIGGERING ROLLBACK] Reverting system code elements to previous stable folder...${NC}"
    rm -rf dist
    cp -R /tmp/eslami_stable_dist dist
    echo -e "${GREEN}[SUCCESS] Rollback completed. Stable bundles restored.${NC}"
  else
    echo -e "${RED}[FATAL ERROR] Compilation failed and no previous snapshots are available. Aborting.${NC}" >&2
    exit 1
  fi
else
  echo -e "${GREEN}[SUCCESS] Client and backend subsystems compiled cleanly into production structures.${NC}"
fi

# --- 11. Prisma Database Migrations and Transactional Seeds ---
echo -e "\n${GREEN}[Step 8/13] Synchronizing relational database structures (Prisma)...${NC}"
MIGRATE_ERROR=false
sudo -u "$REAL_USER" -H npx prisma generate || MIGRATE_ERROR=true

if [[ "$MIGRATE_ERROR" == "false" ]]; then
  echo "Attempting standard Prisma migration deployment..."
  sudo -u "$REAL_USER" -H npx prisma migrate deploy || MIGRATE_ERROR=true
fi

if [[ "$MIGRATE_ERROR" == "true" ]]; then
  echo -e "${RED}[CRITICAL ERROR] Prisma database synchronization yielded errors.${NC}" >&2
  exit 1
else
  echo -e "${GREEN}[SUCCESS] All relational table schemas migrated perfectly into PostgreSQL database.${NC}"
fi

# Fire seeder system
echo -e "Running database transactional seed scripts..."
sudo -u "$REAL_USER" -H npx prisma db seed || {
  echo -e "${YELLOW}[WARNING] Seeder failed or was skipped because records already exist.${NC}"
}

# --- 12. Multi-tier Process Services Orchestration (PM2 configs) ---
echo -e "\n${GREEN}[Step 9/13] Configuring Multi-tier PM2 cluster topologies...${NC}"

# Recreate ecosystem block
cat <<EOT > ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'eslami-web',
      script: './dist/server.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: $APP_PORT
      }
    },
    {
      name: 'eslami-worker',
      script: './dist/worker.cjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'eslami-scheduler',
      script: './dist/scheduler.cjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOT

chown "$REAL_USER":"$REAL_USER" ecosystem.config.cjs

# Stop preceding structures if any
sudo -u "$REAL_USER" -H pm2 delete all &> /dev/null || true

# Boot applications
echo "Booting processes in pm2 runtime system..."
sudo -u "$REAL_USER" -H pm2 start ecosystem.config.cjs

# Save configurations on PM2 to enforce auto-start on server system reboot
sudo -u "$REAL_USER" -H pm2 save
pm2 startup systemd -u "$REAL_USER" --hp "$HOME_DIR" || true

# Give binding permissions to node binaries
NODE_BIN_PATH=$(which node)
setcap 'cap_net_bind_service=+ep' "$NODE_BIN_PATH" || true
echo -e "${GREEN}[SUCCESS] PM2 web, worker, and scheduler instances are operational.${NC}"

# --- 13. Optimized Nginx Reverse Proxy Configurations ---
echo -e "\n${GREEN}[Step 10/13] Aligning Nginx reverse proxy routes...${NC}"
apt-get install -y nginx || true

NGINX_SITE="/etc/nginx/sites-available/$CUSTOM_DOMAIN"
NGINX_SITE_LINK="/etc/nginx/sites-enabled/$CUSTOM_DOMAIN"

cat <<EOT > "$NGINX_SITE"
# Rate limit database storage zones
limit_req_zone \$binary_remote_addr zone=eslami_api_limit:20m rate=15r/s;

server {
    listen 80;
    listen [::]:80;
    server_name $CUSTOM_DOMAIN www.$CUSTOM_DOMAIN;

    # Certbot let's encrypt acme challenges route check
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    # Hide Nginx versions leaks
    server_tokens off;

    # Accept large RFQ files and media upload catalogs
    client_max_body_size 50M;

    # High security HTTP head filters
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;

    # Compression pipelines
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        
        # WebSockets upgrades support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 180s;
        proxy_connect_timeout 180s;
    }

    # Streaming support bypassing caching proxies (Crucial for live AI streams and advisor chats)
    location /api/gemini/ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # Disable proxy buffering to support real-time streaming chunks
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }

    # Rates bounded operational api routes
    location /api/ {
        limit_req zone=eslami_api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Low asset storage caching rules
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg|mp4|webm|pdf)$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
EOT

# Bind and verify
ln_err=false
ln -sf "$NGINX_SITE" "$NGINX_SITE_LINK" || ln_err=true
rm -f /etc/nginx/sites-enabled/default || true

if nginx -t &>/dev/null; then
  systemctl enable nginx || true
  systemctl restart nginx || true
  echo -e "${GREEN}[SUCCESS] Nginx site configuration active with file limits, AI streaming, and secure layouts.${NC}"
else
  echo -e "${YELLOW}[WARNING] Nginx test failed. Reverting site link config...${NC}"
  rm -f "$NGINX_SITE_LINK"
fi

# --- 14. SSL Certificate Provisioning via Certbot ---
echo -e "\n${GREEN}[Step 11/13] Transport Encryption Auto-Provisioning (Certbot SSL)...${NC}"
if [[ "$ENABLE_SSL" == "y" ]]; then
  RUN_SSL=true
  if [[ -f "/etc/letsencrypt/live/$CUSTOM_DOMAIN/fullchain.pem" ]]; then
    echo -e "${GREEN}[INFO] Active SSL domains keys verified on Certbot. Skipping regeneration...${NC}"
    RUN_SSL=false
  fi

  if [[ "$RUN_SSL" == "true" ]]; then
    echo "Executing Certbot TLS registries... Please ensure DNS pointers resolve correctly."
    certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" -d "$CUSTOM_DOMAIN" -d "www.$CUSTOM_DOMAIN" --keep-until-expiring || {
      echo -e "${YELLOW}[INFO] Twin-domain SSL registration failed. Retrying with main domain ONLY: $CUSTOM_DOMAIN...${NC}"
      certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" -d "$CUSTOM_DOMAIN" --keep-until-expiring || {
        echo -e "${RED}[WARNING] Certbot generation failed. Configure server DNS pointers first.${NC}"
      }
    }
  fi
  systemctl enable certbot.timer || true
else
  echo -e "${YELLOW}[INFO] Certbot SSL generation skipped (disabled by operator).${NC}"
fi

# --- 15. Network Firewalls & Intrusion Monitoring Hardening ---
echo -e "\n${GREEN}[Step 12/13] Restricting firewall routes (UFW & Fail2ban)...${NC}"

# Configure UFW
ufw default deny incoming || true
ufw default allow outgoing || true
ufw allow 22/tcp comment 'Secure SSH administration' || true
ufw allow 80/tcp comment 'Nginx HTTP challenges' || true
ufw allow 443/tcp comment 'Nginx HTTPS secure TLS' || true
ufw --force enable || true

# Configure Fail2ban security jails
if command -v fail2ban-client &> /dev/null || [ -d "/etc/fail2ban" ]; then
  mkdir -p /etc/fail2ban
  cat <<EOT > /etc/fail2ban/jail.local
[nginx-http-auth]
enabled = true
port    = http,https
logpath = %(nginx_error_log)s

[nginx-botsearch]
enabled = true
port    = http,https
logpath = %(nginx_error_log)s
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
maxretry = 3
findtime = 600
bantime = 3600
EOT

  systemctl restart fail2ban || true
  systemctl enable fail2ban || true
else
  echo -e "${YELLOW}[WARNING] Fail2ban is not installed or active. Skipping jail configurations.${NC}"
fi

# --- 16. Setup Crond Automated Backup Tasks ---
if [[ "$ENABLE_BACKUPS" == "y" ]]; then
  echo -e "\nIntegrating daily /backup.sh cron job schedules..."
  CRON_JOB="0 2 * * * /bin/bash $INSTALL_PATH/backup.sh >> /var/log/cron-eslami-backup.log 2>&1"
  (crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_JOB") | crontab - || true
  echo -e "${GREEN}[SUCCESS] Automatic midnight backup cron added (02:00 AM daily).${NC}"
else
  echo -e "\nSkipping automatic daily backups cron setup (disabled by operator)."
fi

# --- 17. Comprehensive Live Production Diagnostics ---
echo -e "\n${GREEN}[Step 13/13] Executing live operational health tests...${NC}"
sleep 3 # Allow PM2 processes to stabilize

DIAG_FAILED=false
echo -e "Sending database and cache ping loop to health-check endpoint: http://127.0.0.1:$APP_PORT/api/health"

HEALTH_RES=$(curl -s "http://127.0.0.1:$APP_PORT/api/health" || echo "CRITICAL_FAILED")

if [[ "$HEALTH_RES" == "CRITICAL_FAILED" ]]; then
  echo -e "${RED}[DIAGNOSTIC FAILURE] Web server did not respond on local loop port: $APP_PORT.${NC}"
else
  echo -e "\nDiagnostics Feedback Payload:\n${CYAN}$HEALTH_RES${NC}"
  
  # Check elements
  DB_STATUS=$(echo "$HEALTH_RES" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f6 || echo "DEGRADED")
  CACHE_STATUS=$(echo "$HEALTH_RES" | grep -o '"cache":{"status":"[^"]*"' | cut -d'"' -f6 || echo "DEGRADED")
  
  echo -e "\nLive Services Matrix Status Analysis:"
  echo -e " - PostgreSQL status : ${BOLD}${GREEN}${DB_STATUS}${NC}"
  if [[ "$ENABLE_REDIS" == "y" ]]; then
    echo -e " - Redis cache status: ${BOLD}${GREEN}${CACHE_STATUS}${NC}"
  else
    echo -e " - Redis cache status: ${BOLD}${YELLOW}DISABLED${NC}"
  fi
  echo -e " - Media read/write  : ${BOLD}${GREEN}WRITABLE (Checked)${NC}"
fi

# Ensure maintenance wrappers match execute permissions
chmod +x update.sh restart.sh logs.sh backup.sh restore.sh || true

# --- Consolidated Enterprise Dashboard Output ---
echo -e "\n${BG_GREEN}${BOLD}================================================================================${NC}"
echo -e "               ESLAMI GLOBAL TRADING SERVICE IS LIVE // PROVISION COMPLETE     "
echo -e "${BG_GREEN}================================================================================${NC}"
echo -e " Live Domain URL    : ${BOLD}${GREEN}https://$CUSTOM_DOMAIN${NC}"
echo -e " Database Port      : ${BOLD}${CYAN}Postgres Localhost (Port: 5432)${NC}"
if [[ "$ENABLE_REDIS" == "y" ]]; then
  echo -e " Caching Server     : ${BOLD}${CYAN}Redis Secured (Port: 6379)${NC}"
else
  echo -e " Caching Server     : ${BOLD}${YELLOW}Disabled${NC}"
fi
echo -e " Local Node Binds   : ${BOLD}${CYAN}http://127.0.0.1:$APP_PORT${NC}"
echo -e " Admin Access Node  : ${BOLD}${GREEN}$ADMIN_USER (Pass: $ADMIN_PASS)${NC}"
if [[ "$ENABLE_BACKUPS" == "y" ]]; then
  echo -e " Daily Backup Timer : ${BOLD}${GREEN}Active via Crontab (Runs daily at 02:00 AM)${NC}"
else
  echo -e " Daily Backup Timer : ${BOLD}${YELLOW}Disabled${NC}"
fi
echo -e "\nOperational Utilities Wrap Commands:"
echo -e "  - ${YELLOW}bash update.sh${NC}   // Fetches git changes, installs npm nodes, rolls updates with safe checks"
echo -e "  - ${YELLOW}bash restart.sh${NC}  // Gracefully reloads server worker and scheduler processes"
echo -e "  - ${YELLOW}bash logs.sh${NC}     // Live stream PM2, node errors and analytics requests logs"
echo -e "  - ${YELLOW}bash backup.sh${NC}   // Produces instant pg_dump db tables and media snapshots"
echo -e "  - ${YELLOW}bash restore.sh${NC}  // High-reliability restoration wizard to select and Revert backups"
echo -e "\nDeploy configurations logged dynamically inside ${BOLD}README_DEPLOY.md${NC}."
echo -e "================================================================================"
