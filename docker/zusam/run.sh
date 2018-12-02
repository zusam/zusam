#!/bin/sh

# There are 3 possible instance types: "default", "demo" and "new"
# "new" will create a new instance.
# "demo" will create a new instance that resets every day.
# "default" will assume you have a working db.

crontab -r
echo "* * * * * su-exec ${UID}:${GID} /zusam/api/bin/console zusam:cron >> /zusam/api/var/log/cron.log" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

if [ ${INSTANCE_TYPE} == "demo" ]; then
    ENV="dev"
else
    ENV="prod"
fi

sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
       -e "s|<DOMAIN>|${DOMAIN}|g" \
       -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
       -e "s|<ENV>|${ENV}|g" \
       /zusam/config.yml

if ! [ -f /zusam/data/config.yml ]; then
    cp /zusam/config.yml /zusam/data/config.yml
fi
ln -s /zusam/data/files /zusam/public/files

if [ ${INSTANCE_TYPE} == "demo" ] || [ ${INSTANCE_TYPE} == "new" ]; then
    reset.sh
fi

# if this is a demo instance, reset it every day
if [ ${INSTANCE_TYPE} == "demo" ]; then
    echo "0 0 * * * su-exec ${UID}:${GID} /usr/local/bin/reset.sh >> /zusam/api/var/log/cron.log" | crontab -
fi

chown -R "${UID}:${GID}" /etc/s6.d /var/log/ /var/tmp/ /etc/php7 /etc/nginx /run/nginx /zusam
exec /bin/s6-svscan /etc/s6.d
