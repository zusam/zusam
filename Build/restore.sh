#!/bin/bash
#RESTORE

if [[ -f $1 ]]
then
	echo "must be a file !"
	exit;
fi

read -p "this will erase all current data, are you sure to continue ?" yn
case $yn in 
	[Yy]* ) 
		rm -rf Data/;
		mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){db.getSiblingDB(i).dropDatabase()})';
		break;;
	[Nn]* ) exit;;
esac

mongorestore --host 127.0.0.1 --port 27017 --dir "$1"
mv "$1/Data" Data

