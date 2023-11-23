Update
======

This is a general procedure to update Zusam.  
Be sure to read the changelog for specifics that could occur.

First, understand that the master branch is considered unstable and you should not blindly `git pull` from it.  
To stay away from trouble, stay on release tags and update only to the next tag (and not to a specific commit).  
Generally, updating several major versions at once is not supported. Do multiple update operations if you are several majors behind.

You can see the latest release [here](https://github.com/zusam/zusam/releases).  

## The actual procedure

1. Backup the data directory
2. Select the next version you want to update to. It will be called `$version` for the rest of the procedure.
3. Go to your zusam directory
4. `curl -Ls https://github.com/zusam/zusam/archive/refs/tags/$version.tar.gz | tar xz --strip 1`
5. Remove symfony's cache: `rm -rf api/var/cache/`
6. Run database migrations with `php bin/console doctrine:migration:migrate`
7. Run application migrations with `php bin/console zusam:migration`
8. Apply latest composer changes: `php bin/composer install`
9. Copy the webapp to the public directory: `cp app/dist/* public/`

## If you are using docker

1. Follow the installation instructions as you would to install it.
2. Run database migrations with `php bin/console doctrine:migration:migrate`
3. Run application migrations with `php bin/console zusam:migration`

---

If you are writing a script and want to automate the database migration, use the options `--no-interaction` and `--allow-no-migration` so that the command does not fail if there's no migration to execute.
