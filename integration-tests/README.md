# Integration Tests

Pytest + httpx integration test framework for Zusam that runs against the production Docker image.

## Prerequisites

- Docker and Docker Compose
- Python 3.10+
- The `zusam` Docker image built locally

## Quick Start

```bash
# 1. Build the production image (from repo root)
make prod

# 2. Start the test container
docker compose up -d

# 3. Set up Python environment
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

# 4. Run tests
./venv/bin/pytest -v

# 5. Clean up when done
docker compose down -v
```

## Directory Structure

```
integration-tests/
├── conftest.py          # Pytest fixtures (Docker, auth, DB reset)
├── docker-compose.yml   # Test environment configuration
├── pytest.ini           # Pytest configuration
├── README.md            # This file
├── requirements.txt     # Python dependencies
└── tests/
    ├── __init__.py
    └── test_messages.py # Message creation tests
```

## Test Environment

The docker-compose.yml configures:

- **Container name**: `zusam-integration-test` (for predictable `docker exec`)
- **Port**: 8080
- **APP_ENV**: `test` (disables login rate limiting)
- **Named volume**: `zusam-data` (not bind-mount)
- **Default credentials**: `zusam` / `zusam`

## Available Fixtures

### Session-scoped

| Fixture | Description |
|---------|-------------|
| `api_url` | Base URL (`http://localhost:8080`) |
| `api_ready` | Waits for API to respond before tests run |

### Function-scoped

| Fixture | Description |
|---------|-------------|
| `fresh_db` | Resets database with seeded data before each test |
| `client` | Unauthenticated httpx client |
| `auth_client` | Pre-authenticated client using seeded API key |
| `login_and_get_client` | Authenticates via login endpoint |
| `default_group_id` | Deterministic group ID from seeded DB |
| `default_user_id` | Deterministic user ID from seeded DB |

## Database Reset Strategy

Each test starts with a fresh database via the `fresh_db` fixture:

1. Runs `zusam:init --remove-existing --seed test_seed` in the container
2. The `--seed` option generates deterministic UUIDs for predictable test data
3. Fixes database permissions (docker exec runs as root, web server as zusam)

## Writing Tests

### Basic test with login flow

```python
def test_example(client: httpx.Client, default_group_id: str):
    # Login
    response = client.post("/api/login", json={"login": "zusam", "password": "zusam"})
    api_key = response.json()["api_key"]

    # Make authenticated request
    response = client.get("/api/me", headers={"X-AUTH-TOKEN": api_key})
    assert response.status_code == 200
```

### Using pre-authenticated client

```python
def test_with_auth(auth_client: httpx.Client, default_group_id: str):
    # No login needed - auth_client has the API key header set
    response = auth_client.post("/api/messages", json={
        "group": default_group_id,
        "data": {"text": "Hello!"}
    })
    assert response.status_code == 201
```

## Troubleshooting

### Tests fail with "API did not become ready"

The container may need more time to start. Check logs:
```bash
docker logs zusam-integration-test
```

### Tests fail with "readonly database"

This usually means database permissions are wrong. The `fresh_db` fixture should handle this automatically, but you can manually fix:
```bash
docker exec zusam-integration-test chown zusam:zusam /zusam/api/var/cache/test/test.db
```

### Container won't start

Ensure the `zusam` image exists:
```bash
docker images | grep zusam
```

If not, build it from the repo root:
```bash
make prod
```
