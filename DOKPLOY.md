# Dokploy Deployment

## 1) Repository
- Push these files to your git repository:
  - `Dockerfile`
  - `docker-compose.yml`
  - `docker/start.sh`
  - `docker/supervisord.conf`
  - `docker/nginx/default.conf`

## 2) Dokploy App
- Create a new **Compose** app in Dokploy.
- Select your repository and branch.
- Compose file: `docker-compose.yml`.

## 3) Environment Variables
Set at least:
- `APP_NAME=NebU Secure Vault`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.tld`
- `LOG_CHANNEL=stack`
- `LOG_LEVEL=warning`
- `DB_CONNECTION=mysql`
- `DB_HOST=<db-host>`
- `DB_PORT=3306`
- `DB_DATABASE=<db-name>`
- `DB_USERNAME=<db-user>`
- `DB_PASSWORD=<db-password>`
- `SESSION_DRIVER=database`
- `QUEUE_CONNECTION=database`
- `CACHE_STORE=database`
- `TELESCOPE_ENABLED=false`
- `VAULT_MASTER_KEYS=<version:key list>`
- `VAULT_CURRENT_KEY_VERSION=<latest version>`

If you use file-based keys:
- `VAULT_MASTER_KEY_FILE=/run/secrets/vault_master_keys.json`

## 4) First Deploy
Run once after deploy:
- `php artisan key:generate`
- `php artisan migrate --force`
- `php artisan db:seed --force`

## 5) Every Deploy
Run after each deploy:
- `php artisan migrate --force`
- `php artisan optimize:clear`

## 6) Domain
- Route your domain to the `web` service.
- Internal service port: `8080`.
- Enable HTTPS in Dokploy.

## 7) Notes
- `queue` and `scheduler` are separate services and start automatically.
- `storage` and `database` are persisted by named volumes in compose.
- For production, prefer MySQL/PostgreSQL over SQLite.
