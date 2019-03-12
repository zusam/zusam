<h1 align="center">
    <img src="app/src/assets/zusam_logo.png">
</h1>

<h4 align="center">A truly private space for you and your friends</h4>

## What is Zusam ?
Zusam (/tsuˈzam/) is a free and open-source way to self-host private forums for groups of friends. Composed of a server written in PHP exposing a REST API and a lightweight webapp, Zusam is extensible and easy to install.  
The goals are to make a stable, extensible, lightweight and user-friendly way to self-host private social groups.

<span align="center">
    <img src="readme/screenshot.jpg">
</span>
<em>More screenshots <a href="readme">here</a></em>

## Features
- Links preview and embedded youtube, vimeo, imgur, soundcloud, twitch, bandcamp...
- Video and image upload
- Photo albums
- Completely responsive and mobile friendly
- Low server footprint

## Deployment
Zusam is composed of a PHP server and a single-page-application.
The backend uses [Symfony](https://symfony.com) and [Sqlite](https://sqlite.org/index.html), the frontend is made with [Preact](https://preactjs.com/) and [ParcelJS](https://parceljs.org/).

Requirements:
- PHP 7.1+
- Yarn or NPM (only to compile the webapp)

You can follow the installation guide for [Debian stretch](wiki/debian.md) or use [Docker](wiki/docker.md).

## Webapp compatibility
The webapp targets Firefox 60+, Chrome 67+, Safari 11+.  
It's intentionally high but should work with all versions of Edge and older versions of Chrome and Firefox.

## Contributing
Zusam is free and open-source software licensed under [AGPLv3](https://www.gnu.org/licenses/agpl.html).  
You can open issues for bugs you've found or features you think are missing. You can also submit pull requests to this repository.
