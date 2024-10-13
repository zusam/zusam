#!/bin/sh

set -xe

chown -R "$UID:$GID" /zusam /etc/s6.d /etc/nginx /etc/php83
su-exec "$UID:$GID" /bin/bash
