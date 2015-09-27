#!/bin/bash

sass SCSS/style.scss:style.css -t compressed
chmod 775 *.css *.map
