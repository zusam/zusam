Update
======

This is a general procedure to update Zusam.  
Be sure to read the changelog for specifics that could occur.

First, understand that the master branch is considered unstable and you should not blindly `git pull` from it.  
To stay away from trouble, stay on release tags and update only to the next tag (and not to a specific commit).  
Generally, updating several major versions at once is not supported. Do multiple update operations if you are several majors behind.

You can see the latest release [here](https://github.com/nrobinaubertin/zusam/releases).  

## The actual procedure

1. Backup the data directory
2. Select the next version you want to update to. It will be called $version for the rest of the procedure.
3. Go to your zusam directory
4. `wget -qO- https://github.com/nrobinaubertin/zusam/archive/$version.tar.gz | tar xz --strip 1`
5. If `api/migration/$version.sql` exists, apply it: `sqlite3 data/data.db < api/migration/$version.sql`
6. Apply latest composer changes: `php bin/compose install`
7. Copy the webapp to the public directory: `cp app/dist/* public/`
8. Rename the lang file (here english, adapt it to the one you want): `cp public/en.js public/lang.js`

## If you are using docker

1. Follow the installation instructions as you would to install it.  
2. If `api/migration/$version.sql` exists, apply it: `sqlite3 data/data.db < api/migration/$version.sql`.  
