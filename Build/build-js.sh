#!/bin/bash

loc=`pwd`
JS="JS"

if [[ "$1" == "compress" ]]
then
	opt="--compress drop_console --mangle"
else
	opt="--beautify"
fi

D=" "
i=0
A=(`echo $JS/*`)
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
			b=`echo ".min.js"`
			if [[ -f "$p/uglify.order" ]]
			then
				cat $(cat "$p/uglify.order" | sed -r "s/[a-zA-Z0-9_.]+/js\/${libname}\/&/g") | uglifyjs - $opt > $JS'/'$libname$b
			else
				uglifyjs $JS/$libname/*.js $opt > $JS'/'$libname$b
			fi
			uglifyjs $JS/$libname/*.js $opt --wrap=$libname --export-all > $JS'/'$libname$b
			B=$B$D$JS'/'$libname$b
		fi
	fi
done

uglifyjs $B $opt > zusam.min.js
