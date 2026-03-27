#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO_URL="https://github.com/nebuliton/nebu-secure.git"
DEFAULT_BRANCH="main"
DEFAULT_APP_DIR="/var/www/nebu-secure"
DEFAULT_APP_NAME="Nebu Secure"
DEFAULT_APP_USER="www-data"
DEFAULT_APP_ENV="production"
DEFAULT_DB_CONNECTION="mysql"
DEFAULT_MAIL_MODE="log"
DEFAULT_RUNTIME_USER="www-data"

if [[ -t 1 ]]; then
    BOLD="$(printf '\033[1m')"
    DIM="$(printf '\033[2m')"
    RED="$(printf '\033[31m')"
    GREEN="$(printf '\033[32m')"
    YELLOW="$(printf '\033[33m')"
    BLUE="$(printf '\033[34m')"
    MAGENTA="$(printf '\033[35m')"
    CYAN="$(printf '\033[36m')"
    RESET="$(printf '\033[0m')"
else
    BOLD=""
    DIM=""
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    MAGENTA=""
    CYAN=""
    RESET=""
fi

APP_DIR=""
APP_USER=""
APP_GROUP=""
APP_DOMAIN=""
APP_SERVER_NAMES=""
APP_URL=""
SESSION_DOMAIN_VALUE=""
SANCTUM_STATEFUL_DOMAINS_VALUE=""
REPO_URL=""
REPO_BRANCH=""
APP_NAME_VALUE=""
APP_ENV_VALUE=""
DB_CONNECTION_VALUE=""
DB_HOST_VALUE=""
DB_PORT_VALUE=""
DB_DATABASE_VALUE=""
DB_USERNAME_VALUE=""
DB_PASSWORD_VALUE=""
MAIL_MODE_VALUE=""
MAIL_HOST_VALUE=""
MAIL_PORT_VALUE=""
MAIL_USERNAME_VALUE=""
MAIL_PASSWORD_VALUE=""
MAIL_FROM_ADDRESS_VALUE=""
MAIL_FROM_NAME_VALUE=""
ENABLE_HTTPS="yes"
SSL_EMAIL=""
INSTALL_LOCAL_MARIADB="yes"
CREATE_ADMIN_USER="yes"
ADMIN_NAME_VALUE=""
ADMIN_EMAIL_VALUE=""
ADMIN_PASSWORD_VALUE=""
GENERATED_ADMIN_PASSWORD=""
ENV_FILE=""
PHP_BIN="php"
PHP_FPM_SERVICE=""
PHP_FPM_SOCK=""
BACKUP_PATH=""
NGINX_SITE_NAME="nebu-secure"
OS_ID=""
RUNTIME_USER=""

timestamp() {
    date '+%H:%M:%S'
}

print_line() {
    local level="$1"
    local color="$2"
    shift 2
    printf '%s[%s] [%s]%s %s\n' "$color" "$(timestamp)" "$level" "$RESET" "$*"
}

info() {
    print_line "INFO" "$BLUE" "$@"
}

step() {
    print_line "STEP" "$CYAN" "$@"
}

warn() {
    print_line "WARN" "$YELLOW" "$@"
}

success() {
    print_line "OK" "$GREEN" "$@"
}

die() {
    print_line "ERR" "$RED" "$@"
    exit 1
}

show_banner() {
    printf '\n%s' "$BOLD$MAGENTA"
    cat <<'EOF'
███╗   ██╗███████╗██████╗ ██╗   ██╗    ███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗
████╗  ██║██╔════╝██╔══██╗██║   ██║    ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝
██╔██╗ ██║█████╗  ██████╔╝██║   ██║    ███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗
██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║    ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝
██║ ╚████║███████╗██████╔╝╚██████╔╝    ███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗
╚═╝  ╚═══╝╚══════╝╚═════╝  ╚═════╝     ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
EOF
    printf '%s\n\n' "$RESET"
    info "Interaktiver Voll-Installer für Nebu Secure"
}

require_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        die "Bitte als root ausführen."
    fi
}

