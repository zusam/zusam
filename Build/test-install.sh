#!/bin/bash

loc=`pwd`

# TEST EXISTENCE OF SOME PACKAGES
P=(ffmpeg mongodb php-mcrypt php-imagick php-gd php-mongo)
for p in "${P[@]}";
do
	x=`pacman -Qs $p`
	if [ -z "$x" ]
	then
		echo "$p missing";
	fi
done

# TEST DIRECTORY TREE
if [ ! -d "/srv/http" ] 
then 
	echo "/srv/http should exists and be the root directory of apache"
fi

# TEST PERMISSIONS
function test_perm {
	cd $loc
	cd $1
	for f in *
	do
		if [ -d "$f" ] 
		then
			p=`stat -c "%a" "$f"`
			if [ "$p" != "775" ]
			then
				echo "`pwd`"
				echo "$f permissions should be 775"
				echo "they are $p"
			fi
		else
			filename=$(basename "$f")
			ext="${filename##*.}"
			if [ "$ext" == "php" ]
			then
				p=`stat -c "%a" "$f"`
				if [ "$p" != "770" ]
				then
					echo "`pwd`"
					echo "$f permissions should be 770"
					echo "they are $p"
				fi
			fi
			if [ "$ext" == "js" ] || [ "$ext" == "css" ]
			then
				p=`stat -c "%a" "$f"`
				if [ "$p" != "775" ]
				then
					echo "`pwd`"
					echo "$f permissions should be 775"
					echo "they are $p"
				fi
			fi
		fi
	done
}
A=(`find . -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0`)
for p in "${A[@]}";
do
	test_perm "$p"
done
echo ""
echo "everything is ok"
	
