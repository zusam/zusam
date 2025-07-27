#!/bin/sh

set -xe

chown -R "$UID:$GID" /zusam /etc/s6.d /etc/nginx /etc/php84
su-exec "$UID:$GID" /bin/bash
