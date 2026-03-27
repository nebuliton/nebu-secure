#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(
    CDPATH= cd -- "$(dirname -- "$0")" && pwd
)

APP_DIR="$SCRIPT_DIR"
MODE="local"
WEB_SERVICE="${DEPLOY_WEB_SERVICE:-web}"
DO_BUILD=1
DO_MIGRATE=1
DO_RELOAD=1
NO_COLOR=0
PLAIN_OUTPUT=0

if [ -t 1 ]; then
    BOLD="$(printf '\033[1m')"
    DIM="$(printf '\033[2m')"
    RED="$(printf '\033[31m')"
    GREEN="$(printf '\033[32m')"
    YELLOW="$(printf '\033[33m')"
    BLUE="$(printf '\033[34m')"
    CYAN="$(printf '\033[36m')"
    RESET="$(printf '\033[0m')"
else
    BOLD=""
    DIM=""
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    CYAN=""
    RESET=""
fi

timestamp() {
    date '+%H:%M:%S'
}

log_line() {
    level="$1"
    color="$2"
    shift 2
    printf '%s[%s] [%s]%s %s\n' "$color" "$(timestamp)" "$level" "$RESET" "$*"
}

info() {
    log_line "INFO" "$BLUE" "$@"
}

step() {
    log_line "STEP" "$CYAN" "$@"
}

warn() {
    log_line "WARN" "$YELLOW" "$@"
}

success() {
    log_line "OK" "$GREEN" "$@"
}

die() {
    log_line "ERR" "$RED" "$@"
    exit 1
}

disable_colors() {
    BOLD=""
    DIM=""
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    CYAN=""
    RESET=""
}

usage() {
    cat <<EOF
${BOLD}Verwendung${RESET}
  ./deploy.sh [local|docker] [optionen]

${BOLD}Beschreibung${RESET}
  Führt den üblichen Deploy-Ablauf für dieses Projekt aus:
  Build, Migrationen sowie Laravel-Cache- und Reload-Schritte.

${BOLD}Optionen${RESET}
  --skip-build           Überspringt den Build-Schritt
  --skip-migrate         Überspringt Migrationen
  --skip-reload          Überspringt Cache- und Reload-Schritte
  --service NAME         Docker-Web-Service für Artisan-Kommandos (Default: web)
  --no-color             Deaktiviert farbige Ausgabe
  --plain                Schlichte Ausgabe ohne Banner, optimiert für Logs/Dashboard
  -h, --help             Zeigt diese Hilfe

${BOLD}Umgebungsvariablen${RESET}
  DEPLOY_WEB_SERVICE     Überschreibt den Docker-Web-Service

${BOLD}Beispiele${RESET}
  ./deploy.sh
  ./deploy.sh --skip-build
  ./deploy.sh docker
  ./deploy.sh docker --service web --skip-build
EOF
}

have_command() {
    command -v "$1" >/dev/null 2>&1
}

require_command() {
    command_name="$1"

    if ! have_command "$command_name"; then
        die "Benötigtes Kommando nicht gefunden: $command_name"
    fi
}

require_file() {
    file_path="$1"

    if [ ! -f "$file_path" ]; then
        die "Benötigte Datei fehlt: $file_path"
    fi
}

render_flag() {
    if [ "$1" -eq 1 ]; then
        printf '%s' 'ja'
    else
        printf '%s' 'nein'
    fi
}

show_banner() {
    printf '\n'
    printf '%s' "$BOLD$CYAN"
    cat <<'EOF'
███╗   ██╗███████╗██████╗ ██╗   ██╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
████╗  ██║██╔════╝██╔══██╗██║   ██║██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██╔██╗ ██║█████╗  ██████╔╝██║   ██║██║   ██║███████║██║   ██║██║     ██║
██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║
██║ ╚████║███████╗██████╔╝╚██████╔╝ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║
╚═╝  ╚═══╝╚══════╝╚═════╝  ╚═════╝   ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝

EOF
    printf '%s\n' "$RESET"
}

show_summary() {
    info "Projekt: $APP_DIR"
    info "Modus: $MODE"

    if [ "$MODE" = "docker" ]; then
        info "Service: $WEB_SERVICE"
    fi

    info "Build: $(render_flag "$DO_BUILD") | Migrationen: $(render_flag "$DO_MIGRATE") | Reload: $(render_flag "$DO_RELOAD")"
}

run_cmd() {
    description="$1"
    shift
    step "$description"
    printf '%s$ %s%s\n' "$DIM" "$*" "$RESET"
    "$@"
}

run_frontend_build() {
    run_cmd "Baue Frontend" npx vite build --configLoader runner
}

