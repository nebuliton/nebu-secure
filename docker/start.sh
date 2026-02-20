#!/usr/bin/env sh
set -e
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
php artisan optimize:clear
php artisan config:cache
php artisan view:cache
exec /usr/bin/supervisord -c /etc/supervisord.conf
