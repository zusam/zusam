# Dev environment and workflow

I'll try to describe my proposal of a dev environment for Zusam and the tools
provided in this repository to help you with it.

I'll assume that you are working on linux for the rest of this README.

## Working with containers

I find working with containers the best way to
develop without messing my system too much.  
You can find two scripts here to help you in that regard.  

The first one, `start-dev-container` will create a container
and shell you into it so that you can launch PHP's and JS's related utilities.  
I try to use standard tools as much as possible. On the PHP side,
I rely on composer to install packages and run scripts while on the JS side, it's npm.

My usual workflow for the frontend is first
to install packages with `npm install --save-dev`.  
Then I compile the webapp and copy the resulting files to the public directory with
`npm run build; rm -r ../public/*.{js,css,map,png}; cp -r dist/* ../public/`.  
When I want to statically analyze the code, I run `npm run analyze`.

The second script will launch an instance of Zusam by using the files
in the repository (so that you can change things without rebuilding it).  
I use the script `start-test-container` for that.

## Dependencies update

### API

```
cd api/
php bin/composer outdated # check outdated packages
php bin/composer update # update packages according to composer.json
```

### APP

```
cd app/
npm outdated # check outdated packages
npm update # update packages according to package.json
```
