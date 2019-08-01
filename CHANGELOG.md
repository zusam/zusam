# Changelog

To upgrade, follow the [upgrade guide](https://github.com/nrobinaubertin/zusam/blob/master/documentation/update.md).

## [0.3.1] - 2019-08-01

### Log
- Add documentation for debian buster
- Add user list in group-settings
- Allow long format images
- Display share button only if the user has more than 1 group
- Fix avatar change and upscale its resolution
- Fix english translation
- Fix new messages not appearing immediately
- Fix signup during invitation
- Fix title input changing form when inputting a space
- Remove demo instance files
- Update dependencies and dockerfile packages

### Remarks
Mostly bugfix release.

## [0.3] - 2019-07-24

### Log
- Update to symfony 4.3
- Switch security password encoder to 'auto'
- Regenerate message preview on edition
- Add "default group" option
- Add Log and System entities
- Add CleanLogs, CleanGroups, CleanMessages, RepairDatabase commands
- Add message sharing feature
- Rework Cron: will now be called on kernel.terminate event
- Redirect nginx output to stdout
- Return only JSON from the API
- Avoid displaying empty messages
- Simplify commands invocations
- .env is now the default config and .env.local symlinks to data/config

### Remarks
Feature release.  
This update has a database structure change. Please see the corresponding migration file.  

Cron tasks will now execute after each API call. This means that if your Zusam instance is visited sufficiently often, you don't need to call it from the system cron anymore.  
The first time RepairDatabase will be executed, it could take some time (and cause some API calls to timeout). To avoid this, you can execute it yourself during the upgrade (after having applied the SQL migration) with `php api/bin/console zusam:repair-database`.

:warning: The configuration change (.env => .env.local) could impact you if you customized your configuration file paths. Make sure to update the symlink if necessary.  
These changes were made to be compliant with the symfony specifications:
- https://symfony.com/doc/current/best_practices/configuration.html
- https://symfony.com/doc/current/configuration/dot-env-changes.html

## [0.2] - 2019-05-06

### Log
- Add slovak translation
- Add opt-in notification emails
- Fix video loading in albums
- Add public link feature
- Rework news styling
- Fix gif upload
- Declare the webapp as a PWA with a share-intent

### Remarks
Feature release.  
:warning: Support for PHP 7.1 was dropped.  
This update has a database structure change. Please see the corresponding migration file.  

## [0.1.1] - 2019-03-29

### Log
- Fix styling issues in chrome
- Fix s6 lockups in docker
- Fix lightbox on image urls
- Add a writerId to each writer component to avoid edge cases
- Add spanish translation

### Remarks
Mostly bugfix release.

## [0.1] - 2019-03-21
This is the first release of Zusam that is meant to be used broadly.
