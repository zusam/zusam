Install on Debian buster with apache
====================================

First we're going to install the necessary packages:
```
sudo apt install -y apache2 libapache2-mod-php unzip ffmpeg php7.3 php7.3-fpm php7.3-xml php7.3-curl php7.3-mbstring php7.3-sqlite3 php-imagick php7.3-intl
```

Download the latest release (here in `/srv/zusam`):
```
mkdir -p /srv/zusam && cd /srv/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/nrobinaubertin/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
wget -qO- https://github.com/nrobinaubertin/zusam/archive/$version.tar.gz | tar xz --strip 1
```

Let's copy the webapp in the public directory (you don't need to do this if you only want the api server running):
```
cp app/dist/* public/
```

Rename the language file of your choice (here it's the english one):
```
cp public/en.js public/lang.js
```

Install the server dependencies:
```
cd api
php bin/composer install
```

Replace `/etc/apache2/sites-available/000-default.conf` with the following:
```
<VirtualHost *:80>
        Include conf-available/php7.3-fpm.conf

        DocumentRoot /srv/zusam/public
        <Directory /srv/zusam/public>
                AllowOverride All
                Require all granted
                FallbackResource /index.html
        </Directory>
        <Directory /srv/zusam/public/api>
                FallbackResource /api/index.php
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Restart apache with `sudo systemctl restart apache2`.

Set `upload_max_filesize` and `post_max_size` to `2048M` in `/etc/php/7.3/fpm/php.ini`.  
And then restart the service with `sudo systemctl restart php7.3-fpm`.

Initialiaze the database (replace values with yours):
```
php /srv/zusam/api/bin/console zusam:init usermail@example.com my_group_name my_password
```

Make sure that Zusam's files are readable by php-fpm:
```
chown -R www-data: /srv/zusam
```

Zusam needs to do stuff regularly (cleaning up files, converting videos...).  
It will execute those recurrent tasks on each API request but if your instance is not visited often enough, you can add its worker to your cron:
```
echo "* * * * * /srv/zusam/api/bin/console zusam:cron >> /srv/zusam/api/var/log/cron.log" | sudo crontab -
```

Install the certbot package:
```
sudo apt-get install certbot python-certbot-apache
```

After that, let certbot do its magic:
```
sudo certbot --apache
```
