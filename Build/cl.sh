#!/bin/bash

loc=`pwd`

function SLOC {
	cd $loc
	cd $1
	for f in *
	do
		if [ -f "$f" ] 
		then
			#filename=$(basename "$f")
			#ext="${filename##*.}"
			tmp=`cat "$f" | wc -l`
			n=$(($n + $tmp))
		else
			SLOC "$f"
		fi
	done
}
A=(Core Ajax Filtre Reduc Typebox Retouche Pages Build)
n=0
for p in "${A[@]}";
do
	SLOC "$p"
done
echo $n
