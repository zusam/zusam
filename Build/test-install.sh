#!/bin/bash

cd ../
loc=`pwd`

# TEST EXISTENCE OF SOME PACKAGES
P=(ffmpeg mongodb php-mcrypt php-imagick php-gd php-mongo)
for p in "${P[@]}";
do
	x=`pacman -Qs $p`
	if [ -n "$x" ]
	then
		echo "$p ok";
	else
		echo "$p missing";
		exit 1;
	fi
done

# TEST DIRECTORY TREE
if [ -d "/srv/http" ] 
then 
	echo "root tree ok"
else
	echo "/srv/http should exists and be the root directory of apache"
	exit 1;
fi

A=(Data Data/avatar Data/miniature Assets Assets/avatar)
for p in "${A[@]}";
do
	if [ -d "$p" ]
	then 
		echo "$p directory ok"
	else 
		echo "$p directory should exists"
		exit 1;
	fi
done

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
				exit 1
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
					exit 1
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
					exit 1
				fi
			fi
		fi
	done
}
A=(Core Ajax Filtre Reduc Typebox CSS JS Retouche Pages)
for p in "${A[@]}";
do
	test_perm "$p"
done
echo ""
echo "everything is ok"
	
