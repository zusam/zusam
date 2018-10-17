#!/bin/sh

# There are 3 possible instance types: "default", "demo" and "new"
# "new" will create a first user and group.
# "demo" will create a demo instance.
# "default" will assume you have a working db.

set -xe

if [ ${INSTANCE_TYPE} == "demo" ]; then
    DATABASE_URL="sqlite:////tmp/data.db"
else
    DATABASE_URL="sqlite:///%kernel.project_dir%/../data/data.db"
fi

sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
       -e "s|<DOMAIN>|${DOMAIN}|g" \
       -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
       /zusam/config.yml

mv -n /zusam/config.yml /zusam/data/config.yml

cd /zusam/api
if [ ${INSTANCE_TYPE} == "demo" ]; then
    php bin/console zusam:init "demo@${DOMAIN}" demo-group demo
    chmod 755 /tmp/data.db
    chown -R "${UID}:${GID}" /tmp/data.db
fi

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx /zusam
exec su-exec "${UID}:${GID}" /bin/s6-svscan /etc/s6.d
