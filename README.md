# Nebu Secure

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Nebu Secure** ist eine moderne, sichere Passwort- und Datenverwaltungsplattform auf Basis von Laravel.

## ✨ Features
- Sichere Speicherung und Verwaltung von Passwörtern & sensiblen Daten
- Benutzer- und Gruppenverwaltung
- Audit-Logging für alle sicherheitsrelevanten Aktionen
- Granulares Berechtigungssystem (Policies)
- Rate Limiting für sensitive Aktionen
- Moderne UI (Inertia.js, Vue.js)
- RESTful API
- Docker- und Cloud-Ready

## 🚀 Schnellstart

### Voraussetzungen
- PHP >= 8.1
- Composer
- Node.js & npm
- SQLite (Standard) oder MySQL/PostgreSQL

### Installation
```bash
git clone https://github.com/dein-benutzername/nebu-secure.git
cd nebu-secure
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Entwicklung starten
```bash
php artisan serve
```

## 🖼️ Screenshots

> *Hier können Screenshots der Anwendung eingefügt werden.*

## 📦 Docker
```bash
docker-compose up -d
```

## 🛡️ Sicherheit
- Passwortrichtlinien (min. 12 Zeichen, Sonderzeichen, etc.)
- Audit-Logs für Login/Logout
- Rate Limiting für sensitive Endpunkte

## 📄 Lizenz
Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

## 🤝 Kontakt & Mitwirken
- Pull Requests willkommen!
- Kontakt: [https://nebuliton.io]

---

> Erstellt mit ❤️ und Laravel

