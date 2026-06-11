"""Integration tests for notification emails.

All tests run against the single ``zusam-integration-tests`` container
(``APP_ENV=prod``, email configured via ``data/config`` only -- just like a
real deployment).  The conftest ``configure_email`` session fixture sets
``ALLOW_EMAIL=true`` and ``MAILER_DSN=smtp://mailpit:1025`` in ``data/config``
before any test runs.

Three tests cover the three ways ``zusam:notification:emails`` can run:

1. ``test_notification_email_via_console_command`` -- the command itself, run
   by hand.  Fast smoke test isolating the command from any cron machinery.
2. ``test_notification_email_delivered_by_system_cron`` -- the in-container
   crond.  Regression guard for the "emails don't send from cron" bug.
3. ``test_notification_email_delivered_by_webcron`` -- the kernel.terminate
   listener triggered by a plain GET request.

Each test follows the same shape: create a user that wants immediate
notification emails, post a message that notifies them, then assert the email
reaches Mailpit through the path under test.
"""

import time
from collections.abc import Callable

import httpxyz
import pytest

from conftest import (
    MAILPIT_API_URL,
    SEEDED_GROUP_ID,
    configure_data_config,
    docker_exec,
    run_console,
    tail_log,
)

# Real crond fires at the top of each minute; allow margin for the cron
# command's other tasks plus Mailpit ingestion.
CRON_DELIVERY_TIMEOUT = 150

# The webcron delivers synchronously on the request; it just needs to beat
# the (up-to-60s-away) crond tick to prove the terminate listener did it.
WEBCRON_DELIVERY_TIMEOUT = 25


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def mailpit_clear() -> None:
    """Delete all messages held by Mailpit."""
    httpxyz.delete(f"{MAILPIT_API_URL}/api/v1/messages", timeout=5).raise_for_status()


def mailpit_to(recipient: str) -> list:
    """Return the Mailpit messages addressed to *recipient*."""
    r = httpxyz.get(f"{MAILPIT_API_URL}/api/v1/messages", timeout=5)
    r.raise_for_status()
    return [m for m in r.json().get("messages", []) if recipient in str(m.get("To", []))]


def create_notified_user(
    client: httpxyz.Client, auth_client: httpxyz.Client, recipient: str
) -> str:
    """Sign up *recipient* in the seeded group and opt them into immediate
    notification emails.  Returns the new user's id."""
    invite_key = auth_client.get(f"/api/groups/{SEEDED_GROUP_ID}").json()["inviteKey"]
    signup = client.post(
        "/api/signup",
        json={"login": recipient, "password": "testpassword", "invite_key": invite_key},
    )
    assert signup.status_code == 200, f"Signup failed: {signup.text}"
    headers = {"X-AUTH-TOKEN": signup.json()["api_key"]}
    user_id = client.get("/api/me", headers=headers).json()["id"]
    upd = client.put(
        f"/api/users/{user_id}",
        headers=headers,
        json={"data": {"mail": recipient, "notification_emails": "immediately"}},
    )
    assert upd.status_code == 200, f"Failed to set notification pref: {upd.text}"
    return user_id


def arm_pending_notification(auth_client: httpxyz.Client, user_id: str) -> None:
    """Create a notification for *user_id* and make it due for emailing.

    NotificationEmails only emails notifications created strictly after the
    user's lastNotificationEmailCheck, and skips users whose checkpoint is
    empty.  Writing a tiny checkpoint directly to the database makes the next
    run deliver deterministically, without the run-command-twice-and-sleep
    dance that initializing the checkpoint through the app would require.
    """
    mailpit_clear()
    r = auth_client.post(
        "/api/messages", json={"group": SEEDED_GROUP_ID, "data": {"text": "Email me."}}
    )
    assert r.status_code == 201, f"Message creation failed: {r.text}"
    upd = docker_exec(
        "su-exec",
        "1000:1000",
        "php",
        "-r",
        '$p = new PDO("sqlite:/zusam/data/data.db");'
        '$s = $p->prepare("UPDATE user SET last_notification_email_check = 1 WHERE id = :id");'
        f'$s->execute([":id" => "{user_id}"]);',
    )
    assert upd.returncode == 0, f"Failed to arm email checkpoint: {upd.stderr}"


def wait_for_email(
    recipient: str, timeout: float, poke: Callable[[], object] | None = None
) -> list:
    """Poll Mailpit until an email for *recipient* arrives or *timeout* passes.

    *poke*, if given, is called on every iteration (e.g. a GET request that
    triggers the webcron).
    """
    deadline = time.time() + timeout
    while True:
        if poke is not None:
            poke()
        found = mailpit_to(recipient)
        if found or time.time() >= deadline:
            return found
        time.sleep(2 if poke else 5)


@pytest.fixture
def disabled_terminate_listener():
    """Turn the webcron off so only the system cron can deliver, restoring it
    afterwards even if the test fails."""
    configure_data_config({"ENABLE_TERMINATE_LISTENER": "false"})
    yield
    configure_data_config({"ENABLE_TERMINATE_LISTENER": "true"})


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_notification_email_via_console_command(client, auth_client):
    """Running zusam:notification:emails by hand must deliver the email."""
    recipient = "console@example.com"
    user_id = create_notified_user(client, auth_client, recipient)
    arm_pending_notification(auth_client, user_id)

    result = run_console("zusam:notification:emails", "--log-send")
    assert result.returncode == 0, f"Command failed: {result.stderr}"

    found = wait_for_email(recipient, timeout=10)
    assert found, (
        f"No email reached {recipient} after running the command.\nRecent log:\n{tail_log()}"
    )


def test_notification_email_delivered_by_system_cron(
    disabled_terminate_listener, client, auth_client
):
    """The in-container crond must deliver email configured only in data/config.

    Regression guard for the "emails don't send from cron" bug: the image used
    to bake ALLOW_EMAIL=false into ENV, which shadowed data/config for CLI/cron
    processes (Dotenv never overrides real env vars), so the cron command
    silently skipped sending.  The terminate listener is disabled here so the
    system cron is the only path that can deliver.
    """
    recipient = "syscron@example.com"
    user_id = create_notified_user(client, auth_client, recipient)
    arm_pending_notification(auth_client, user_id)

    found = wait_for_email(recipient, CRON_DELIVERY_TIMEOUT)
    assert found, (
        f"No email reached {recipient} within {CRON_DELIVERY_TIMEOUT}s of the "
        "system cron running. Email is enabled in data/config and the terminate "
        "listener is disabled, so the system cron is not honouring data/config -- "
        "the regression this test guards against.\n"
        f"Recent log:\n{tail_log()}"
    )


def test_notification_email_delivered_by_webcron(client, auth_client):
    """A plain GET request (kernel.terminate webcron) must deliver the email."""
    recipient = "webcron@example.com"
    # Explicit rather than relying on the session default, so this test stays
    # independent of execution order.
    configure_data_config({"ENABLE_TERMINATE_LISTENER": "true"})
    user_id = create_notified_user(client, auth_client, recipient)
    arm_pending_notification(auth_client, user_id)

    # Each GET triggers the terminate listener, which runs the cron tasks
    # synchronously after the response -- well before the next crond tick.
    found = wait_for_email(
        recipient, WEBCRON_DELIVERY_TIMEOUT, poke=lambda: auth_client.get("/api/me")
    )
    assert found, (
        f"No email reached {recipient} within {WEBCRON_DELIVERY_TIMEOUT}s of web "
        "requests. The webcron (kernel.terminate) path is not delivering email "
        "configured in data/config.\n"
        f"Recent log:\n{tail_log()}"
    )
