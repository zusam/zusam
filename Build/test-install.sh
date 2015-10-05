#!/bin/bash

loc=`pwd`

# TEST EXISTENCE OF SOME PACKAGES
P=(nodejs npm ruby ffmpeg mongodb php-mcrypt php-imagick php-gd php-mongo)
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
if [ ! -d "Data/avatar" ] 
then 
	if [[ "$1" != "correct" ]]
	then
		echo "Data/avatar directory is missing"
	else 
		mkdir -p Data/avatar
		sudo chown -R niels:http Data
		chmod -R 775 Data
		echo "Data/avatar added"
	fi
fi
if [ ! -d "Data/miniature" ] 
then 
	if [[ "$1" != "correct" ]]
	then
		echo "Data/miniature directory is missing"
	else 
		mkdir -p Data/miniature
		sudo chown -R niels:http Data
		chmod -R 775 Data
		echo "Data/miniature added"
	fi
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
				if [[ "$2" != "correct" ]]
				then
					echo "`pwd`"
					echo "$f permissions should be 775"
					echo "they are $p"
				else
					pa=`pwd`
					chmod 775 "$pa/$f"
					echo "`pwd`"
					echo "$f corrected"
				fi
			fi
		else
			filename=$(basename "$f")
			ext="${filename##*.}"
			if [ "$ext" == "php" ]
			then
				p=`stat -c "%a" "$f"`
				if [ "$p" != "770" ]
				then
					if [[ "$2" != "correct" ]]
					then
						echo "`pwd`"
						echo "$f permissions should be 770"
						echo "they are $p"
					else
						pa=`pwd`
						chmod 770 "$pa/$f"
						echo "`pwd`"
						echo "$f corrected"
					fi
				fi
			fi
			if [ "$ext" == "js" ] || [ "$ext" == "css" ] || [ "$ext" == "jpg" ]
			then
				p=`stat -c "%a" "$f"`
				if [ "$p" != "775" ]
				then
					if [[ "$2" != "correct" ]]
					then
						echo "`pwd`"
						echo "$f permissions should be 775"
						echo "they are $p"
					else
						pa=`pwd`
						chmod 775 "$pa/$f"
						echo "`pwd`"
						echo "$f corrected"
					fi
				fi
			fi
		fi
	done
}
A=(`find . -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0`)
for p in "${A[@]}";
do
	test_perm "$p" "$1"
done
echo ""
echo "everything is ok"
	
