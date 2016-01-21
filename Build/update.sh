#!/bin/bash

sudo chown -R niels:http .
Build/build-js.sh compress
Build/build-css.sh
Build/correct-install.sh correct

echo "verify your settings in the Globals.php file at the root"
