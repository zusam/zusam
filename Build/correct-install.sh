#!/bin/bash

loc=`pwd`

# ERASE GENERATED JS
if [[ "$1" != "correct" ]]
then
	/usr/bin/find JS/ -name "*.min.js"
fi

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
P=(tmp Data/avatar Data/miniature Data/file)
for p in "${P[@]}";
do
	if [ ! -d "$p" ] 
	then 
		if [[ "$1" != "correct" ]]
		then
			echo "$p directory is missing"
		else 
			mkdir -p "$p"
			sudo chown -R niels:http "$p"
			chmod -R 775 "$p"
			echo "$p added"
		fi
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
		else
			filename=$(basename "$f")
			ext="${filename##*.}"
			if [ "$ext" == "php" ] || [ "$ext" == "sh" ]
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
			if [ "$ext" == "js" ] \
				|| [ "$ext" == "css" ] \
				|| [ "$ext" == "jpg" ] \
				|| [ "$ext" == "png" ] \
				|| [ "$ext" == "webm" ] \
				|| [ "$ext" == "svg" ] \
				|| [ "$ext" == "woff" ]
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
A=(`find . -mindepth 0 -maxdepth 3 -type d -not -path '*/\.*' -print0 | xargs -0`)
for p in "${A[@]}";
do
	test_perm "$p" "$1"
done

# CHANGE OWNERSHIP
if [[ "$1" != "correct" ]]
then
	sudo chown -R niels:http *
fi

echo ""
echo "everything is ok"
	
