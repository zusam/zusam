Zusam

Zusam is intended to work on a archlinux system along with mongodb, nginx, ruby, nodejs, php7.
You can use the server-install repo to create a clean environnement for Zusam.

requirements :
- the repo should be place in the /srv/http folder.
- it needs : php-mcrypt, php-imagick, php-mongodb to be installed and activated in the php.ini file.
- ffmpeg is necessary to convert videos.
- the owner of the non-data files should be user:http where user is a non root user created to push new code on the server.
- you will need ruby/gem and the sass compiler to build the css files : "gem install sass".
- nodejs is required to use uglifyJS2 (don't forget to install it : "sudo npm install -g uglify-js".
- mongdb-tools is necessary for backup and restore db scripts
- php-fpm is necessary to go along with nginx

usefull bonus :
- installing svgo for reducing the size of new svg can be good : "sudo npm install -g svgo"

scripts :
- correct-install.sh is a basic script that checks some of the requirements for Zusam.
- php-check-syntax.sh is a basic script that checks the syntax of all the php files.
- build-css.sh is a script that builds all the css into one file at the root of the zusam project.
- build-js.sh is a script that builds all js modules in the JS folder and add them to the others js files in the JS folder to uglify them.
- backup.sh is a script thats backups all data in a BACKUP directory (as a tarball).
- restore.sh is a script that ERASE all current data and REPLACE it with the specified backup tarball.
- update.sh is a script that should be used after a merge to prepare the code for production.

systemctl :
sudo systemctl start nginx
sudo systemctl start php-fpm
sudo systemctl start mongodb
sudo systemctl start fcron

fcron :
@ 1 php /srv/http/zusam/Fcron/convertNextVideo.php
