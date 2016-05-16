#!/bin/bash 
# WEEKLY BACKUP
# total backup on mongodb but only week old files in Data/file

cd "/srv/http/zusam"

t=`date +%s`
p="wb"
e=".tar.gz"
mkdir -v -p "BACKUP/$t$p/file"
mongodump --host 127.0.0.1 --port 27017 --db zusam --out "BACKUP/$t$p"
cp -v -t "BACKUP/$t$p/file" `find Data/file -type f -ctime -7 -print0 | tr '\0' ' '`
tar -czvf "BACKUP/$t$p$e" "BACKUP/$t$p"
rm -rf "BACKUP/$t$p"

