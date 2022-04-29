FROM alpine:3.15

# add tini and s6 to manage processes
RUN apk add --no-cache -U tini s6
ENTRYPOINT ["/sbin/tini", "--"]

# global environment variables
ENV ALLOW_EMAIL=true
ENV ALLOW_IMAGE_UPLOAD=true
ENV ALLOW_VIDEO_UPLOAD=true
ENV APP_ENV=prod
ENV DATABASE_NAME=data.db
ENV DOMAIN=localhost
ENV INIT_GROUP=zusam
ENV INIT_PASSWORD=zusam
ENV INIT_USER=zusam
ENV LANG=en
ENV SUBPATH=
EXPOSE 8080
WORKDIR /zusam

# install base packages
RUN set -xe && apk add --no-cache \
    ffmpeg \
    imagemagick \
    nginx \
    openssl \
    php8 \
    php8-common \
    php8-ctype \
    php8-curl \
    php8-dom \
    php8-fileinfo \
    php8-fpm \
    php8-iconv \
    php8-intl \
    php8-json \
    php8-mbstring \
    php8-opcache \
    php8-openssl \
    php8-pdo_sqlite \
    php8-pecl-apcu \
    php8-pecl-imagick \
    php8-posix \
    php8-session \
    php8-simplexml \
    php8-tokenizer \
    php8-xml \
    php8-xmlwriter \
    ln -sf /usr/bin/php8 /usr/bin/php

# copy files
COPY container/s6.d /etc/s6.d
COPY container/config /zusam/config
COPY container/php8 /etc/php8
COPY container/nginx /etc/nginx
COPY container/run.sh /usr/local/bin/run.sh
COPY public/api/index.php /zusam/public/api/index.php
COPY api /zusam/api
COPY app/dist /zusam/public

# handle build config
RUN set -xe \
    && mkdir -p /run/nginx /zusam/data /var/tmp/nginx /var/lib/nginx \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php8-phar unzip \
    && COMPOSER_ALLOW_SUPERUSER=1 php8 /zusam/api/bin/composer install -d /zusam/api --no-dev --prefer-dist \
    && rm -rf /zusam/data/data.db \
    && apk del .build-deps \
    && chmod -R 755 /usr/local/bin /etc/s6.d /var/lib/nginx /zusam/public /var/tmp/nginx

VOLUME /zusam/data
CMD ["run.sh"]
