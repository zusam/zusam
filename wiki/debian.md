Install on Debian stretch
=========================

First, we'll need to add the sury repository to get up-to-date versions of php:
```
sudo apt install ca-certificates apt-transport-https
wget -q https://packages.sury.org/php/apt.gpg -O- | sudo apt-key add -
echo "deb https://packages.sury.org/php/ stretch main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt update
```

We're going to use php7.3 here but Zusam is compatible with 7.1+
```
sudo apt install -y nginx git unzip ffmpeg \
    php7.3 php7.3-fpm php7.3-xml php7.3-curl php7.3-mbstring \
    php7.3-sqlite3 php7.3-imagick php7.3-gd php7.3-intl php7.3-zip
```

Clone the repository (here in /srv/zusam):
```
git clone https://github.com/nrobinaubertin/zusam.git /srv/zusam
cd /srv/zusam
```

Let's copy the webapp in the public directory (you don't need to do this if you only want the api server running):
```
cp app/dist/* public/
```

Rename the language file of your choice (here it's the english one):
```
mv app/src/assets/lang/en.js public/lang.js
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

Set `upload_max_filesize` to `2048M` in `/etc/php/7.3/php.ini`.
And then restart the service with `sudo systemctl restart php7.3-fpm`.
