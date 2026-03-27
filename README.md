<p align="center">
  <img src="public/logo.png" alt="Nebu Secure Logo" width="120" />
</p>

<h1 align="center">Nebu Secure</h1>

<p align="center">
  <strong>🔐 Enterprise-Grade Passwort- & Datenverwaltung</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<p align="center">
  Nebu Secure ist eine moderne, selbst-gehostete Passwort- und Geheimnisverwaltungsplattform.<br/>
  Entwickelt für Teams und Unternehmen — mit <strong>Envelope Encryption</strong>, <strong>Zwei-Faktor-Authentifizierung</strong>,<br/>
  <strong>Audit-Logging</strong> und einem granularen Berechtigungssystem.
</p>

---

## ✨ Features

<table>
  <tr>
    <td>🔑</td>
    <td><strong>Envelope Encryption</strong></td>
    <td>Jeder Tresor-Eintrag wird mit einem individuellen Data-Key verschlüsselt, der durch einen rotierbaren Master-Key geschützt ist (AES-256-GCM).</td>
  </tr>
  <tr>
    <td>🛡️</td>
    <td><strong>Zwei-Faktor-Auth</strong></td>
    <td>TOTP-basierte 2FA via Laravel Fortify mit Backup-Codes und Bestätigungsdialog.</td>
  </tr>
  <tr>
    <td>👥</td>
    <td><strong>Benutzer & Gruppen</strong></td>
    <td>Einträge können einzelnen Benutzern oder Gruppen zugewiesen werden. Multi-Gruppen-Zuweisung möglich.</td>
  </tr>
  <tr>
    <td>⭐</td>
    <td><strong>Favoriten & Typen</strong></td>
    <td>Tresor-Einträge als Favoriten markieren. Typen: Login, API-Key, SSH-Key, Notiz, Kreditkarte, Sonstiges.</td>
  </tr>
  <tr>
    <td>🔗</td>
    <td><strong>Einmal-Links</strong></td>
    <td>Sichere Share-Links die nach einmaligem Aufruf automatisch verfallen.</td>
  </tr>
  <tr>
    <td>📋</td>
    <td><strong>Audit-Logging</strong></td>
    <td>Alle sicherheitsrelevanten Aktionen werden protokolliert — Login, Entschlüsselung, Änderungen, Admin-Aktionen.</td>
  </tr>
  <tr>
    <td>🎨</td>
    <td><strong>Dark/Light Mode</strong></td>
    <td>Vollständige Theme-Unterstützung mit System-Erkennung.</td>
  </tr>
  <tr>
    <td>🖼️</td>
    <td><strong>Logo-Upload</strong></td>
    <td>Eigenes Firmenlogo per Datei-Upload oder URL in den Admin-Einstellungen hinterlegen.</td>
  </tr>
  <tr>
    <td>🌐</td>
    <td><strong>Vollständig auf Deutsch</strong></td>
    <td>Alle Oberflächen, Formulare, Fehlermeldungen und E-Mails in Deutsch.</td>
  </tr>
  <tr>
    <td>🐳</td>
    <td><strong>Docker-Ready</strong></td>
    <td>Multi-Stage Dockerfile mit Nginx, PHP-FPM und Supervisor — Production-ready.</td>
  </tr>
</table>

---

## 🏗️ Tech-Stack

| Komponente      | Technologie                                    |
|:----------------|:-----------------------------------------------|
| **Backend**     | Laravel 12, PHP 8.2+                           |
| **Frontend**    | React 19, TypeScript 5, Inertia.js 2           |
| **Styling**     | Tailwind CSS 4, Radix UI, shadcn/ui            |
| **State**       | TanStack React Query 5                         |
| **Auth**        | Laravel Fortify (Login, 2FA, Password Reset)   |
| **API**         | Laravel Sanctum (SPA Cookie Auth)              |
| **Encryption**  | AES-256-GCM Envelope Encryption                |
| **Database**    | SQLite (Dev) / MySQL / PostgreSQL (Prod)       |
| **DevOps**      | Docker, Docker Compose, Dokploy-kompatibel     |

---

## 🚀 Schnellstart

### Voraussetzungen

- **PHP** ≥ 8.2 mit `pdo_sqlite`, `mbstring`, `bcmath`
- **Composer** 2.x
- **Node.js** ≥ 20 mit npm
- **SQLite** (Standard) oder MySQL/PostgreSQL

### Installation

```bash
# Repository klonen
git clone https://github.com/nebuliton/nebu-secure.git
cd nebu-secure

# PHP-Dependencies installieren
composer install

# Frontend-Dependencies installieren & bauen
npm install
npm run build

# Umgebungskonfiguration
cp .env.example .env
php artisan key:generate

# Datenbank migrieren & Seed-Daten laden
php artisan migrate --seed

# Storage-Link erstellen
php artisan storage:link
```

### Vault Master-Key konfigurieren

In `.env` einen Verschlüsselungsschlüssel setzen (Base64-encoded, 32 Bytes):

```env
VAULT_MASTER_KEYS=1:deinBase64EncodedKey==
VAULT_CURRENT_KEY_VERSION=1
```

> **Tipp:** Key generieren mit `openssl rand -base64 32`

### Entwicklungsserver starten

```bash
# Alles auf einmal (Server + Queue + Vite)
composer dev

# Oder einzeln
php artisan serve        # Backend auf :8000
npm run dev              # Vite-Dev-Server
php artisan queue:work   # Queue-Worker
```

---

## 🐳 Docker

### Docker Compose (empfohlen)

