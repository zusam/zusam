FROM alpine:3.7

ENV UID=791
ENV GID=791
ENV USER=exec
ENV GROUP=exec

VOLUME /data
WORKDIR /data

RUN set -xe \
    && apk add --no-cache -U su-exec php7 git zip unzip curl wget ca-certificates openssl bash nodejs-npm gnupg sudo acl sqlite
RUN set -xe && apk add --no-cache php7-common php7-mbstring php7-gd php7-intl php7-iconv php7-json php7-dom php7-ctype php7-xml php7-posix php7-session php7-tokenizer php7-fileinfo php7-pdo_sqlite php7-phar php7-curl php7-simplexml php7-xmlwriter php7-zip php7-openssl
RUN set -xe && apk add --no-cache yarn

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

ENTRYPOINT ["run.sh"]
