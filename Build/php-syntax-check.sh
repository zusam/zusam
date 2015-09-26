#!/bin/bash

loc=`pwd`

function php-check-syntax {
	cd $loc
	cd $1
	for f in *
	do
		if [ -f "$f" ] 
		then
			filename=$(basename "$f")
			ext="${filename##*.}"
			if [ "$ext" == "php" ]
			then
				php -l "$f" 2>&1 | sed '/^No/d'
			fi
		fi
	done
}
A=(Core Ajax Filtre Reduc Typebox Retouche Pages)
for p in "${A[@]}";
do
	php-check-syntax "$p"
done
