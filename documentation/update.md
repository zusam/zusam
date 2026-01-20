Update
======

This is a general procedure to update Zusam.
Be sure to read the changelog for specifics that may occur.

First, understand that the master branch is considered unstable, and you should not blindly `git pull` from it.
To avoid issues, stay on release tags and update only to the next tag (not to a specific commit).
Generally, updating several major versions at once is not supported. Perform multiple update operations if you are several major versions behind.

You can see the latest release [here](https://github.com/zusam/zusam/releases).

## The update procedure

1. Backup the data directory.
2. Select the next version you want to update to. This version will be referred to as `$version` for the rest of the procedure.
3. Go to your Zusam directory.
4. Run: `curl -Ls https://github.com/zusam/zusam/archive/refs/tags/$version.tar.gz | tar xz --strip 1`
5. Remove Symfony's cache: `rm -rf api/var/cache/`
6. Run database migrations: `php bin/console doctrine:migration:migrate`
7. Apply the latest Composer changes: `php bin/composer install`
8. Copy the web app to the public directory: `cp app/dist/* public/`

## If you are using a container

1. Backup the data directory.
2. Follow the installation instructions as you would for a new installation.

The container will run the database migrations automatically at startup.
