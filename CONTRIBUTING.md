# Contributing to Zusam

Thank you for considering contributing to Zusam! There are many ways that you can help, some of which are outlined below.

<!-- TOC -->
* [Contributing to Zusam](#contributing-to-zusam)
  * [Report bugs and issues or request features](#report-bugs-and-issues-or-request-features)
  * [Translate Zusam](#translate-zusam)
  * [Contributing code](#contributing-code)
    * [Pull requests](#pull-requests)
    * [Setting up dev environment](#setting-up-dev-environment)
<!-- TOC -->

## Report bugs and issues or request features

If you find a problem with Zusam, or if you think of a valuable feature you would like implemented, open a new issue on GitHub and describe it for us.

If you find a security vulnerability, do NOT open an issue. Please instead use the [GitHub security disclosure](https://github.com/zusam/zusam/security) functionality. Also see [SECURITY.md](./SECURITY.md).

## Translate Zusam

You can help translate Zusam into your language by using [Weblate](https://hosted.weblate.org/projects/zusam/core/). You can log in using your GitHub account or register for a new Weblate account.

## Contributing code

Please note this project is [AGPLv3 licenced](https://www.gnu.org/licenses/agpl.html), and all contributions are under the same licence. Please ensure all work is your own.

If you're new to contributing, see [this tutorial](https://github.com/firstcontributions/first-contributions) on contributing to projects on GitHub.

Check out the [Issues](https://github.com/zusam/zusam/issues) for things that need attention.

### Pull requests

Please target any pull requests to the `next` branch. This branch will be copied to `master` with each release.

### Setting up dev environment

Start by cloning the repo. Go to the folder you want to put it inside then:

`git clone https://github.com/zusam/zusam.git`

Go into the zusam directory and build the dev version:

`cd zusam && dev/start-dev-container`

You might get an error that it can't find the container that it just built. This is often related to a podman installation. To get around this, run the make command specifically targeting docker before running the start-dev-container script:

`make dev container_pgrm=docker`

You'll now be inside the container, in the zusam directory. `cd app` to get to the front end app directory, then run `npm install --save-dev` to install the npm packages.

Next, compile the webapp and copy to the public directory with:
`npm run build; rm -r ../public/*.{js,css,map,png}; cp -r dist/* ../public/`

Now install the composer dependencies by running:
`cd /zusam/api && php bin/composer install`

Now exit the container with ctrl + D and then run the container using repo files using:
`dev/start-test-container`

You should now be able to access Zusam on http://localhost:8080

Any code updates you make should be reflected immediately in this running instance.