prompt() {
    local var_name="$1"
    local question="$2"
    local default_value="${3:-}"
    local required="${4:-yes}"
    local value=""

    while true; do
        if [[ -n "$default_value" ]]; then
            printf '%s%s%s [%s]: ' "$BOLD" "$question" "$RESET" "$default_value"
        else
            printf '%s%s%s: ' "$BOLD" "$question" "$RESET"
        fi

        read -r value

        if [[ -z "$value" ]]; then
            value="$default_value"
        fi

        if [[ "$required" = "no" || -n "$value" ]]; then
            printf -v "$var_name" '%s' "$value"
            return
        fi

        warn "Dieses Feld darf nicht leer sein."
    done
}

prompt_secret() {
    local var_name="$1"
    local question="$2"
    local required="${3:-yes}"
    local value=""

    while true; do
        printf '%s%s%s: ' "$BOLD" "$question" "$RESET"
        stty -echo
        read -r value
        stty echo
        printf '\n'

        if [[ "$required" = "no" || -n "$value" ]]; then
            printf -v "$var_name" '%s' "$value"
            return
        fi

        warn "Dieses Feld darf nicht leer sein."
    done
}

prompt_yes_no() {
    local var_name="$1"
    local question="$2"
    local default_value="${3:-yes}"
    local normalized_default="j/N"

    if [[ "$default_value" = "yes" ]]; then
        normalized_default="J/n"
    fi

    while true; do
        printf '%s%s%s [%s]: ' "$BOLD" "$question" "$RESET" "$normalized_default"
        read -r answer
        answer="$(printf '%s' "${answer:-}" | tr '[:upper:]' '[:lower:]')"

        if [[ -z "$answer" ]]; then
            printf -v "$var_name" '%s' "$default_value"
            return
        fi

        case "$answer" in
            j|ja|y|yes)
                printf -v "$var_name" '%s' "yes"
                return
                ;;
            n|nein|no)
                printf -v "$var_name" '%s' "no"
                return
                ;;
        esac

        warn "Bitte mit ja oder nein antworten."
    done
}

generate_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

generate_password() {
    openssl rand -base64 24 | tr -d '\n' | cut -c1-20
}

shell_quote() {
    printf '%q' "$1"
}

ensure_user_exists() {
    if id "$APP_USER" >/dev/null 2>&1; then
        APP_GROUP="$(id -gn "$APP_USER")"
        return
    fi

    step "Lege Systembenutzer $APP_USER an"
    useradd --system --create-home --shell /bin/bash "$APP_USER"
    APP_GROUP="$(id -gn "$APP_USER")"
}

run_as_app_user() {
    local command="$1"

    if command -v runuser >/dev/null 2>&1; then
        runuser -u "$APP_USER" -- bash -lc "$command"
        return
    fi

    su -s /bin/bash "$APP_USER" -c "$command"
}

set_env_value() {
    local key="$1"
    local value="$2"
    local escaped_value

    escaped_value="$(printf '%s' "$value" | sed -e 's/[&|]/\\&/g')"

    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$ENV_FILE"
    else
        printf '\n%s=%s\n' "$key" "$value" >>"$ENV_FILE"
    fi
}

build_stateful_domains() {
    local extra_domains="$1"
    local domains=(
        "$APP_DOMAIN"
        "localhost"
        "localhost:8000"
        "localhost:5173"
        "127.0.0.1"
        "127.0.0.1:8000"
        "127.0.0.1:5173"
    )
    local domain
    local result=()

    if [[ -n "$extra_domains" ]]; then
        IFS=',' read -r -a extra_array <<<"$extra_domains"
        for domain in "${extra_array[@]}"; do
            domain="$(printf '%s' "$domain" | xargs)"
            [[ -n "$domain" ]] && domains+=("$domain")
        done
    fi

    for domain in "${domains[@]}"; do
        if [[ -n "$domain" && ! " ${result[*]} " =~ " ${domain} " ]]; then
            result+=("$domain")
        fi
    done

    SANCTUM_STATEFUL_DOMAINS_VALUE="$(IFS=,; printf '%s' "${result[*]}")"
}

detect_os() {
    if [[ ! -f /etc/os-release ]]; then
        die "/etc/os-release wurde nicht gefunden. Unterstützt werden Debian und Ubuntu."
    fi

    # shellcheck disable=SC1091
    source /etc/os-release
    OS_ID="${ID:-}"

    if [[ "$OS_ID" != "debian" && "$OS_ID" != "ubuntu" ]]; then
        die "Dieses install.sh unterstützt aktuell nur Debian und Ubuntu."
    fi
}

