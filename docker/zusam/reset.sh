#!/bin/sh

rm -rf /zusam/data/data.db /zusam/data/files /zusam/data/cache
if ! [ -f /zusam/data/config ]; then
    cp /zusam/config /zusam/data/config
fi
php /zusam/api/bin/console zusam:init "zusam@${DOMAIN}" zusam zusam
mkdir -p /zusam/data/files /zusam/data/cache
chown -R "${UID}:${GID}" /zusam
