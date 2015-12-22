#!/bin/bash
#RESTORE

if [[ -d $1 ]]
then
	echo "must be a tar.gz file !"
	exit;
fi


read -p "this will erase all current data, are you sure to continue ?" yn

tar -xzvf "$1"
dir=$(echo $1 | sed 's/\.tar\.gz//');

case $yn in 
	[Yy]* ) 
		rm -rf Data/;
		mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){db.getSiblingDB(i).dropDatabase()})';;
	[Nn]* ) exit;;
esac

mongorestore --host 127.0.0.1 --port 27017 --dir "$dir"
mv "$dir/Data" Data
rm -rf "$dir"
