FROM alpine:3.8
RUN apk add --no-cache -U su-exec tini s6
ENTRYPOINT ["/sbin/tini", "--"]

ENV UID=791 GID=791
ENV INSTANCE_TYPE=default
ENV DOMAIN=localhost
ENV DATABASE_NAME=data.db
EXPOSE 8080
VOLUME /zusam

# install core
RUN set -xe && apk add --no-cache -U nginx php7 openssl ffmpeg
RUN set -xe && apk add --no-cache \
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

RUN set -xe && apk add --no-cache ffmpeg imagemagick
RUN set -xe && mkdir -p /run/nginx

COPY s6.d /etc/s6.d
COPY php7 /etc/php7
COPY nginx /etc/nginx
COPY run.sh /usr/local/bin/run.sh

RUN chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

CMD ["run.sh"]
