#!/bin/sh

echo "%$GROUP ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
adduser -h /data -D -u "$UID" "$USER"
grep -q "$GROUP" /etc/group || addgroup -g "$GID" "$GROUP"
addgroup "$USER" "$GROUP"
PASSWORD=$(tr -dc "a-zA-Z0-9" < /dev/urandom | fold -w 50 | head -n1)
echo "$USER:$PASSWORD" | chpasswd 2>/dev/null

su-exec "$UID:$GID" "$@"
