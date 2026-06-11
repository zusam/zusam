"""Integration tests for the ``zusam:config:show`` debugging command.

These pin the env-variable handling contract directly (each test runs in about
a second), complementing the slow behavioral guards in
``test_notification_emails.py``:

- ``data/config`` is the sole authority for app configuration; the image must
  not bake app-config variables into the OS environment (the root cause of
  the "emails don't send from cron" bug).
- A real OS env var shadows ``data/config`` (Dotenv never overrides existing
  variables) -- the mechanism that made the bug possible.
- Editing ``data/config`` takes effect on the next invocation, no restart.

No ``fresh_db``: the command never touches the database.
"""

import json

from conftest import configure_data_config, docker_exec

# Variables that operators configure in data/config; none of them may come
# from the OS environment inside the container.
APP_CONFIG_VARS = [
    "ALLOW_EMAIL",
    "ALLOW_IMAGE_UPLOAD",
    "ALLOW_VIDEO_UPLOAD",
    "ALLOW_PUBLIC_LINKS",
    "ALLOW_MESSAGE_REACTIONS",
    "MAILER_DSN",
    "DOMAIN",
    "LANG",
]


def config_show(env: dict[str, str] | None = None) -> dict:
    """Run ``zusam:config:show --format=json`` and return the variables dict."""
    result = docker_exec("/zusam/api/bin/console", "zusam:config:show", "--format=json", env=env)
    assert result.returncode == 0, f"config:show failed: {result.stderr}\n{result.stdout}"
    return json.loads(result.stdout)["variables"]


def test_data_config_is_the_authority(configure_email):
    variables = config_show()

    # Values written to data/config by the configure_email fixture.
    assert variables["ALLOW_EMAIL"]["value"] == "true"
    assert variables["ALLOW_EMAIL"]["source"] == "dotenv"
    assert variables["MAILER_DSN"]["value"] == "smtp://mailpit:1025"

    shadowed = [v for v in APP_CONFIG_VARS if variables[v]["in_os_env"]]
    assert not shadowed, (
        f"App-config variables found in the container OS environment: {shadowed}. "
        "They shadow data/config for CLI/cron processes (Dotenv never overrides "
        "real env vars) -- the root cause of the 'emails don't send from cron' "
        "bug. Check container/dockerfile/env.docker and the compose files."
    )

    # Operational knobs ARE expected in the OS env; this proves the
    # "OS Env?" detection itself works in both directions.
    assert variables["DATABASE_NAME"]["in_os_env"]


def test_os_env_shadows_data_config(configure_email):
    """A real env var must win over data/config (Dotenv precedence)."""
    variables = config_show(env={"ALLOW_EMAIL": "false"})

    assert variables["ALLOW_EMAIL"]["value"] == "false"
    assert variables["ALLOW_EMAIL"]["in_os_env"] is True
    assert variables["ALLOW_EMAIL"]["source"] == "os_env"


def test_data_config_edit_applies_without_restart(configure_email):
    configure_data_config({"ENABLE_TERMINATE_LISTENER": "false"})
    assert config_show()["ENABLE_TERMINATE_LISTENER"]["value"] == "false"

    configure_data_config({"ENABLE_TERMINATE_LISTENER": "true"})
    assert config_show()["ENABLE_TERMINATE_LISTENER"]["value"] == "true"
