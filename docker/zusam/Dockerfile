FROM alpine:3.7

ENV UID=791 GID=791

VOLUME /www
EXPOSE 8080 8443

# install core
RUN set -xe && apk add --no-cache -U s6 su-exec ca-certificates nginx php7-fpm
RUN set -xe && apk add --no-cache php7-common php7-imagick php7-mbstring php7-gd php7-intl php7-iconv php7-json php7-dom php7-ctype php7-xml php7-posix php7-session php7-tokenizer php7-fileinfo php7-openssl php7 php7-simplexml php7-apcu php7-pdo_sqlite
RUN set -xe && mkdir -p /run/nginx

COPY s6.d /etc/s6.d
COPY run.sh /usr/local/bin/run.sh
COPY php-fpm.conf /etc/php7/php-fpm.conf
COPY nginx /etc/nginx

RUN chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

CMD ["run.sh"]
