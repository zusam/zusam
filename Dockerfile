FROM alpine:3.8
RUN apk add --no-cache -U su-exec tini s6
ENTRYPOINT ["/sbin/tini", "--"]

ENV UID=791 GID=791
ENV INSTANCE_TYPE=default
ENV DOMAIN=localhost
ENV DATABASE_NAME=data.db
EXPOSE 8080
WORKDIR /zusam

COPY docker/standalone/s6.d /etc/s6.d
COPY api /zusam/api
COPY app /zusam/app
COPY docker/standalone/config.yml /zusam/config.yml
COPY docker/standalone/nginx /etc/nginx
COPY docker/standalone/php7 /etc/php7
COPY docker/standalone/reset.sh /usr/local/bin/reset.sh
COPY docker/standalone/run.sh /usr/local/bin/run.sh
COPY public/api/index.php /zusam/public/api/index.php

RUN set -xe \
    && apk add --no-cache nginx php7 php7-fpm php7-imagick php7-mbstring php7-gd php7-intl php7-iconv php7-json php7-dom php7-ctype php7-xml php7-posix php7-session php7-tokenizer php7-fileinfo php7-openssl php7-simplexml php7-apcu php7-pdo_sqlite php7-curl php7-apcu php7-opcache ffmpeg openssl \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php7-phar yarn \
    && mkdir -p /run/nginx /zusam/data /zusam/public/api/thumbnails /zusam/api/var/cache/images \
    && cp /zusam/config.yml /zusam/data/config.yml \
    && ln -s /zusam/data/files /zusam/public/files \
    && cd /zusam/api && php bin/composer install --prefer-dist \
    && cd /zusam/app/bootstrap-light && yarn && cd .. && yarn && yarn full \
    && rm -rf /zusam/app \
    && apk del .build-deps \
    && chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

VOLUME /zusam/data
CMD ["run.sh"]
