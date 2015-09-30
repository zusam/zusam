#!/bin/bash

loc=`pwd`

D=" "
i=0
A=(`echo JS/*`)
for p in "${A[@]}";
do
	if [[ -f "$p" ]]
	then
		filename=$(basename "$p")
		ext="${filename##*.}"
		if [ "$ext" == "js" ]
		then
			B=$B$D$p
		fi
	else
		if [[ -d "$p" ]]
		then
			libname=$(basename "$p")
			a=`echo "JS/"`
			b=`echo ".min.js"`
			uglifyjs JS/$libname/*.js --compress --mangle --wrap=$libname --export-all > $a$libname$b
			B=$B$D$a$libname$b
		fi
	fi
done

uglifyjs $B --compress --mangle > zusam.min.js
