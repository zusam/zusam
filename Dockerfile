FROM alpine:3.9

# add tini and s6 to manage processes
RUN apk add --no-cache -U su-exec tini s6
ENTRYPOINT ["/sbin/tini", "--"]

# Default lang of the webapp
ARG LANG="en"

# global environment variables
ENV UID=791 GID=791
ENV INSTANCE_TYPE=default
ENV DOMAIN=localhost
ENV DATABASE_NAME=data.db
EXPOSE 8080
WORKDIR /zusam

# install base packages
RUN set -xe && apk add --no-cache nginx php7 openssl ffmpeg yarn \
    php7-apcu \
    php7-common \
    php7-ctype \
    php7-curl \
    php7-dom \
    php7-fileinfo \
    php7-fpm \
    php7-gd \
    php7-iconv \
    php7-imagick \
    php7-intl \
    php7-json \
    php7-mbstring \
    php7-opcache \
    php7-openssl \
    php7-pdo_sqlite \
    php7-phar \
    php7-posix \
    php7-session \
    php7-simplexml \
    php7-tokenizer \
    php7-xml \
    php7-xmlwriter \
    php7-zip

# copy files
COPY docker/zusam/s6.d /etc/s6.d
COPY docker/zusam/config /zusam/config
COPY docker/zusam/php7 /etc/php7
COPY docker/zusam/nginx /etc/nginx
COPY docker/zusam/reset.sh /usr/local/bin/reset.sh
COPY docker/zusam/run.sh /usr/local/bin/run.sh
COPY public/api/index.php /zusam/public/api/index.php
COPY api /zusam/api
COPY app/dist/* /zusam/public/

# handle build config
RUN set -xe \
    && mkdir -p /run/nginx /zusam/data \
    && sed -e "s|<ENV>|prod|g" /zusam/config > /zusam/data/config \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php7-phar unzip \
    && cd /zusam/api && php bin/composer install --prefer-dist \
    && mv /zusam/public/${LANG}.js /zusam/public/lang.js \
    && apk del .build-deps \
    && chmod -R 755 /usr/local/bin /etc/s6.d /var/lib/nginx /zusam/public

VOLUME /zusam/data
CMD ["run.sh"]
