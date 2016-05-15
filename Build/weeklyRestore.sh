#!/bin/bash
#WEEKLY RESTORE

if [[ -d $1 ]] || [[ -z $1 ]]
then
	echo "must be a tar.gz file !"
	exit;
fi


p=`echo "$1" | grep -c "wb"`
if [[ $p != 1 ]]
then
	echo "must be weekly backup file !"
	exit;
fi

read -p "This is a weekly restore. It will set the db to the backup's state. Are you sure to continue ?" yn

tar -xzvf "$1"
dir=$(echo $1 | sed 's/\.tar\.gz//');

case $yn in 
	[Yy]* ) 
		mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){db.getSiblingDB(i).dropDatabase()})';;
	[Nn]* ) exit;;
esac

mongorestore --host 127.0.0.1 --port 27017 --dir "$dir"
mv -vf "$dir/file/"* Data/file/
rm -rf "$dir"