run_shell_cmd() {
    description="$1"
    command_string="$2"
    step "$description"
    printf '%s$ %s%s\n' "$DIM" "$command_string" "$RESET"
    sh -c "$command_string"
}

detect_compose() {
    if have_command docker && docker compose version >/dev/null 2>&1; then
        printf '%s' 'docker compose'
        return 0
    fi

    if have_command docker-compose; then
        printf '%s' 'docker-compose'
        return 0
    fi

    return 1
}

parse_args() {
    while [ "$#" -gt 0 ]; do
        case "$1" in
            local|docker)
                MODE="$1"
                ;;
            --skip-build)
                DO_BUILD=0
                ;;
            --skip-migrate)
                DO_MIGRATE=0
                ;;
            --skip-reload)
                DO_RELOAD=0
                ;;
            --service)
                shift
                [ "$#" -gt 0 ] || die "Für --service fehlt der Name."
                WEB_SERVICE="$1"
                ;;
            --service=*)
                WEB_SERVICE="${1#*=}"
                ;;
            --no-color)
                NO_COLOR=1
                ;;
            --plain)
                PLAIN_OUTPUT=1
                NO_COLOR=1
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                die "Unbekannte Option: $1"
                ;;
        esac

        shift
    done
}

preflight_common() {
    require_file "$APP_DIR/artisan"
    require_file "$APP_DIR/package.json"
}

preflight_local() {
    preflight_common
    require_command php

    if [ "$DO_BUILD" -eq 1 ]; then
        require_command npm
    fi
}

preflight_docker() {
    preflight_common
    require_file "$APP_DIR/docker-compose.yml"
    COMPOSE_CMD="$(detect_compose)" || die "Docker Compose wurde nicht gefunden."
}

run_local() {
    preflight_local

    if [ "$DO_BUILD" -eq 1 ]; then
        run_frontend_build
    else
        warn "Build übersprungen"
    fi

    if [ "$DO_MIGRATE" -eq 1 ]; then
        run_cmd "Führe Migrationen aus" php artisan migrate --force
    else
        warn "Migrationen übersprungen"
    fi

    if [ "$DO_RELOAD" -eq 1 ]; then
        run_cmd "Leere Laravel-Caches" php artisan optimize:clear
        run_cmd "Baue Config-Cache" php artisan config:cache
        run_cmd "Baue Route-Cache" php artisan route:cache
        run_cmd "Baue View-Cache" php artisan view:cache
        run_cmd "Starte Queue-Worker sauber neu" php artisan queue:restart
    else
        warn "Reload/Caches übersprungen"
    fi
}

run_docker() {
    preflight_docker

    info "Compose-Kommando: $COMPOSE_CMD"

    if [ "$DO_BUILD" -eq 1 ]; then
        run_shell_cmd "Baue Container neu" "$COMPOSE_CMD build"
    else
        warn "Container-Build übersprungen"
    fi

    run_shell_cmd "Starte Container" "$COMPOSE_CMD up -d --remove-orphans"

    if [ "$DO_MIGRATE" -eq 1 ]; then
        run_shell_cmd "Führe Migrationen im Container aus" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan migrate --force"
    else
        warn "Migrationen im Container übersprungen"
    fi

    if [ "$DO_RELOAD" -eq 1 ]; then
        run_shell_cmd "Leere Laravel-Caches im Container" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan optimize:clear"
        run_shell_cmd "Baue Config-Cache im Container" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan config:cache"
        run_shell_cmd "Baue Route-Cache im Container" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan route:cache"
        run_shell_cmd "Baue View-Cache im Container" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan view:cache"
        run_shell_cmd "Starte Queue-Worker im Container sauber neu" "$COMPOSE_CMD exec -T $WEB_SERVICE php artisan queue:restart"
    else
        warn "Reload/Caches im Container übersprungen"
    fi
}

parse_args "$@"

if [ "$NO_COLOR" -eq 1 ]; then
    disable_colors
fi

cd "$APP_DIR"
START_TS="$(date '+%s' 2>/dev/null || printf '0')"

if [ "$PLAIN_OUTPUT" -eq 0 ]; then
    show_banner
fi
info "Starte Deploy-Workflow"
show_summary

case "$MODE" in
    local)
        run_local
        ;;
    docker)
        run_docker
        ;;
    *)
        die "Ungültiger Modus: $MODE"
        ;;
esac

END_TS="$(date '+%s' 2>/dev/null || printf '0')"

if [ "$START_TS" -gt 0 ] && [ "$END_TS" -ge "$START_TS" ]; then
    ELAPSED="$((END_TS - START_TS))"
    success "Fertig in ${ELAPSED}s"
else
    success "Fertig"
fi
