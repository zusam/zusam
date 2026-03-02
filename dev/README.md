# Dev environment and workflow

Development for Zusam is driven by the Makefile at the repository root. It handles building container images, running the application, linting, compiling the frontend, and running integration tests.

Linux is assumed for the rest of this README.

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
| `make integ-tests` | Build the production image, run integration tests, and tear down containers |

## Container images

There are two container images:

- **`zusam-dev`** (`make dev`): Development image with build tools. Used for linting and compiling the webapp inside a container.
- **`zusam`** (`make prod`): Production image that runs the full Zusam stack (Nginx + PHP-FPM). Used for `start-test` and integration tests.

Both are built from Dockerfiles in `container/dockerfile/` via the C preprocessor (`cpp`).

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

### Running integration tests

```bash
# From the repo root - builds, runs tests, tears down
make integ-tests
```

See `integration-tests/README.md` for details on the test framework, fixtures, and writing tests.

### Email testing with Mailpit

The `dev/docker-compose.yml` includes a [Mailpit](https://mailpit.axe.email/) service alongside the Zusam container. To use it:

```bash
cd dev
docker compose up -d
```

This starts Zusam on port 8080 and Mailpit on port 8025. Zusam is configured with `MAILER_DSN=smtp://mailpit:1025` and `ALLOW_EMAIL=true`, so notification emails are captured by Mailpit and viewable at `http://localhost:8025`.

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
