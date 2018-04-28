FROM alpine:3.7

ENV UID=791
ENV GID=791
ENV USER=btl
ENV GROUP=btl

VOLUME /btl
WORKDIR /btl

RUN apk add --no-cache -U su-exec git zip unzip curl wget nodejs-npm gnupg yarn sudo acl python2

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

ENTRYPOINT ["run.sh"]
