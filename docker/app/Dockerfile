FROM alpine:3.7

ENV UID=791 GID=791

VOLUME /www
EXPOSE 8080 8443

# install core
RUN set -xe && apk add --no-cache -U s6 su-exec ca-certificates nginx
RUN set -xe && mkdir -p /run/nginx

COPY s6.d /etc/s6.d
COPY run.sh /usr/local/bin/run.sh
COPY nginx /etc/nginx

RUN chmod -R +x /usr/local/bin /etc/s6.d /var/lib/nginx

CMD ["run.sh"]
