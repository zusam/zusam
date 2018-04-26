#!/bin/sh

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx
exec su-exec "${UID}:${GID}" /bin/s6-svscan /etc/s6.d
