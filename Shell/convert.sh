#!/bin/bash
/usr/bin/ffmpeg -t 600 -i "$1" -c:v libvpx -filter:v scale=480:-1 -speed 2 -crf 24 -b:v 600k -c:a libvorbis -y -t 600 "$2" -progress "$3"
/usr/bin/rm "$3"
