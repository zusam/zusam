FROM alpine:3.9
RUN apk add --no-cache -U su-exec tini
ENTRYPOINT ["/sbin/tini", "--"]

ENV UID=791
ENV GID=791
ENV USER=exec
ENV GROUP=exec

VOLUME /data
WORKDIR /data

RUN set -xe && apk add --no-cache php7 git zip unzip curl wget ca-certificates openssl nodejs-npm gnupg sudo acl sqlite yarn
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
RUN set -xe && apk add --no-cache ffmpeg
RUN set -xe && apk add --no-cache rsync openssh

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

ENTRYPOINT ["run.sh"]
