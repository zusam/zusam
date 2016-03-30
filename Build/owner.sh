#!/bin/bash

RESTRICT=(Build Unstable BACKUP Tests Maintenance)

sudo chown -R niels:http /srv/http/zusam

for p in "${RESTRICT[@]}";
do
	if [[ -d "$p" ]] 
	then
		sudo chown -R niels:wheel "$p"
	fi
done
