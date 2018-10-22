#!/bin/sh

rm -rf /zusam/data/*
cp -n /zusam/config.yml /zusam/data/config.yml
php /zusam/api/bin/console zusam:init "zusam@${DOMAIN}" zusam zusam
mkdir -p /zusam/data/files
chown -R "${UID}:${GID}" /zusam
