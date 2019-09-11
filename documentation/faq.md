FAQ
===

## Can I send zip and/or generic files to Zusam ?
Zusam is meant to share files that can be played/viewed through the browser. It also tries to compress them if possible.  
If you want to send generic files and/or keep them intact while sharing them, Zusam is not the right tool.

## How are the photos compressed ?
Photos are reduced to a maximum of 2048x2048 pixels.

## How are the videos compressed ?
TODO

## How is the preview of a link calculated ?
TODO

## How to make a photo album ?
A photo album is just a different view of the files that is triggered when you add more than 3 files to a message.

## Composer: "Fatal error: Allowed memory size of * bytes exhausted"
This can happen when php is limiting its memory usage. See [this github issue](https://github.com/composer/composer/issues/4373#issuecomment-394599327) for more informations.  
You can bypass this limit by using the `-d memory_limit=-1` option:
```
php -d memory_limit=-1 bin/composer install
```

## Get the latest version number in the shell
To get the latest release version of Zusam:
```
curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev
```

## Is there a shortcut to share a page to Zusam ?
You can share the current webpage that you're browsing by using a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) with the following code:
```
javascript:(()=>{open('<ZUSAM>/share?text='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title));})();
```
(replace <ZUSAM> with the url to your Zusam instance).
