FROM alpine:3.8

# add tini and s6 to manage processes
RUN apk add --no-cache -U su-exec tini s6
ENTRYPOINT ["/sbin/tini", "--"]

# global environment variables
ENV UID=791 GID=791
ENV INSTANCE_TYPE=default
ENV DOMAIN=localhost
ENV DATABASE_NAME=data.db
EXPOSE 8080
WORKDIR /zusam

# install base packages
RUN set -xe && apk add --no-cache nginx php7 php7-fpm php7-imagick php7-mbstring php7-gd php7-intl php7-iconv php7-json php7-dom php7-ctype php7-xml php7-posix php7-session php7-tokenizer php7-fileinfo php7-openssl php7-simplexml php7-apcu php7-pdo_sqlite php7-curl php7-apcu php7-opcache ffmpeg openssl

# copy files
COPY docker/zusam/s6.d /etc/s6.d
COPY api /zusam/api
COPY app /zusam/app
COPY docker/zusam/config.yml /zusam/config.yml
COPY docker/zusam/php7 /etc/php7
COPY docker/zusam/nginx /etc/nginx
COPY docker/zusam/reset.sh /usr/local/bin/reset.sh
COPY docker/zusam/run.sh /usr/local/bin/run.sh
COPY public/api/index.php /zusam/public/api/index.php

# install zusam
RUN set -xe \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php7-phar yarn \
    && mkdir -p /run/nginx /zusam/data \
    && sed -e "s|<ENV>|prod|g" /zusam/config.yml > /zusam/data/config.yml \
    && cd /zusam/api && php bin/composer install --prefer-dist \
    && cd /zusam/app/bootstrap-light && yarn && cd .. && yarn && yarn full \
    && rm -rf /zusam/app /root/* \
    && apk del .build-deps \
    && chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

VOLUME /zusam/data
CMD ["run.sh"]
