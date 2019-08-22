FAQ
===

## Can I send zip and/or generic files to Zusam ?

## How are the photos compressed ?

## How are the videos compressed ?

## How is the preview of a link calculated ?

## How to make a photo album ?

## Making sure that php is correctly set up
Be sure that you have the imagick module for php:
```
php -ini | grep imagick
```
If it's the case, check the following php configurations:
```
grep upload_max_filesize /etc/php7/php.ini
grep post_max_size /etc/php7/php.ini
```
Set them both to `2048M`. If you don't know where your php.ini file is, run:
```
php --ini | grep "Loaded Config"
```
This with show you it's path.
If you install a module or change a configuration, you then need to restart php-fpm:
```
sudo systemctl restart php-fpm
```

## Composer: "Fatal error: Allowed memory size of * bytes exhausted"
https://github.com/composer/composer/issues/4373#issuecomment-394599327
```
php -d memory_limit=-1 bin/composer install
```

## Get the latest version number in the shell
```
curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/nrobinaubertin/zusam/releases/latest | rev | cut -d'/' -f1 | rev
```
