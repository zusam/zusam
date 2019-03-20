#!/bin/sh

set -xe

# There are 2 possible instance types: "default" and "demo"
# "demo" will create a new instance that resets every day.
# "default" will assume you have a working db.

crontab -r
echo "* * * * * su-exec ${UID}:${GID} /zusam/api/bin/console zusam:cron > /dev/stdout" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

# copy example database if none is present
if ! [ -f "/zusam/data/${DATABASE_NAME}" ]; then
    cp /zusam/example.db "/zusam/data/${DATABASE_NAME}"
fi

if [ "${INSTANCE_TYPE}" = "demo" ]; then
    ENV="dev"
else
    ENV="prod"
fi

sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
       -e "s|<DOMAIN>|${DOMAIN}|g" \
       -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
       -e "s|<ENV>|${ENV}|g" \
       /zusam/config

if ! [ -f /zusam/data/config ]; then
    cp /zusam/config /zusam/data/config
fi

if ! [ -L /zusam/public/files ]; then
    ln -s /zusam/data/files /zusam/public/files
fi

# if this is a demo instance, reset it every day
if [ "${INSTANCE_TYPE}" = "demo" ]; then
    reset-demo.sh /zusam ${UID} ${GID}
    echo "0 * * * * /usr/local/bin/reset-demo.sh /zusam ${UID} ${GID} > /dev/stdout" | crontab -
fi

cp /zusam/public/${LANG}.js /zusam/public/lang.js

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx /zusam
exec /bin/s6-svscan /etc/s6.d
