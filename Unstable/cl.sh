#!/bin/bash

loc=`pwd`

function SLOC {
	cd "$loc"
	cd "$1"
	for f in *
	do
		if [ -d "$f" ] 
		then
			SLOC "$1/$f"
		else
			#filename=$(basename "$f")
			#ext="${filename##*.}"
			if [ -f "$f" ]
			then
				tmp=`cat "$f" | wc -l`
				n=$(($n + $tmp))
			fi
		fi
	done
}
A=(`find . -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0`)
n=0
for p in "${A[@]}";
do
	SLOC "$p"
done
echo $n
