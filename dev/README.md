# Dev environment and workflow

Development for Zusam is driven by the Makefile at the repository root. It handles building container images, running the application, linting, compiling the frontend, and running integration tests.

Linux is assumed for the rest of this README.

## Configuration

See [configuration.md](configuration.md) for a detailed explanation of how
configuration variables flow through the Dotenv cascade, the three execution
contexts (FPM, CLI/cron, test), and the full variable reference.

## Makefile targets

Run `make` with no arguments to see available targets.

| Target | Description |
|--------|-------------|
| `make dev` | Build the `zusam-dev` development container image |
| `make prod` | Build the `zusam` production container image |
| `make start-dev` | Build and start a dev container with the repo mounted (for running PHP/JS tooling) |
| `make start-test` | Build and start a production container with local sources mounted (for manual testing) |
| `make compile-webapp` | Install frontend dependencies, build, and copy output to `public/` |
| `make lint` | Run all linters inside a dev container |
| `make fmt` | Run all formatters inside a dev container |
| `make integ-tests` | Build the production image, run integration tests, and tear down containers |

## Container images

There are two container images:

- **`zusam-dev`** (`make dev`): Development image with build tools. Used for linting and compiling the webapp inside a container.
- **`zusam`** (`make prod`): Production image that runs the full Zusam stack (Nginx + PHP-FPM). Used for `start-test` and integration tests.

Both are built from Dockerfiles in `container/dockerfile/` via the C preprocessor (`cpp`).

The Makefile uses `podman` when it is installed and falls back to `docker`. Override it
with `make <target> CONTAINER_PGRM=docker`.

### Rootless podman

`container/run.sh` and `container/dev_run.sh` `chown -R` the mounted sources to `$UID:$GID`
so that files the container writes stay usable on the host. That assumes the developer's
uid is the same inside and outside the container, which holds for rootful docker but not
for rootless podman — there the host user is mapped to container uid 0, and container uid
1000 is an unrelated subuid. Without a correction, `make compile-webapp` cannot read the
mounted repository and `make start-dev` strips the host user of ownership of the whole
working tree.

The Makefile therefore detects rootless podman and adds `--userns=keep-id`, which maps the
host user to the same uid inside the container. Nothing is added for docker. If you ever
do end up with files stranded on a subuid, reclaim them without root:

```bash
podman unshare chown -R 0:0 .   # run from the repository root
```

## Typical workflows

### Developing

```bash
# Start a dev container with the repo mounted
make start-dev
# You are now inside the container and can run composer, npm, etc.
```

### Testing locally

```bash
# Start a production container with local sources mounted
make start-test
# Zusam is available at http://localhost:8080
```

### Compiling the frontend

```bash
# Compile the webapp from a container (no local tooling needed)
make compile-webapp
```

### Linting

```bash
# Run all linters inside a container (no local tooling needed)
make lint
```

### Formatting

```bash
# Run all formatters inside a container (no local tooling needed)
make fmt
```

### Running integration tests

```bash
# From the repo root - builds, runs tests, tears down
make integ-tests
```

See `integration-tests/README.md` for details on the test framework, fixtures, and writing tests.

### Running Playwright tests

```bash
# From the repo root - runs tests in CLI
make playwright
```
You might need to install Playwright dependencies by running this from the `/app` directory:
`npx playwright install --with-deps`

This starts a Zusam docker container with the currently built prod image and then runs the Playwright tests locally against the image. It first runs a default Zusam image, then a second run against an with some of the settings changed via docker environment variables. There are makefile targets to run each separately, and for test development you may want to start the Playwright UI which can be done by adding `-ui` to the command. For example, `make playwright-default-ui`.

If tests are failing, consider setting the number of workers in `/app/playwright.config.ts` to 1 to rule out a performance issue. You can also configure retries if tests are flaky.

### Email testing with Mailpit

The `dev/docker-compose.yml` includes a [Mailpit](https://mailpit.axe.email/) service alongside the Zusam container. To use it:

```bash
cd dev
docker compose up -d
```

This starts Zusam on port 8080 and Mailpit on port 8025.

Zusam reads its settings from `data/config` (see the [configuration
docs](../documentation/docker.md#configuration)). To capture notification emails
in Mailpit, set the following in `data/config` and restart the container:

```ini
ALLOW_EMAIL="true"
MAILER_DSN="smtp://mailpit:1025"
```

Emails are then viewable at `http://localhost:8025`.

## API testing with Posting

The `dev/posting/` directory contains a collection of API requests for [Posting](https://posting.sh), a terminal-based API client. See `dev/posting/README.md` for usage instructions.

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
#### Reactions data files
The optional reactions functionality (disabled by default) loads its localized emoji data straight from the `emoji-picker-react` package at runtime, via dynamic imports of `emoji-picker-react/dist/data/emojis-<lang>`. Each locale is code-split into its own chunk, so only the active language is fetched by the client.

To add support for a new language, add an entry to `langMap` in `app/src/message/message-reactions.component.js`, using a locale file that exists under `app/node_modules/emoji-picker-react/dist/data/`. Updating `emoji-picker-react` automatically picks up new emojis and translation fixes — no files need to be copied into the repo.