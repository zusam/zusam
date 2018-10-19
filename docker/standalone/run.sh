#!/bin/sh

# There are 3 possible instance types: "default", "demo" and "new"
# "new" will create a new instance.
# "demo" will create a new instance that resets every day.
# "default" will assume you have a working db.

set -xe

crontab -r
echo "0 * * * * su-exec ${UID}:${GID} /zusam/api/bin/console zusam:cron" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
       -e "s|<DOMAIN>|${DOMAIN}|g" \
       -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
       /zusam/config.yml

mv -n /zusam/config.yml /zusam/data/config.yml
mkdir -p /zusam/data/files

if [ ${INSTANCE_TYPE} == "demo" ] || [ ${INSTANCE_TYPE} == "new" ]; then
    reset.sh
fi

# if this is a demo instance, reset it every day
if [ ${INSTANCE_TYPE} == "demo" ] || [ ${INSTANCE_TYPE} == "new" ]; then
    echo "0 0 * * * su-exec ${UID}:${GID} /usr/local/bin/reset.sh" | crontab -
fi

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx /zusam
exec su-exec "${UID}:${GID}" /bin/s6-svscan /etc/s6.d
