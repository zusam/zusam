#!/bin/sh

rm -rf /zusam/data/*
mv /zusam/config.yml /zusam/data/config.yml
php /zusam/api/bin/console zusam:init "zusam@${DOMAIN}" zusam zusam
chown -R "${UID}:${GID}" /zusam
