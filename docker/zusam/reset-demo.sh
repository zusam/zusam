#!/bin/sh

echo "Reset demo"
rm -rf /zusam/data/*
sleep 3
mkdir -p /zusam/data
chmod 755 /zusam/data
sleep 3
tar -xf /zusam/demo.tar.gz -C /zusam
sleep 3
chown -R "${UID}:${GID}" /zusam