```bash
docker-compose up -d
```

Die Anwendung läuft auf Port `18080` (konfigurierbar via `APP_HTTP_PORT` in `.env`).

### Deployment mit Dokploy

Siehe [`DOKPLOY.md`](DOKPLOY.md) für eine detaillierte Anleitung.

---

## 📂 Projektstruktur

```
nebu-secure/
├── app/
│   ├── Actions/Fortify/        # Auth-Aktionen (Register, Password Reset)
│   ├── Http/Controllers/
│   │   ├── Api/                # REST API Controller
│   │   ├── Api/Admin/          # Admin API Controller
│   │   └── Settings/           # User-Settings Controller
│   ├── Models/                 # Eloquent Models
│   ├── Policies/               # Authorization Policies
│   └── Services/               # Business Logic (Crypto, Audit, Settings)
├── config/
│   └── vault.php               # Encryption Key-Konfiguration
├── database/migrations/        # Datenbank-Migrationen
├── resources/js/
│   ├── pages/                  # React-Seiten (Inertia)
│   │   ├── admin/              # Admin-Dashboard
│   │   ├── auth/               # Login, Register, 2FA, Password Reset
│   │   ├── settings/           # Profil, Passwort, 2FA, Appearance
│   │   └── vault/              # Benutzer-Tresor
│   ├── components/             # Wiederverwendbare UI-Komponenten
│   ├── layouts/                # App- und Settings-Layouts
│   └── types/                  # TypeScript Type-Definitionen
├── routes/
│   ├── web.php                 # Web-Routes
│   ├── api.php                 # API-Routes
│   └── settings.php            # Settings-Routes
├── docker/                     # Docker-Konfiguration
├── Dockerfile                  # Multi-Stage Production Build
└── docker-compose.yml          # Compose für Production
```

---

## 🔐 Sicherheitsarchitektur

### Envelope Encryption

```
┌──────────────────────────────────────────────────┐
│  Master Key (env/file, rotierbar)                │
│  ┌────────────────────────────────────────────┐  │
│  │  Wrapped Data Key (pro Tresor-Eintrag)     │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  Encrypted Password / Value / Notes  │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

- **AES-256-GCM** für alle Verschlüsselungsoperationen
- Individueller **Data Key** pro Eintrag, geschützt durch den **Master Key**
- Master Key kann **versioniert und rotiert** werden ohne Daten zu re-encrypten
- Geheimdaten werden **niemals** im Klartext gespeichert oder in API-Responses zurückgegeben
- Entschlüsselung nur über explizite **Reveal**-Aktion mit Audit-Trail

### Weitere Sicherheitsmaßnahmen

- ✅ Rate Limiting auf Login (5/min) und 2FA (8/min)
- ✅ Passwortrichtlinien (min. 12 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)
- ✅ CSRF-Schutz auf allen Formularen
- ✅ Account-Deaktivierung durch Admins
- ✅ Einmal-Share-Links mit automatischem Verfall
- ✅ Vollständiges Audit-Logging aller sensitiven Operationen

---

## 🛠️ Nützliche Befehle

```bash
# Migrationen ausführen
php artisan migrate

# Migrationen zurücksetzen & neu ausführen
php artisan migrate:fresh --seed

# Cache leeren
php artisan optimize:clear

# TypeScript-Fehler prüfen
npm run types

# Code-Formatting
npm run format
composer lint

# Tests ausführen
php artisan test

# Build + Migrate + Reload lokal
./deploy.sh

# Lokal ohne neuen Frontend-Build
./deploy.sh --skip-build

# Build + Migrate + Reload mit Docker Compose
./deploy.sh docker

# Docker-Service explizit setzen
./deploy.sh docker --service web

# Interaktive Erstinstallation auf Debian/Ubuntu
sudo bash ./install.sh

# Passwort eines Users via Tinker zurücksetzen
php artisan tinker
> User::where('email','user@example.com')->first()->forceFill(['password'=>Hash::make('NeuesPasswort123!')])->save();
```

### Interaktive Installation

Mit `install.sh` kannst du eine komplette Bare-Metal-Installation auf Debian oder Ubuntu durchführen. Das Skript:

- installiert Nginx, PHP 8.2, Composer, Node.js, Certbot und optionale MariaDB
- fragt Domain, App-Pfad, Datenbank, Mailer, Admin-User und HTTPS interaktiv ab
- erzeugt `.env`, `APP_KEY` und `VAULT_MASTER_KEYS` automatisch
- führt `composer install`, `npm ci`, `npm run build`, Migrationen und Laravel-Caches aus
- richtet Nginx, Scheduler, Queue-Worker und die Rechte für Dashboard-Updates ein

Start:

```bash
sudo bash ./install.sh
```

Hinweise:

- gedacht für klassische Server-Installationen direkt auf Debian/Ubuntu
- nicht der bevorzugte Pfad für Docker-Deployments
- für Dashboard-Updates vergibt das Skript automatisch Schreibrechte für den Runtime-Benutzer `www-data`

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

---

## 🤝 Mitwirken

Pull Requests und Issues sind jederzeit willkommen!

1. Fork erstellen
2. Feature-Branch anlegen (`git checkout -b feature/mein-feature`)
3. Änderungen committen (`git commit -m 'feat: Mein neues Feature'`)
4. Branch pushen (`git push origin feature/mein-feature`)
5. Pull Request öffnen

---

<p align="center">
  Erstellt mit ❤️ von <a href="https://nebuliton.io">Nebuliton.io</a>
</p>
