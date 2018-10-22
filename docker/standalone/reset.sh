#!/bin/sh

rm -rf /zusam/data/*
if ! [ -f /zusam/data/config.yml ]; then
    cp /zusam/config.yml /zusam/data/config.yml
fi
php /zusam/api/bin/console zusam:init "zusam@${DOMAIN}" zusam zusam
mkdir -p /zusam/data/files
chown -R "${UID}:${GID}" /zusam
