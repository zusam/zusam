#!/bin/bash

loc=`pwd`
SCSS="SCSS"
LIBSCSS="LibSCSS"

rnd=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

find $SCSS -maxdepth 3 -name "*.scss" > "$rnd"
sed 's/.*/@import "&";/g' < "$rnd" > style.scss
sass style.scss:style.css -t compressed
rm "$rnd" style.scss
chmod 775 *.css *.map
