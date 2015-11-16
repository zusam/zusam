#!/bin/bash 
#BACKUP

t=`date +%s`
e=".tar.gz"
mkdir -v -p "BACKUP/$t" 
mongodump --host 127.0.0.1 --port 27017 --db zusam --out "BACKUP/$t"
cp -v -r Data/ "BACKUP/$t"
tar -czvf "BACKUP/$t$e" "BACKUP/$t"
rm -rf "BACKUP/$t"

