Zusam

Zusam is intended to work on a archlinux system along with mongodb and apache.
You can use the server-install repo to create a clean environnement for Zusam.

requirements :
- the repo should be place in the /srv/http folder which should be the root of the apache server.
- it needs : php-mycrypt, php-imagick, php-mongodb to be installed and activated in the php.ini file.
- ffmpeg is important part of Zusam and should be installed (in /usr/bin).
- the owner of the non-data files should be user:http where user is a non root user created to push new code on the server.
- if not specified, all directories should be 775 and php code should be 770.

test-install.sh is a basic script that checks some of the requirements for Zusam.