install_base_packages() {
    step "Installiere Systempakete"
    export DEBIAN_FRONTEND=noninteractive

    apt-get update
    apt-get install -y \
        acl \
        ca-certificates \
        certbot \
        curl \
        git \
        gnupg \
        lsb-release \
        nginx \
        python3-certbot-nginx \
        rsync \
        sqlite3 \
        unzip

    if [[ "$OS_ID" = "ubuntu" ]]; then
        apt-get install -y software-properties-common
        if ! apt-cache show php8.2-cli >/dev/null 2>&1; then
            add-apt-repository -y ppa:ondrej/php
            apt-get update
        fi
    fi

    if ! apt-cache show php8.2-cli >/dev/null 2>&1; then
        die "php8.2-cli ist in den Paketquellen nicht verfügbar. Bitte verwende Debian 12+ oder Ubuntu mit PHP-Repository."
    fi

    apt-get install -y \
        php8.2-bcmath \
        php8.2-cli \
        php8.2-curl \
        php8.2-fpm \
        php8.2-gd \
        php8.2-intl \
        php8.2-mbstring \
        php8.2-mysql \
        php8.2-redis \
        php8.2-sqlite3 \
        php8.2-xml \
        php8.2-zip

    PHP_BIN="/usr/bin/php8.2"
    PHP_FPM_SERVICE="php8.2-fpm"
    PHP_FPM_SOCK="/run/php/php8.2-fpm.sock"

    if [[ ! -x "$PHP_BIN" ]]; then
        die "PHP 8.2 wurde nicht korrekt installiert."
    fi

    if ! command -v composer >/dev/null 2>&1; then
        step "Installiere Composer"
        local installer expected actual
        installer="/tmp/composer-setup.php"
        expected="$(curl -fsSL https://composer.github.io/installer.sig)"
        "$PHP_BIN" -r "copy('https://getcomposer.org/installer', '$installer');"
        actual="$("$PHP_BIN" -r "echo hash_file('sha384', '$installer');")"

        if [[ "$expected" != "$actual" ]]; then
            rm -f "$installer"
            die "Composer-Installer-Signatur stimmt nicht."
        fi

        "$PHP_BIN" "$installer" --install-dir=/usr/local/bin --filename=composer
        rm -f "$installer"
    fi

    if ! command -v node >/dev/null 2>&1 || ! node --version | grep -Eq '^v(20|21|22|23|24)\.'; then
        step "Installiere Node.js 20 LTS"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi

    systemctl enable --now nginx
    systemctl enable --now "$PHP_FPM_SERVICE"
}

install_mariadb_if_needed() {
    if [[ "$DB_CONNECTION_VALUE" != "mysql" || "$INSTALL_LOCAL_MARIADB" != "yes" ]]; then
        return
    fi

    step "Installiere MariaDB"
    apt-get install -y mariadb-server
    systemctl enable --now mariadb
}

