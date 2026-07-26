# Configuration variable flow in Zusam

How a config variable travels from its definition to the running application,
and how that differs between execution contexts.

## TL;DR -- where to set things

| What you want to set | Where |
|---|---|
| App defaults (committed) | `api/.env` -- do **not** edit per deployment |
| Per-deployment config | **`data/config`** -- operator edits this file |
| Container operational knobs (`UID`, `GID`, `SUBPATH`, `DATABASE_NAME`) | Docker env vars (`-e` / compose `environment:`) |
| `APP_ENV` | `data/config` (seeded from Docker env on first run) |

`data/config` is the single source of truth for a running instance.
`api/.env.local` is a committed symlink pointing to `../data/config`, so
Symfony's Dotenv sees it automatically.

## Verifying resolution with `zusam:config:show`

To see every variable as a process actually resolves it — including whether a
real OS env var is shadowing `data/config` (the "OS Env?" column):

```
docker exec <container> /zusam/api/bin/console zusam:config:show
```

`--format=json` gives machine-readable output; the integration tests
(`integration-tests/tests/test_config_show.py`) assert against it to pin the
contract described in this document. Secrets (`APP_SECRET`, passwords inside
DSNs) are redacted.

---

## Sources, in precedence order (highest wins)

Symfony's `Dotenv::loadEnv()` (called from `api/config/bootstrap.php:17`)
resolves variables in this order. The first source that sets a variable wins:

| Priority | Source | File / origin |
|:---:|---|---|
| 1 (highest) | **Real OS environment** | Docker `ENV` from `container/dockerfile/env.docker`, plus compose `environment:` / `docker run -e` |
| 2 | `.env.$APP_ENV.local` | e.g. `api/.env.test.local` (not committed) |
| 3 | `.env.$APP_ENV` | e.g. `api/.env.test` (committed) |
| 4 | `.env.local` | Symlink to `data/config`. **Skipped when `APP_ENV=test`** (Symfony's `testEnvs` parameter). |
| 5 (lowest) | `.env` | `api/.env` -- committed defaults |

Key details:

- **OS env always wins.** `Dotenv::loadEnv()` is called with
  `overrideExistingVars=false` (the default), so a variable that already exists
  in the real OS environment is never overridden by any `.env*` file.
- Among the `.env*` files, higher-priority files override lower ones.
- **No `.env.local.php`** is generated (no `composer dump-env`), so `.env*`
  files are re-parsed on every request and CLI invocation. Editing `data/config`
  takes effect immediately -- no restart needed (for PHP-FPM, the next request
  picks it up; for cron, the next invocation).

---

## The three execution contexts

This is the key asymmetry that caused the "emails don't send from cron" bug.

### Web / PHP-FPM

PHP-FPM's `clear_env` defaults to `yes` (FPM's built-in default;
`container/php/php-fpm.conf` does not override it). This **wipes the OS
environment** for FPM worker processes, so config comes purely from the `.env*`
file cascade -- effectively from `data/config` in production.

### CLI / cron

`php bin/console` inherits the **full OS environment** of the calling process.
Any variable present in the OS env shadows the `.env*` files (because
`overrideExistingVars=false`).

In the post-fix design, app-config variables were removed from Docker `ENV`
(`env.docker` now only contains operational knobs), so the OS env no longer
shadows `data/config` for the CLI. The cron job runs via busybox `crond` which
provides a minimal environment; `su-exec` drops privileges but preserves that
minimal env:

```
crond (root, minimal env)
  -> su-exec $UID:$GID php bin/console zusam:cron
       -> Dotenv loads .env cascade -> data/config is the authority
```

### `test` environment

