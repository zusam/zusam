#!/bin/sh

set -xe

# There are 2 possible instance types: "default" and "demo"
# "demo" will create a new instance that resets every day.
# "default" will assume you have a working db.

crontab -r
echo "* * * * * su-exec ${UID}:${GID} /zusam/api/bin/console zusam:cron >> /dev/stdout" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

if [ "${INSTANCE_TYPE}" = "demo" ]; then
    ENV="dev"
else
    ENV="prod"
fi

if ! [ -f /zusam/data/config ]; then
    cp /zusam/config /zusam/data/config
fi
if ! [ -L /zusam/public/files ]; then
    ln -s /zusam/data/files /zusam/public/files
fi

sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
       -e "s|<DOMAIN>|${DOMAIN}|g" \
       -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
       -e "s|<ENV>|${ENV}|g" \
       -e "s|<LANG>|${LANG}|g" \
       /zusam/config

if [ "${INSTANCE_TYPE}" = "demo" ]; then
    reset.sh
fi

# if this is a demo instance, reset it every day
if [ "${INSTANCE_TYPE}" = "demo" ]; then
    echo "0 * * * * su-exec ${UID}:${GID} /usr/local/bin/reset.sh >> /dev/stdout" | crontab -
fi

# install webapp
cd /zusam/app
yarn && yarn serve
chmod 755 -R /zusam/public

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx /zusam
exec /bin/s6-svscan /etc/s6.d