backup_existing_installation() {
    if [[ ! -e "$APP_DIR" ]]; then
        return
    fi

    if [[ -d "$APP_DIR" && -z "$(find "$APP_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
        rm -rf "$APP_DIR"
        return
    fi

    BACKUP_PATH="${APP_DIR}.backup-$(date '+%Y%m%d-%H%M%S')"
    step "Sichere bestehende Installation nach $BACKUP_PATH"
    mv "$APP_DIR" "$BACKUP_PATH"
}

clone_or_prepare_repository() {
    step "Bereite Anwendungspfad vor"
    install -d -m 0775 -o "$APP_USER" -g "$APP_GROUP" "$(dirname "$APP_DIR")"

    if [[ -f "$SCRIPT_PATH/artisan" && "$SCRIPT_PATH" = "$APP_DIR" ]]; then
        success "Nutze vorhandenen Quellcode in $APP_DIR"
        chown -R "$APP_USER:$APP_GROUP" "$APP_DIR"
        return
    fi

    step "Klone Repository"
    run_as_app_user "git clone --branch $(shell_quote "$REPO_BRANCH") $(shell_quote "$REPO_URL") $(shell_quote "$APP_DIR")"
}

prepare_environment_file() {
    step "Schreibe .env"
    ENV_FILE="$APP_DIR/.env"

    cp "$APP_DIR/.env.example" "$ENV_FILE"

    set_env_value "APP_NAME" "\"$APP_NAME_VALUE\""
    set_env_value "APP_ENV" "$APP_ENV_VALUE"
    set_env_value "APP_DEBUG" "false"
    set_env_value "APP_URL" "$APP_URL"
    set_env_value "APP_LOCALE" "de"
    set_env_value "APP_FALLBACK_LOCALE" "de"
    set_env_value "DB_CONNECTION" "$DB_CONNECTION_VALUE"
    set_env_value "QUEUE_CONNECTION" "database"
    set_env_value "SESSION_DRIVER" "database"
    set_env_value "CACHE_STORE" "database"
    set_env_value "SESSION_SECURE_COOKIE" "$([[ "$ENABLE_HTTPS" = "yes" ]] && printf 'true' || printf 'false')"
    set_env_value "SESSION_SAME_SITE" "lax"
    set_env_value "SESSION_DOMAIN" "$SESSION_DOMAIN_VALUE"
    set_env_value "SANCTUM_STATEFUL_DOMAINS" "$SANCTUM_STATEFUL_DOMAINS_VALUE"
    set_env_value "TELESCOPE_ENABLED" "false"
    set_env_value "MAIL_MAILER" "$MAIL_MODE_VALUE"
    set_env_value "MAIL_FROM_ADDRESS" "\"$MAIL_FROM_ADDRESS_VALUE\""
    set_env_value "MAIL_FROM_NAME" "\"$MAIL_FROM_NAME_VALUE\""
    set_env_value "VITE_APP_NAME" "\"$APP_NAME_VALUE\""
    set_env_value "VAULT_MASTER_KEYS" "1:base64:$(generate_secret)"
    set_env_value "VAULT_CURRENT_KEY_VERSION" "1"
    set_env_value "VAULT_MASTER_KEY_FILE" ""

    if [[ "$DB_CONNECTION_VALUE" = "mysql" ]]; then
        set_env_value "DB_HOST" "$DB_HOST_VALUE"
        set_env_value "DB_PORT" "$DB_PORT_VALUE"
        set_env_value "DB_DATABASE" "$DB_DATABASE_VALUE"
        set_env_value "DB_USERNAME" "$DB_USERNAME_VALUE"
        set_env_value "DB_PASSWORD" "$DB_PASSWORD_VALUE"
    else
        local sqlite_path="$APP_DIR/database/database.sqlite"
        install -m 0664 -o "$APP_USER" -g "$APP_GROUP" /dev/null "$sqlite_path"
        set_env_value "DB_DATABASE" "$sqlite_path"
    fi

    if [[ "$MAIL_MODE_VALUE" = "smtp" ]]; then
        set_env_value "MAIL_HOST" "$MAIL_HOST_VALUE"
        set_env_value "MAIL_PORT" "$MAIL_PORT_VALUE"
        set_env_value "MAIL_USERNAME" "$MAIL_USERNAME_VALUE"
        set_env_value "MAIL_PASSWORD" "$MAIL_PASSWORD_VALUE"
        set_env_value "MAIL_SCHEME" "tls"
    fi

    chown "$APP_USER:$APP_GROUP" "$ENV_FILE"
    chmod 0640 "$ENV_FILE"
}

create_database_if_needed() {
    if [[ "$DB_CONNECTION_VALUE" != "mysql" || "$INSTALL_LOCAL_MARIADB" != "yes" ]]; then
        return
    fi

    step "Lege Datenbank und Datenbankbenutzer an"
    mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE_VALUE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USERNAME_VALUE}'@'localhost' IDENTIFIED BY '${DB_PASSWORD_VALUE}';
ALTER USER '${DB_USERNAME_VALUE}'@'localhost' IDENTIFIED BY '${DB_PASSWORD_VALUE}';
GRANT ALL PRIVILEGES ON \`${DB_DATABASE_VALUE}\`.* TO '${DB_USERNAME_VALUE}'@'localhost';
FLUSH PRIVILEGES;
SQL
}

install_application_dependencies() {
    step "Installiere Composer-Abhängigkeiten"
    run_as_app_user "cd '$APP_DIR' && composer install --no-dev --optimize-autoloader"

    step "Installiere Node-Abhängigkeiten"
    run_as_app_user "cd '$APP_DIR' && npm ci"

    step "Generiere APP_KEY"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan key:generate --force"

    step "Baue Frontend"
    run_as_app_user "cd '$APP_DIR' && npm run build"
}

run_application_setup() {
    step "Führe Migrationen aus"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan migrate --force"

    step "Erstelle Storage-Link"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan storage:link || true"

    step "Leere Caches"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan optimize:clear"

    step "Baue Produktions-Caches"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan config:cache"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan route:cache"
    run_as_app_user "cd '$APP_DIR' && $PHP_BIN artisan view:cache"
}

create_admin_user_if_needed() {
    if [[ "$CREATE_ADMIN_USER" != "yes" ]]; then
        return
    fi

    if [[ -z "$ADMIN_PASSWORD_VALUE" ]]; then
        GENERATED_ADMIN_PASSWORD="$(generate_password)"
        ADMIN_PASSWORD_VALUE="$GENERATED_ADMIN_PASSWORD"
    fi

    step "Lege ersten Admin-Benutzer an"
    run_as_app_user "cd $(shell_quote "$APP_DIR") && $PHP_BIN artisan user:create --name=$(shell_quote "$ADMIN_NAME_VALUE") --email=$(shell_quote "$ADMIN_EMAIL_VALUE") --password=$(shell_quote "$ADMIN_PASSWORD_VALUE") --admin --no-interaction"
}

write_nginx_config() {
    step "Schreibe Nginx-Konfiguration"
    local nginx_config="/etc/nginx/sites-available/${NGINX_SITE_NAME}.conf"

    cat >"$nginx_config" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_SERVER_NAMES};
    root ${APP_DIR}/public;
    index index.php;
    client_max_body_size 64m;

    access_log /var/log/nginx/${NGINX_SITE_NAME}.access.log;
    error_log /var/log/nginx/${NGINX_SITE_NAME}.error.log;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_FPM_SOCK};
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

    ln -sf "$nginx_config" "/etc/nginx/sites-enabled/${NGINX_SITE_NAME}.conf"
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
}

enable_https_if_requested() {
    if [[ "$ENABLE_HTTPS" != "yes" ]]; then
        return
    fi

    if [[ -z "$SSL_EMAIL" ]]; then
        warn "SSL wurde angefordert, aber keine E-Mail-Adresse angegeben. Überspringe Let's Encrypt."
        return
    fi

    step "Hole Let's Encrypt Zertifikat"
    local certbot_domains=()
    local domain=""

    for domain in $APP_SERVER_NAMES; do
        [[ -n "$domain" ]] && certbot_domains+=("-d" "$domain")
    done

    if [[ "${#certbot_domains[@]}" -eq 0 ]]; then
        certbot_domains+=("-d" "$APP_DOMAIN")
    fi

    certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" "${certbot_domains[@]}"
    systemctl reload nginx
}

write_scheduler_cron() {
    step "Aktiviere Laravel Scheduler"
    cat >"/etc/cron.d/${NGINX_SITE_NAME}-schedule" <<EOF
* * * * * ${APP_USER} cd ${APP_DIR} && ${PHP_BIN} artisan schedule:run >> /var/log/${NGINX_SITE_NAME}-schedule.log 2>&1
EOF
    chmod 0644 "/etc/cron.d/${NGINX_SITE_NAME}-schedule"
}

write_queue_service() {
    step "Aktiviere Queue-Worker als systemd Service"
    cat >"/etc/systemd/system/${NGINX_SITE_NAME}-queue.service" <<EOF
[Unit]
Description=Nebu Secure Queue Worker
After=network.target ${PHP_FPM_SERVICE}.service

[Service]
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${APP_DIR}
ExecStart=${PHP_BIN} artisan queue:work --sleep=1 --tries=1 --max-time=3600
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=60

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable --now "${NGINX_SITE_NAME}-queue.service"
}

set_permissions() {
    step "Setze Dateirechte"
    chown -R "${APP_USER}:${APP_GROUP}" "$APP_DIR"
    chmod +x "$APP_DIR/deploy.sh" "$APP_DIR/update.sh" "$APP_DIR/install.sh"

    if command -v setfacl >/dev/null 2>&1; then
        setfacl -R -m "u:${APP_USER}:rwx" "$APP_DIR"
        setfacl -dR -m "u:${APP_USER}:rwx" "$APP_DIR"

        if id "$RUNTIME_USER" >/dev/null 2>&1; then
            setfacl -R -m "u:${RUNTIME_USER}:rwx" "$APP_DIR"
            setfacl -dR -m "u:${RUNTIME_USER}:rwx" "$APP_DIR"
        fi
    fi
}

collect_configuration() {
    prompt "REPO_URL" "Repository-URL" "$DEFAULT_REPO_URL"
    prompt "REPO_BRANCH" "Git-Branch" "$DEFAULT_BRANCH"
    prompt "APP_DIR" "Installationspfad" "$DEFAULT_APP_DIR"
    prompt "APP_USER" "Systembenutzer für App, Nginx und Worker" "$DEFAULT_APP_USER"
    ensure_user_exists

    prompt "APP_NAME_VALUE" "Anwendungsname" "$DEFAULT_APP_NAME"
    prompt "APP_DOMAIN" "Primäre Domain" ""
    prompt "APP_SERVER_NAMES" "Server-Namen für Nginx (leer = nur Primärdomain)" "$APP_DOMAIN"
    prompt_yes_no "ENABLE_HTTPS" "Let's Encrypt und HTTPS einrichten?" "yes"
    if [[ "$ENABLE_HTTPS" = "yes" ]]; then
        prompt "SSL_EMAIL" "E-Mail für Let's Encrypt" ""
    fi

    prompt "APP_ENV_VALUE" "Laravel APP_ENV" "$DEFAULT_APP_ENV"
    prompt "SESSION_DOMAIN_VALUE" "Cookie-Domain" "$APP_DOMAIN"
    prompt "SANCTUM_EXTRA_DOMAINS" "Zusätzliche Sanctum-Domains (optional, komma-getrennt)" "" "no"
    build_stateful_domains "$SANCTUM_EXTRA_DOMAINS"

    prompt "DB_CONNECTION_VALUE" "Datenbank-Treiber (mysql oder sqlite)" "$DEFAULT_DB_CONNECTION"
    DB_CONNECTION_VALUE="$(printf '%s' "$DB_CONNECTION_VALUE" | tr '[:upper:]' '[:lower:]')"
    if [[ "$DB_CONNECTION_VALUE" = "mysql" ]]; then
        prompt_yes_no "INSTALL_LOCAL_MARIADB" "Lokalen MariaDB-Server installieren?" "yes"
        prompt "DB_HOST_VALUE" "DB Host" "127.0.0.1"
        prompt "DB_PORT_VALUE" "DB Port" "3306"
        prompt "DB_DATABASE_VALUE" "DB Name" "nebu_secure"
        prompt "DB_USERNAME_VALUE" "DB Benutzer" "nebu_secure"
        prompt_secret "DB_PASSWORD_VALUE" "DB Passwort (leer = automatisch generieren)" "no"
        if [[ -z "$DB_PASSWORD_VALUE" ]]; then
            DB_PASSWORD_VALUE="$(generate_password)"
        fi
    else
        DB_CONNECTION_VALUE="sqlite"
        INSTALL_LOCAL_MARIADB="no"
    fi

    prompt "MAIL_MODE_VALUE" "Mail-Modus (log oder smtp)" "$DEFAULT_MAIL_MODE"
    MAIL_MODE_VALUE="$(printf '%s' "$MAIL_MODE_VALUE" | tr '[:upper:]' '[:lower:]')"
    prompt "MAIL_FROM_ADDRESS_VALUE" "Absender-E-Mail" "noreply@${APP_DOMAIN}"
    prompt "MAIL_FROM_NAME_VALUE" "Absender-Name" "$APP_NAME_VALUE"
    if [[ "$MAIL_MODE_VALUE" = "smtp" ]]; then
        prompt "MAIL_HOST_VALUE" "SMTP Host" ""
        prompt "MAIL_PORT_VALUE" "SMTP Port" "587"
        prompt "MAIL_USERNAME_VALUE" "SMTP Benutzer" ""
        prompt_secret "MAIL_PASSWORD_VALUE" "SMTP Passwort" "no"
    else
        MAIL_MODE_VALUE="log"
    fi

    prompt_yes_no "CREATE_ADMIN_USER" "Direkt einen ersten Admin-Benutzer anlegen?" "yes"
    if [[ "$CREATE_ADMIN_USER" = "yes" ]]; then
        prompt "ADMIN_NAME_VALUE" "Admin-Name" "Administrator"
        prompt "ADMIN_EMAIL_VALUE" "Admin-E-Mail" "admin@${APP_DOMAIN}"
        prompt_secret "ADMIN_PASSWORD_VALUE" "Admin-Passwort (leer = automatisch generieren)" "no"
    fi

    if [[ "$ENABLE_HTTPS" = "yes" ]]; then
        APP_URL="https://${APP_DOMAIN}"
    else
        APP_URL="http://${APP_DOMAIN}"
    fi

    if [[ "$DB_CONNECTION_VALUE" != "mysql" && "$DB_CONNECTION_VALUE" != "sqlite" ]]; then
        die "Der Datenbank-Treiber muss mysql oder sqlite sein."
    fi

    if [[ "$MAIL_MODE_VALUE" != "log" && "$MAIL_MODE_VALUE" != "smtp" ]]; then
        die "Der Mail-Modus muss log oder smtp sein."
    fi

    RUNTIME_USER="$DEFAULT_RUNTIME_USER"
}

show_summary() {
    printf '\n%sInstallationsübersicht%s\n' "$BOLD" "$RESET"
    printf '  %-24s %s\n' "Repository" "$REPO_URL"
    printf '  %-24s %s\n' "Branch" "$REPO_BRANCH"
    printf '  %-24s %s\n' "Pfad" "$APP_DIR"
    printf '  %-24s %s\n' "Domain" "$APP_DOMAIN"
    printf '  %-24s %s\n' "APP_URL" "$APP_URL"
    printf '  %-24s %s\n' "Systembenutzer" "$APP_USER"
    printf '  %-24s %s\n' "Datenbank" "$DB_CONNECTION_VALUE"
    if [[ "$DB_CONNECTION_VALUE" = "mysql" ]]; then
        printf '  %-24s %s\n' "DB Host" "$DB_HOST_VALUE"
        printf '  %-24s %s\n' "DB Name" "$DB_DATABASE_VALUE"
        printf '  %-24s %s\n' "DB Benutzer" "$DB_USERNAME_VALUE"
    fi
    printf '  %-24s %s\n' "HTTPS" "$ENABLE_HTTPS"
    printf '\n'
}

final_summary() {
    printf '\n%sInstallation abgeschlossen%s\n' "$BOLD$GREEN" "$RESET"
    printf '  %-24s %s\n' "URL" "$APP_URL"
    printf '  %-24s %s\n' "Pfad" "$APP_DIR"
    printf '  %-24s %s\n' "Queue-Service" "${NGINX_SITE_NAME}-queue.service"
    printf '  %-24s %s\n' "Scheduler-Cron" "/etc/cron.d/${NGINX_SITE_NAME}-schedule"
    printf '  %-24s %s\n' "Auto-Update" "Im Dashboard aktivierbar"

    if [[ -n "$GENERATED_ADMIN_PASSWORD" ]]; then
        printf '  %-24s %s\n' "Admin-Passwort" "$GENERATED_ADMIN_PASSWORD"
    fi

    if [[ "$DB_CONNECTION_VALUE" = "mysql" ]]; then
        printf '  %-24s %s\n' "DB Passwort" "$DB_PASSWORD_VALUE"
    fi

    if [[ -n "$BACKUP_PATH" ]]; then
        printf '  %-24s %s\n' "Backup" "$BACKUP_PATH"
    fi

    printf '\n'
}

main() {
    require_root
    detect_os
    show_banner
    collect_configuration
    show_summary
    prompt_yes_no "CONTINUE_INSTALL" "Installation mit diesen Werten starten?" "yes"
    [[ "$CONTINUE_INSTALL" = "yes" ]] || die "Installation abgebrochen."

    install_base_packages
    install_mariadb_if_needed
    backup_existing_installation
    clone_or_prepare_repository
    set_permissions
    prepare_environment_file
    create_database_if_needed
    install_application_dependencies
    run_application_setup
    create_admin_user_if_needed
    write_nginx_config
    enable_https_if_requested
    write_scheduler_cron
    write_queue_service
    set_permissions
    final_summary
}

main "$@"
