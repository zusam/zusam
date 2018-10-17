FROM alpine:3.8
RUN apk add --no-cache -U su-exec tini s6
ENTRYPOINT ["/sbin/tini", "--"]

ENV UID=791 GID=791
ENV INSTANCE_TYPE=default
ENV DOMAIN=localhost
EXPOSE 8080
WORKDIR /zusam

COPY docker/standalone/s6.d /etc/s6.d
COPY docker/standalone/php7 /etc/php7
COPY docker/standalone/nginx /etc/nginx

RUN set -xe \
    && apk add --no-cache nginx php7 php7-fpm php7-imagick php7-mbstring php7-gd php7-intl php7-iconv php7-json php7-dom php7-ctype php7-xml php7-posix php7-session php7-tokenizer php7-fileinfo php7-openssl php7-simplexml php7-apcu php7-pdo_sqlite php7-curl php7-apcu php7-opcache ffmpeg openssl

COPY public/api/index.php /zusam/public/api/index.php
COPY /docker/standalone/run.sh /usr/local/bin/run.sh
RUN set -xe \
    && chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

RUN set -xe \
    && mkdir -p /zusam/data/files \
    && mkdir -p /run/nginx

COPY api /zusam/api
COPY docker/standalone/config.yml /zusam/config.yml
RUN set -xe \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php7-phar \
    && cp /zusam/config.yml /zusam/data/config.yml \
    && mkdir -p /zusam/public/api/thumbnails /zusam/api/var/cache/images \
    && ln -s /zusam/data/files /zusam/public/files \
    && cd /zusam/api && php bin/composer install --prefer-dist \
    && rm /zusam/data/config.yml \
    && apk del .build-deps

COPY app /zusam/app
RUN set -xe \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget yarn \
    && cd /zusam/app/bootstrap-light && yarn && cd .. && yarn && yarn add json5 && yarn full \
    && rm -rf /zusam/app \
    && apk del .build-deps

VOLUME /zusam/data
CMD ["run.sh"]
