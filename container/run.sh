#!/bin/sh

set -xe

# Remove event directories that can cause fails like:
# s6-supervise <service name>: fatal: unable to mkfifodir event: Permission denied
rm -rf $(find /etc/s6.d -name 'event')

crontab -r
echo "* * * * * php83 /zusam/api/bin/console zusam:cron > /dev/stdout" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

if [ -f /zusam/config ]; then
  sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
    -e "s|<DOMAIN>|${DOMAIN}|g" \
    -e "s|<ALLOW_EMAIL>|${ALLOW_EMAIL}|g" \
    -e "s|<ALLOW_IMAGE_UPLOAD>|${ALLOW_IMAGE_UPLOAD}|g" \
    -e "s|<ALLOW_VIDEO_UPLOAD>|${ALLOW_VIDEO_UPLOAD}|g" \
    -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
    -e "s|<APP_ENV>|${APP_ENV}|g" \
    -e "s|<LANG>|${LANG}|g" \
    /zusam/config
fi

if ! [ -f /zusam/data/config ]; then
  cp /zusam/config /zusam/data/config
fi

if ! [ -L /zusam/public/files ]; then
  ln -s /zusam/data/files /zusam/public/files
fi

# initialize database if none is present
if ! [ -f "/zusam/data/${DATABASE_NAME}" ]; then
  /zusam/api/bin/console zusam:init "${INIT_USER}" "${INIT_GROUP}" "${INIT_PASSWORD}"
fi

if [ -n "${SUBPATH}" ]; then
  ln -sfn /etc/nginx/nginx-subpath.conf /etc/nginx/nginx.conf
  sed -i -e "s|@SUBPATH@|${SUBPATH}|g" /etc/nginx/nginx.conf
  sed -i -e "s|href=\"|href=\"${SUBPATH}|g" /zusam/public/index.html
  sed -i -e "s|src=\"|src=\"${SUBPATH}|g" /zusam/public/index.html
else
  ln -sfn /etc/nginx/nginx-root.conf /etc/nginx/nginx.conf
fi

chown -R "$UID:$GID" /zusam /etc/s6.d /etc/nginx /etc/php83 /var/lib/nginx /var/log /run/nginx
su-exec "$UID:$GID" /bin/s6-svscan /etc/s6.d