`.env.local` (i.e. `data/config`) is **skipped** for the `test` environment
(Symfony's `testEnvs` parameter in `loadEnv()`). Config comes from:

1. `api/.env` (committed defaults)
2. `api/.env.test` (committed test overrides: in-memory SQLite, disabled
   terminate listener, test `APP_SECRET`)
3. Real OS env (integration tests pass email config via compose `environment:`)

### Flow diagram

```
Definition sources
==================

  env.docker           data/config           api/.env.test          api/.env
  (Docker ENV)         (.env.local)                                 (defaults)
  [UID, GID, ...]      [APP_SECRET, ...]     [test overrides]       [all vars]
       |                    |                      |                     |
       v                    v                      v                     v
+------+--------------------+----------------------+---------------------+-----+
|                     Dotenv cascade (bootstrap.php)                           |
|  Real OS env always wins; .env files loaded in priority order (see above)    |
+------+-----------------------+-----------------------+-----------------------+
       |                       |                       |
  +----v-----+           +-----v------+          +-----v------+
  | Web      |           | CLI/cron   |          | test       |
  | (FPM)    |           |            |          |            |
  | clear_env|           | inherits   |          | .env.local |
  | = yes    |           | OS env     |          | skipped    |
  +----+-----+           +-----+------+          +-----+------+
       |                       |                       |
       +----------+------------+-----------+-----------+
                  |                        |
                  v                        v
        %env(resolve:...)%           package config
        parameters                   (doctrine, mailer, ...)
        (services.yaml)              (packages/*.yaml)
                  |                        |
                  +----------+-------------+
                             |
                             v
                        Services
              (Mailer, Cron, Url, ...)
```

---

## Container plumbing (how `data/config` is born)

### `container/dockerfile/env.docker`

Sets only operational `ENV` variables that the container infrastructure needs:

```dockerfile
ENV DATABASE_NAME=data.db
ENV GID=1000
ENV PATH="$PATH:/zusam/api/bin"
ENV SUBPATH=
ENV UID=1000
```

No app-config variables here. This is intentional -- see [Rationale](#rationale--gotchas).

### `container/run.sh` (entrypoint)

On first run:

1. Installs the crontab (runs every minute as the app user via `su-exec`).
2. Builds `DATABASE_URL` from `DATABASE_NAME`.
3. If `/zusam/config` exists (the template), substitutes `<SECRET>` (random),
   `<DATABASE_URL>`, and `<APP_ENV>` (from env, default `prod`).
4. If `data/config` does not exist yet, copies the rendered template there.
5. Creates the `api/.env.local -> ../data/config` symlink (committed in the
   repo, but verified at runtime).
6. Runs `composer install`, DB init or migrations, SUBPATH setup, ownership
   fixup, then starts s6.

### `container/config` (the template)

Contains placeholder tokens (`<SECRET>`, `<DATABASE_URL>`, `<APP_ENV>`) and
sensible defaults for a fresh instance. Operators customize `data/config` after
first run.

### `api/.env.local` symlink

```
api/.env.local -> ../data/config
```

This symlink is committed in the repo. Symfony's Dotenv loads `.env.local`
automatically as part of the cascade.

### Cron job environment

```
crontab: * * * * * /sbin/su-exec $UID:$GID php bin/console zusam:cron
```

- `crond` runs as root (busybox crond, managed by s6 via
  `container/s6.d/cron/run`).
- The cron job gets a minimal cron environment (no Docker `ENV` vars).
- `su-exec` drops to the app user (`$UID:$GID`).
- The PHP process loads `data/config` via the `.env*` cascade.

Because the cron env is minimal, **`APP_ENV` must be in `data/config`**, not
just a Docker env var. FPM also needs it there (because of `clear_env`). The
template seeds it on first run from the Docker `APP_ENV` env var.

---

## How the app consumes config

### `api/config/services.yaml`

The `parameters:` block maps env vars to Symfony parameters using
`%env(resolve:...)%`. The `resolve:` processor expands `%placeholder%` tokens
within values (e.g. `MAILER_FROM="noreply@%domain%"` resolves `%domain%` to the
`domain` parameter).

Services receive these parameters via autowiring/explicit injection. Key
consumers:

- `App\Service\Mailer` -- `DOMAIN`, `LANG`, `ALLOW_EMAIL`
- `App\Command\Cron` -- all `cron.*` interval parameters
- `App\Service\Url` -- `PROTOCOL`, `DOMAIN`, `PORT`
- `App\Command\ConvertVideo` -- `DATABASE_URL`, `dir_files`, `FFMPEG_PATH`
- `App\EventListener\TerminateListener` -- `ENABLE_TERMINATE_LISTENER` via
  `%env(bool:...)%`

### Package configs (`api/config/packages/*.yaml`)

| Package file | Variables consumed |
|---|---|
| `doctrine.yaml` | `DATABASE_URL`, `DATABASE_DRIVER`, `DATABASE_SERVER_VERSION`, `DATABASE_CHARSET` |
| `framework.yaml` | `APP_SECRET` |
| `mailer.yaml` | `MAILER_DSN`, `MAILER_FROM` (via `resolve:`) |
| `nelmio_api_doc.yaml` | `VERSION` (via `resolve:`) |
| `lock.yaml` | `LOCK_DSN` |
| `nelmio_cors.yaml` | (uses hardcoded defaults, not env-driven) |

Note: `nelmio_cors.yaml` does not reference `CORS_ALLOW_ORIGIN` from env; the
`CORS_ALLOW_ORIGIN` variable in `api/.env` is consumed by Symfony's built-in
CORS handling via `$_SERVER`.

### `public/api/index.php`

Reads directly from `$_SERVER` / `$_ENV` (not from Symfony parameters):

- `APP_ENV`, `APP_DEBUG` -- kernel instantiation
- `TRUSTED_PROXIES` -- `Request::setTrustedProxies()`
- `TRUSTED_HOSTS` -- `Request::setTrustedHosts()`

---

## Full variable reference

### App / features

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `VERSION` | `"0.6.1"` | No | No | `services.yaml` param, `nelmio_api_doc.yaml` | API version |
| `ALLOW_BOTS` | `"false"` | No | No | `services.yaml` param | |
| `ALLOW_IMAGE_UPLOAD` | `"true"` | Yes | No | `services.yaml` param | |
| `ALLOW_VIDEO_UPLOAD` | `"true"` | Yes | No | `services.yaml` param | |
| `ALLOW_PDF_UPLOAD` | `"true"` | No | No | `services.yaml` param | |
| `ALLOW_AUDIO_UPLOAD` | `"false"` | No | No | `services.yaml` param | Backend not ready |
| `ALLOW_PUBLIC_LINKS` | `"true"` | Yes | No | `services.yaml` param | |
| `ALLOW_CREATE_GROUP` | `"true"` | No | No | `services.yaml` param | |
| `ALLOW_MESSAGE_REACTIONS` | `"false"` | Yes | No | `services.yaml` param | |
| `SHOW_GROUP_INVITATION_LINKS` | `"true"` | No | No | `services.yaml` param | |
| `DEFAULT_PAGE` | `"default_group"` | No | No | `services.yaml` param | `"default_group"` or `"feed"` |
| `DEFAULT_NOTIFICATIONS` | `"immediately"` | No | No | `services.yaml` param | `none`, `immediately`, `hourly`, `daily`, `weekly`, `monthly` |

### Email

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `ALLOW_EMAIL` | `"false"` | Yes | No | `services.yaml` param -> `Mailer` | |
| `MAILER_FROM` | `"noreply@%domain%"` | No | No | `mailer.yaml`, `services.yaml` param | `%domain%` resolved via `resolve:` |
| `MAILER_DSN` | `null://localhost` | Yes | No | `mailer.yaml` | Symfony mailer transport DSN |

### Media / cron

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `CRON_CONVERT_IMAGES` | `"60"` | No | No | `services.yaml` param | Seconds |
| `CRON_CONVERT_VIDEO` | `"3600"` | No | No | `services.yaml` param | Seconds |
| `NOTIFICATION_EMAILS_THROTTLING` | `"0"` | No | No | `services.yaml` param | 0 = no throttle |
| `CRON_COMPRESS_GIFS` | `"3600"` | No | No | `services.yaml` param | Seconds |
| `CRON_BOT_ACTIVATE` | `"3600"` | No | No | `services.yaml` param | Seconds |
| `CRON_CLEAN_CACHE` | `"86400"` | No | No | `services.yaml` param | Seconds |
| `CRON_CLEAN_NOTIFICATIONS` | `"604800"` | No | No | `services.yaml` param | Seconds |
| `CRON_CLEAN_FILES` | `"604800"` | No | No | `services.yaml` param | Seconds |
| `CRON_CLEAN_MESSAGES` | `"604800"` | No | No | `services.yaml` param | Seconds |
| `CRON_CLEAN_GROUPS` | `"2592000"` | No | No | `services.yaml` param | Seconds |
| `IDLE_HOURS` | `"01-07"` | No | No | `services.yaml` param | Hours for heavy ops |
| `VIDEO_CONVERSION_THREADS` | `"1"` | No | No | `services.yaml` param | 0 = ffmpeg decides |
| `VIDEO_FORMAT_NOT_CONVERTED` | `"video/mp4"` | No | No | `services.yaml` param | Comma-separated MIME types |
| `VIDEO_SIZE_NOT_CONVERTED` | `"10"` | No | No | `services.yaml` param | MB |
| `MAX_TASK_LOCK_DURATION` | `"14400"` | No | No | `services.yaml` param | Seconds; stale lock timeout |
| `ENABLE_TERMINATE_LISTENER` | `"true"` | No | No | `services.yaml` (`bool:`) -> `TerminateListener` | Runs cron tasks on `kernel.terminate` |

### Paths / binaries

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `FFMPEG_PATH` | `"/usr/bin/ffmpeg"` | Yes | No | `services.yaml` param | |
| `GHOSTSCRIPT_PATH` | `"/usr/bin/gs"` | No | No | `services.yaml` param | |
| `FFPROBE_PATH` | -- | Yes | No | **None** | In template only; not wired through `services.yaml` or packages. Appears vestigial -- possible cleanup target. |
| `dir_files` | `"%kernel.project_dir%/../data/files"` | Yes | No | `services.yaml` param | |
| `dir_cache` | `"%kernel.project_dir%/../data/cache"` | Yes | No | `services.yaml` param | |
| `dir_bots` | `"%kernel.project_dir%/../data/bots"` | No | No | `services.yaml` param | |

### Framework / Symfony

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `APP_ENV` | `"prod"` | Yes | No | `bootstrap.php`, `index.php` | Must be in `data/config` (see gotchas) |
| `APP_SECRET` | `"thisisaplaceholdersecret"` | Yes | No | `framework.yaml` | Replaced with random value on first run |
| `APP_DEBUG` | *(derived)* | No | No | `bootstrap.php`, `index.php` | Defaults to `true` when `APP_ENV != prod` |
| `DATABASE_URL` | `"sqlite:///...data/data.db"` | Yes | No | `doctrine.yaml`, `services.yaml` param | |
| `DATABASE_DRIVER` | `"pdo_sqlite"` | No | No | `doctrine.yaml` (fallback parameter) | |
| `DATABASE_SERVER_VERSION` | `"3.21"` | No | No | `doctrine.yaml` (fallback parameter) | |
| `DATABASE_CHARSET` | `"utf8"` | No | No | `doctrine.yaml` (fallback parameter) | |
| `LOCK_DSN` | `flock` | No | No | `lock.yaml` | |
| `CORS_ALLOW_ORIGIN` | `'^https?://...'` | Yes | No | Symfony CORS handling (`$_SERVER`) | |
| `TRUSTED_PROXIES` | *(unset)* | No | No | `index.php` directly | Comma-separated IPs |
| `TRUSTED_HOSTS` | *(unset)* | No | No | `index.php` directly | Regex pattern |

### URL

| Variable | Default (`api/.env`) | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `PROTOCOL` | `"http"` | No | No | `services.yaml` param -> `Url` | |
| `DOMAIN` | `"localhost"` | Yes | No | `services.yaml` param -> `Url`, `Mailer`; used by `MAILER_FROM` via `resolve:` | |
| `PORT` | `""` | No | No | `services.yaml` param -> `Url` | |
| `LANG` | `"en_US"` | Yes | No | `services.yaml` param -> `Mailer` | |

### Container / operational

| Variable | Default | In `data/config` template? | In `env.docker`? | Consumer | Notes |
|---|---|:---:|:---:|---|---|
| `UID` | `1000` | No | Yes | `run.sh`, crontab, `chown` | File ownership |
| `GID` | `1000` | No | Yes | `run.sh`, crontab, `chown` | File ownership |
| `DATABASE_NAME` | `data.db` | No | Yes | `run.sh` (builds `DATABASE_URL`) | Filename only |
| `SUBPATH` | *(empty)* | No | Yes | `run.sh` (nginx config, HTML rewrite) | e.g. `/zusam` |
| `PATH` | appended | No | Yes | Shell | Adds `/zusam/api/bin` |
| `INIT_USER` | `zusam` | No | No | `run.sh` -> `zusam:init` | First-run only |
| `INIT_GROUP` | `zusam` | No | No | `run.sh` -> `zusam:init` | First-run only |
| `INIT_PASSWORD` | `zusam` | No | No | `run.sh` -> `zusam:init` | First-run only |

---

## Rationale and gotchas

### Why app config moved out of Docker `ENV` into `data/config`

PHP-FPM's `clear_env=yes` (the default) wipes the OS environment for web
workers, so FPM always read config from `.env*` files. But CLI processes (like
`php bin/console zusam:cron`) inherit the full OS environment. Symfony's
`Dotenv::loadEnv()` uses `overrideExistingVars=false`, meaning **a variable
present in the real OS env is never overridden by any `.env*` file**.

When app-config variables (like `ALLOW_EMAIL`, `MAILER_DSN`) were set as Docker
`ENV`:

- **FPM** (web): `clear_env` wiped them, so FPM read `data/config` -- correct.
- **CLI/cron**: inherited them from the OS env, which shadowed `data/config` --
  the operator's edits to `data/config` were silently ignored.

This was the root cause of the "emails don't send from cron" bug: the operator
set `ALLOW_EMAIL="true"` and `MAILER_DSN` in `data/config`, but the cron
process saw the Docker `ENV` defaults (`ALLOW_EMAIL="false"`,
`MAILER_DSN="null://localhost"`) and used those instead.

The fix: remove app-config variables from `env.docker`, leaving only
operational knobs (`UID`, `GID`, `SUBPATH`, `DATABASE_NAME`). Now both FPM and
CLI read app config from `data/config` exclusively.

### `APP_ENV` must live in `data/config`

FPM cannot see the OS-env value of `APP_ENV` (because of `clear_env`). The
cron environment is also minimal. So `APP_ENV` must be set in `data/config`.
The template seeds it from the Docker `APP_ENV` env var on first run
(`run.sh` substitutes `<APP_ENV>` with `${APP_ENV:-prod}`).

### `test` env ignores `data/config`

Symfony skips `.env.local` when `APP_ENV=test` (the `testEnvs` parameter). Do
not rely on `data/config` in integration tests. Pass test-specific config via
`api/.env.test` (committed) or compose `environment:` (for secrets like SMTP
credentials).

### Real OS env always wins

If an operator sets `-e ALLOW_EMAIL=true` on the Docker container, that value
enters the real OS env and will be seen by CLI processes, shadowing whatever is
in `data/config`. This re-introduces the FPM-vs-CLI asymmetry for that variable
(FPM won't see it, CLI will). Always configure app settings via `data/config`,
not Docker env vars.

### `FFPROBE_PATH` is vestigial

`FFPROBE_PATH` appears in `container/config` but is not referenced in
`services.yaml`, any package config, or application code. It has no effect.
Flagged as a possible cleanup target (not addressed in this change).
