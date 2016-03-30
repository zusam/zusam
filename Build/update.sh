#!/bin/bash

Build/build-js.sh compress
Build/build-css.sh
Buid/owner.sh
Build/correct-install.sh correct

echo "verify your settings in the Globals.php file at the root"
