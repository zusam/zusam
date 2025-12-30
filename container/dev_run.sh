#!/bin/sh

set -xe

chown -R "$UID:$GID" /zusam /etc/s6.d /etc/nginx /etc/php85
su-exec "$UID:$GID" /bin/bash
