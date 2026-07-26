#!/bin/sh

set -xe

# Output that can be useful for debugging
echo "USER: ${UID}"
echo "GROUP: ${GID}"

# Remove event directories that can cause fails like:
# s6-supervise <service name>: fatal: unable to mkfifodir event: Permission denied
rm -rf "$(find /etc/s6.d -name 'event')"

# It's necessary that crond runs as root since we're operating it with crontab here (as root)
crontab -r
echo "* * * * * /sbin/su-exec ${UID}:${GID} /usr/bin/php /zusam/api/bin/console zusam:cron > /dev/stdout" | crontab -

DATABASE_URL="sqlite:///%kernel.project_dir%/../data/${DATABASE_NAME}"

# Preparation of the default configuration file
if [ -f /zusam/config ]; then
  sed -i -e "s|<SECRET>|$(openssl rand -base64 48)|g" \
    -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
    -e "s|<APP_ENV>|${APP_ENV:-prod}|g" \
    /zusam/config
fi

# Copy of the default configuration file if none exists
if ! [ -f /zusam/data/config ]; then
  cp /zusam/config /zusam/data/config
fi

if ! [ -L /zusam/public/files ]; then
  ln -s /zusam/data/files /zusam/public/files
fi

# Install backend dependencies
COMPOSER_ALLOW_SUPERUSER=1 /usr/bin/php /zusam/api/bin/composer install -d /zusam/api --prefer-dist --no-interaction

# The database always lives at /zusam/data/<DATABASE_NAME>.
# We avoid using `debug:config` here because it returns unresolved env
# placeholders (e.g. %env(resolve:DATABASE_URL)%) in prod mode.
DATABASE_PATH="/zusam/data/${DATABASE_NAME}"

# Initialize database if none is present (use -s to check size > 0, as composer may create empty file)
if ! [ -s "${DATABASE_PATH}" ]; then
  INIT_USER_VALUE=${INIT_USER:-zusam}
  INIT_GROUP_VALUE=${INIT_GROUP:-zusam}
  INIT_PASSWORD_VALUE=${INIT_PASSWORD:-zusam}
  /zusam/api/bin/console zusam:init "${INIT_USER_VALUE}" "${INIT_GROUP_VALUE}" "${INIT_PASSWORD_VALUE}"
else
  /zusam/api/bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration -vv
fi

if [ -n "${SUBPATH}" ]; then
  ln -sfn /etc/nginx/nginx-subpath.conf /etc/nginx/nginx.conf
  sed -i -e "s|@SUBPATH@|${SUBPATH}|g" /etc/nginx/nginx.conf
  sed -i -e "s|href=\"|href=\"${SUBPATH}|g" /zusam/public/index.html
  sed -i -e "s|src=\"|src=\"${SUBPATH}|g" /zusam/public/index.html
else
  ln -sfn /etc/nginx/nginx-root.conf /etc/nginx/nginx.conf
fi

mkdir -p /zusam/api/var/log /zusam/api/var/cache

chown -R "$UID:$GID" /zusam /etc/s6.d /etc/nginx /etc/php85 /var/lib/nginx /var/log /run/nginx

exec /usr/bin/s6-svscan /etc/s6.d
