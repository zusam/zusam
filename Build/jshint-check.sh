#!/bin/bash

loc=`pwd`

function jshint-check {
	cd $loc
	cd $1
	for f in *
	do
		if [ -f "$f" ] 
		then
			filename=$(basename "$f")
			ext="${filename##*.}"
			if [ "$ext" == "js" ]
			then
				jshint "$f" 2>&1
			fi
		fi
	done
}
A=(`find JS/ -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0`)
for p in "${A[@]}";
do
	jshint-check "$p"
done
