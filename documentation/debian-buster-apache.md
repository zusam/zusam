Install on Debian buster with apache
====================================

First, we'll need to add the sury repository to get up-to-date versions of php:
```
sudo apt install ca-certificates apt-transport-https
curl -Ls https://packages.sury.org/php/apt.gpg -o- | sudo apt-key add -
echo "deb https://packages.sury.org/php/ $(lsb_release -s -c) main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt update
```

We're going to use php8.1 here but Zusam is compatible with 8.1+
```
sudo apt install -y apache2 libapache2-mod-php unzip ffmpeg php8.1 php8.1-fpm php8.1-xml php8.1-curl php8.1-mbstring php8.1-sqlite3 php-imagick php8.1-intl
```

Download the latest release (here in `/srv/zusam`):
```
mkdir -p /srv/zusam && cd /srv/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
curl -Ls https://github.com/zusam/zusam/archive/refs/tags/$version.tar.gz | tar xz --strip 1
```

You can also instead download the latest version from the master branch but beware that it might be less tested:
```
mkdir -p /srv/zusam && cd /srv/zusam
curl -Ls https://github.com/zusam/zusam/archive/refs/heads/master.tar.gz | tar xz --strip 1
```

Let's copy the webapp in the public directory (you don't need to do this if you only want the api server running):
```
cp -r app/dist/* public/
```

Install the server dependencies:
```
cd api
php bin/composer install
```

Replace `/etc/apache2/sites-available/000-default.conf` with the following:
```
<VirtualHost *:80>
        Include conf-available/php8.1-fpm.conf

        DocumentRoot /srv/zusam/public
        <Directory /srv/zusam/public>
                AllowOverride All
                Require all granted
                FallbackResource /index.html
        </Directory>
        <Directory /srv/zusam/public/files>
            Header set Content-Security-Policy "default-src 'none'; style-src 'unsafe-inline'; sandbox"

            # Disable script execution
            Options -ExecCGI
            php_admin_flag engine off

            # Try to serve the file, or return 404 if not found
            FallbackResource disabled
            ErrorDocument 404 /404.html
        </Directory>
        <Directory /srv/zusam/public/api>
                FallbackResource /api/index.php
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Set `upload_max_filesize` and `post_max_size` to `2048M` in `/etc/php/8.1/apache2/php.ini`.  
Activate the headers module with: `sudo a2enmod headers`.  
And then restart apache with `sudo systemctl restart apache2`.

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

Now we're going to add SSL/TLS certificates using certbot.  
Install the certbot package:
```
sudo apt-get install certbot python-certbot-apache
```

After that, let certbot do its magic:
```
sudo certbot --apache
```
