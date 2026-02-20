FROM composer:2 AS composer_deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts --ignore-platform-req=ext-fileinfo

FROM node:20-alpine AS frontend_build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM php:8.3-fpm-alpine AS runtime
WORKDIR /var/www/html
RUN apk add --no-cache nginx supervisor icu-dev oniguruma-dev libzip-dev sqlite-dev postgresql-dev linux-headers
RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring bcmath pcntl exif
COPY --from=composer_deps /app/vendor ./vendor
COPY . .
COPY --from=frontend_build /app/public/build ./public/build
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh /usr/local/bin/start
RUN chmod +x /usr/local/bin/start
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 8080
CMD ["/usr/local/bin/start"]
