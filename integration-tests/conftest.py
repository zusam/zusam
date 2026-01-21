"""Pytest fixtures for Zusam integration tests."""

import hashlib
import subprocess
import time

import httpx
import pytest


# Test configuration
API_BASE_URL = "http://localhost:8080"
CONTAINER_NAME = "zusam-integration-test"
TEST_SEED = "test_seed"
DEFAULT_USER = "zusam"
DEFAULT_PASSWORD = "zusam"


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

    return "-".join([
        h[0:8],
        h[8:12],
        "4" + h[12:15],
        variant + h[15:18],
        h[18:30],
    ])


# Pre-computed deterministic IDs for test_seed
SEEDED_USER_ID = _generate_seeded_uuid(f"{TEST_SEED}_user")
SEEDED_USER_SECRET_KEY = _generate_seeded_uuid(f"{TEST_SEED}_user_secret_key")
SEEDED_GROUP_ID = _generate_seeded_uuid(f"{TEST_SEED}_group")
SEEDED_GROUP_SECRET_KEY = _generate_seeded_uuid(f"{TEST_SEED}_group_secret_key")


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
            response = httpx.get(f"{api_url}/api/info", timeout=5)
            if response.status_code == 200:
                return
        except httpx.RequestError:
            pass

        if attempt < max_attempts - 1:
            time.sleep(delay)

    pytest.fail(f"API at {api_url} did not become ready after {max_attempts * delay} seconds")


@pytest.fixture
def fresh_db(api_ready) -> None:
    """
    Reset the database before each test using the seeded initialization.

    This runs `zusam:init --remove-existing --seed test_seed` in the container,
    ensuring each test starts with a clean, predictable database state.
    """
    cmd = [
        "docker", "exec", CONTAINER_NAME,
        "/zusam/api/bin/console", "zusam:init",
        DEFAULT_USER, DEFAULT_USER, DEFAULT_PASSWORD,
        "--remove-existing",
        "--seed", TEST_SEED,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        pytest.fail(
            f"Failed to reset database:\nstdout: {result.stdout}\nstderr: {result.stderr}"
        )

    # Fix database permissions (docker exec runs as root, but web server runs as zusam)
    # With APP_ENV=test, the database is at /zusam/api/var/cache/test/test.db
    fix_perms_cmd = [
        "docker", "exec", CONTAINER_NAME,
        "chown", "zusam:zusam", "/zusam/api/var/cache/test/test.db",
    ]
    subprocess.run(fix_perms_cmd, capture_output=True, text=True)


@pytest.fixture
def client(api_url: str, fresh_db) -> httpx.Client:
    """Return an unauthenticated httpx client with the base URL configured."""
    with httpx.Client(base_url=api_url, timeout=30) as c:
        yield c


@pytest.fixture
def auth_client(api_url: str, fresh_db) -> httpx.Client:
    """
    Return an authenticated httpx client using the seeded API key.

    This uses the deterministic API key generated from the test seed,
    avoiding the need to perform login for each test.
    """
    headers = {"X-AUTH-TOKEN": SEEDED_USER_SECRET_KEY}
    with httpx.Client(base_url=api_url, headers=headers, timeout=30) as c:
        yield c


@pytest.fixture
def login_and_get_client(client: httpx.Client) -> httpx.Client:
    """
    Demonstrate the login flow and return an authenticated client.

    This fixture shows how to authenticate via the API rather than
    using the pre-computed seeded key.
    """
    response = client.post(
        "/api/login",
        json={"login": DEFAULT_USER, "password": DEFAULT_PASSWORD},
    )
    response.raise_for_status()

    api_key = response.json()["api_key"]

    # Create new client with auth header
    auth_headers = {"X-AUTH-TOKEN": api_key}
    with httpx.Client(
        base_url=client.base_url, headers=auth_headers, timeout=30
    ) as auth_client:
        yield auth_client


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
    Return a minimal valid PNG image as bytes.

    This is a 1x1 pixel red PNG, suitable for testing file uploads.
    """
    # Minimal valid PNG: 1x1 pixel red image
    # PNG signature + IHDR + IDAT + IEND chunks
    return bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk length + type
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # Width=1, Height=1
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # Bit depth=8, Color type=RGB, ...
        0xDE,                                            # CRC
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,  # IDAT chunk length + type
        0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,  # Compressed image data
        0x01, 0xA0, 0x00, 0xA1,                          # CRC
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
        0xAE, 0x42, 0x60, 0x82,                          # CRC
    ])
