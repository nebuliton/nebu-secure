#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(
    CDPATH= cd -- "$(dirname -- "$0")" && pwd
)

cd "$SCRIPT_DIR"

usage() {
    cat <<EOF
Verwendung
  ./update.sh [optionen]

Optionen
  --check       Prüft nur, ob ein Update verfügbar ist
  --auto        Führt das Update nur bei aktivem Auto-Update aus
  --json        Gibt das Ergebnis zusätzlich als JSON aus
  -h, --help    Zeigt diese Hilfe

Beispiele
  ./update.sh
  ./update.sh --check
  ./update.sh --auto
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    usage
    exit 0
fi

php artisan app:update "$@"
