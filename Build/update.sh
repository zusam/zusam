#!/bin/bash

sudo chown -R niels:http /srv/http/zusam
Build/build-js.sh compress
Build/build-css.sh
sudo chown -R niels:http /srv/http/zusam
Build/correct-install.sh correct

echo "verify your settings in the Globals.php file at the root"
