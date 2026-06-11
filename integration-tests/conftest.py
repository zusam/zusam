"""Pytest fixtures and helpers for Zusam integration tests."""

import hashlib
import subprocess
import time
from pathlib import Path

import httpxyz
import pytest

# Test configuration
API_BASE_URL = "http://localhost:8080"
MAILPIT_API_URL = "http://localhost:8025"
CONTAINER_NAME = "zusam-integration-tests"
TEST_SEED = "test_seed"
DEFAULT_USER = "zusam"
DEFAULT_PASSWORD = "zusam"
LOG_FILE_PATH = "/zusam/api/var/log/prod.log"


def _generate_seeded_uuid(seed: str) -> str:
    """
    Generate a deterministic UUID v4 using the same algorithm as Zusam's Uuid::uuidv4.

    This mirrors the PHP implementation in api/src/Service/Uuid.php
    """
    h = hashlib.sha512(seed.encode()).hexdigest()
    # Extract digits from first 10 chars of hash
    digits = "".join(c for c in h[:10] if c.isdigit())
    num = int(digits) if digits else 0
    variant = ["8", "9", "a", "b"][num % 4]

    return "-".join(
        [
            h[0:8],
            h[8:12],
            "4" + h[12:15],
            variant + h[15:18],
            h[18:30],
        ]
    )


# Pre-computed deterministic IDs for test_seed
SEEDED_USER_ID = _generate_seeded_uuid(f"{TEST_SEED}_user")
SEEDED_USER_SECRET_KEY = _generate_seeded_uuid(f"{TEST_SEED}_user_secret_key")
SEEDED_GROUP_ID = _generate_seeded_uuid(f"{TEST_SEED}_group")
SEEDED_GROUP_SECRET_KEY = _generate_seeded_uuid(f"{TEST_SEED}_group_secret_key")


def docker_exec(*args: str, env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
    """Run a command inside the zusam container (as root).

    *env* adds environment variables to the executed process, simulating an
    operator setting them on the container.
    """
    env_flags = [flag for key, value in (env or {}).items() for flag in ("-e", f"{key}={value}")]
    return subprocess.run(
        ["docker", "exec", *env_flags, CONTAINER_NAME, *args],
        capture_output=True,
        text=True,
    )


def run_console(*args: str) -> subprocess.CompletedProcess:
    """Run a Symfony console command inside the zusam container."""
    return docker_exec("/zusam/api/bin/console", *args)


def tail_log(lines: int = 40) -> str:
    """Return the last lines of the application log inside the container."""
    return docker_exec("tail", "-n", str(lines), LOG_FILE_PATH).stdout


def configure_data_config(settings: dict[str, str]) -> None:
    """Set key=value pairs in /zusam/data/config inside the container.

    Any existing line for the key is removed, then the new value is appended,
    so this works whether or not the key is already present.
    """
    script = " && ".join(
        f"sed -i '/^{key}=/d' /zusam/data/config"
        f" && printf '{key}=\"{value}\"\\n' >> /zusam/data/config"
        for key, value in settings.items()
    )
    result = docker_exec("sh", "-c", script)
    assert result.returncode == 0, (
        f"Failed to configure data/config: {result.stderr}\n{result.stdout}"
    )


@pytest.fixture(scope="session")
def api_url() -> str:
    """Return the base API URL."""
    return API_BASE_URL


@pytest.fixture(scope="session")
def api_ready(api_url: str) -> None:
    """Wait for the API to be responsive before running tests."""
    max_attempts = 60
    delay = 2

    for attempt in range(max_attempts):
        try:
            response = httpxyz.get(f"{api_url}/api/info", timeout=5)
            if response.status_code == 200:
                return
        except httpxyz.RequestError:
            pass

        if attempt < max_attempts - 1:
            time.sleep(delay)

    pytest.fail(f"API at {api_url} did not become ready after {max_attempts * delay} seconds")


@pytest.fixture(scope="session")
def configure_email(api_ready) -> None:
    """Configure email delivery in data/config (once per session).

    The container runs in prod mode with no email-related env vars; everything
    is configured in data/config, just like a real deployment.
    """
    configure_data_config(
        {
            "ALLOW_EMAIL": "true",
            "MAILER_DSN": "smtp://mailpit:1025",
            "ENABLE_TERMINATE_LISTENER": "true",
        }
    )


@pytest.fixture
def fresh_db(configure_email) -> None:
    """
    Reset the database before each test using the seeded initialization.

    This runs `zusam:init --remove-existing --seed test_seed` in the container,
    ensuring each test starts with a clean, predictable database state.

    Retries up to 3 times because the in-container crond may access the
    database file during the drop/recreate window, causing transient I/O errors.
    """
    last_result = None
    for _ in range(3):
        result = run_console(
            "zusam:init",
            DEFAULT_USER,
            DEFAULT_USER,
            DEFAULT_PASSWORD,
            "--remove-existing",
            "--seed",
            TEST_SEED,
        )
        if result.returncode == 0:
            break
        last_result = result
        time.sleep(2)
    else:
        pytest.fail(
            f"Failed to reset database after 3 attempts:\n"
            f"stdout: {last_result.stdout}\nstderr: {last_result.stderr}"
        )

    # docker exec runs as root; give the data back to the app user
    docker_exec("chown", "-R", "1000:1000", "/zusam/data")


@pytest.fixture
def client(api_url: str, fresh_db) -> httpxyz.Client:
    """Return an unauthenticated httpxyz client with the base URL configured."""
    with httpxyz.Client(base_url=api_url, timeout=30) as c:
        yield c


@pytest.fixture
def auth_client(api_url: str, fresh_db) -> httpxyz.Client:
    """
    Return an authenticated httpxyz client using the seeded API key.

    This uses the deterministic API key generated from the test seed,
    avoiding the need to perform login for each test.
    """
    headers = {"X-AUTH-TOKEN": SEEDED_USER_SECRET_KEY}
    with httpxyz.Client(base_url=api_url, headers=headers, timeout=30) as c:
        yield c


@pytest.fixture
def default_group_id() -> str:
    """Return the deterministic group ID from the seeded database."""
    return SEEDED_GROUP_ID


@pytest.fixture
def default_user_id() -> str:
    """Return the deterministic user ID from the seeded database."""
    return SEEDED_USER_ID


@pytest.fixture
def default_group_secret_key() -> str:
    """Return the deterministic group secret key (invite key) from the seeded database."""
    return SEEDED_GROUP_SECRET_KEY


@pytest.fixture
def test_image_bytes() -> bytes:
    """
    Return a valid PNG image as bytes for testing file uploads.

    Uses the icon-512x512.png file from the integration-tests directory.
    """
    image_path = Path(__file__).parent / "icon-512x512.png"
    return image_path.read_bytes()
