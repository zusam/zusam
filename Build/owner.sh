#!/bin/bash

RESTRICT=(Build Unstable BACKUP Maintenance Fcron Log)

sudo chown -R niels:http /srv/http/zusam

for p in "${RESTRICT[@]}";
do
	#if [[ -d "$p" ]] 
	#then
		sudo chown -R niels:wheel "$p"
	#fi
done
