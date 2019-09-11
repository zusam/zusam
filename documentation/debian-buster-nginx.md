Install on Debian buster
========================

First we're going to install the necessary packages:
```
sudo apt install -y nginx unzip ffmpeg php7.3 php7.3-fpm php7.3-xml php7.3-curl php7.3-mbstring php7.3-sqlite3 php-imagick php7.3-intl
```

Download the latest release (here in `/srv/zusam`):
```
mkdir -p /srv/zusam && cd /srv/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
wget -qO- https://github.com/zusam/zusam/archive/$version.tar.gz | tar xz --strip 1
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

Replace `/etc/nginx/sites-available/default` with the following:
```
server {
    listen 80;
    server_name _;
    port_in_redirect off;
    client_max_body_size 2048M;
    root /srv/zusam/public;
    location / {
        try_files $uri /index.html;
    }
    location ~ \.(js|png|css|woff2)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
    location /files {
        expires 1M;
        try_files $uri =404;
    }
    location /api {
        try_files $uri /api/index.php$is_args$args;
    }
    location ~ ^/api/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php7.3-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi.conf;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root/api;
        internal;
    }
    location ~ \.php$ {
        return 404;
    }
}
```
Reload nginx configuration with `sudo nginx -s reload`.

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

Now we're going to add SSL/TLS certificates using certbot.  
Install the certbot package:
```
sudo apt-get install certbot python-certbot-nginx
```

You'll need to change the `server_name` in `/etc/nginx/sites-available/default` to match your domain name.  
After that, let certbot do its magic:
```
sudo certbot --nginx
```
