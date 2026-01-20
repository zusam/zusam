"""Integration tests for message creation and retrieval."""

import httpx


def test_login_and_create_message(client: httpx.Client, default_group_id: str):
    """
    Test the complete flow of logging in and creating a message.

    This test demonstrates:
    1. Authenticating via the login endpoint
    2. Creating a message in a group
    3. Verifying the message was created correctly
    """
    # Step 1: Login
    login_response = client.post(
        "/api/login",
        json={"login": "zusam", "password": "zusam"},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "api_key" in login_data

    api_key = login_data["api_key"]

    # Step 2: Create a message using the obtained API key
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "Hello from integration test!",
        },
    }

    create_response = client.post(
        "/api/messages",
        json=message_data,
        headers={"X-AUTH-TOKEN": api_key},
    )

    assert create_response.status_code == 201
    message = create_response.json()

    # Step 3: Verify the message was created correctly
    assert "id" in message
    assert message["data"]["text"] == "Hello from integration test!"


def test_create_message_with_auth_client(auth_client: httpx.Client, default_group_id: str):
    """
    Test creating a message using the pre-authenticated client fixture.

    This demonstrates using the seeded API key for faster test execution.
    """
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "Message created with auth_client fixture",
            "title": "Test Title",
        },
    }

    response = auth_client.post("/api/messages", json=message_data)

    assert response.status_code == 201
    message = response.json()
    assert message["data"]["text"] == "Message created with auth_client fixture"
    assert message["data"]["title"] == "Test Title"


def test_create_message_unauthenticated_fails(client: httpx.Client, default_group_id: str):
    """Test that creating a message without authentication fails."""
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "This should fail",
        },
    }

    response = client.post("/api/messages", json=message_data)

    # Should get 401 Unauthorized
    assert response.status_code == 401


def test_create_child_message(auth_client: httpx.Client, default_group_id: str):
    """
    Test creating a child message (reply to a parent message).

    This test demonstrates:
    1. Creating a parent message
    2. Creating a child message with parent reference
    3. Verifying the child has correct parent and isInFront: false
    """
    # Step 1: Create a parent message
    parent_data = {
        "group": default_group_id,
        "data": {
            "text": "This is the parent message",
        },
    }

    parent_response = auth_client.post("/api/messages", json=parent_data)
    assert parent_response.status_code == 201
    parent_message = parent_response.json()
    parent_id = parent_message["id"]

    # Step 2: Create a child message
    child_data = {
        "group": default_group_id,
        "data": {
            "text": "This is a reply",
        },
        "parent": parent_id,
    }

    child_response = auth_client.post("/api/messages", json=child_data)
    assert child_response.status_code == 201
    child_message = child_response.json()

    # Step 3: Verify child message properties
    assert child_message["isInFront"] is False
    assert child_message["parent"]["id"] == parent_id


def test_delete_message(auth_client: httpx.Client, default_group_id: str):
    """
    Test deleting a message.

    This test demonstrates:
    1. Creating a message
    2. Deleting the message
    3. Verifying the message is no longer accessible
    """
    # Step 1: Create a message
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "This message will be deleted",
        },
    }

    create_response = auth_client.post("/api/messages", json=message_data)
    assert create_response.status_code == 201
    message = create_response.json()
    message_id = message["id"]

    # Step 2: Delete the message
    delete_response = auth_client.delete(f"/api/messages/{message_id}")
    assert delete_response.status_code == 204

    # Step 3: Verify message no longer accessible
    get_response = auth_client.get(f"/api/messages/{message_id}")
    assert get_response.status_code == 404


def test_edit_message(auth_client: httpx.Client, default_group_id: str):
    """
    Test editing an existing message.

    This test demonstrates:
    1. Creating a message
    2. Editing the message with updated text
    3. Verifying the response contains the updated text
    """
    # Step 1: Create a message
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "Original message text",
        },
    }

    create_response = auth_client.post("/api/messages", json=message_data)
    assert create_response.status_code == 201
    message = create_response.json()
    message_id = message["id"]

    # Step 2: Edit the message
    edit_data = {
        "data": {
            "text": "Updated message text",
        },
    }

    edit_response = auth_client.put(f"/api/messages/{message_id}", json=edit_data)
    assert edit_response.status_code == 200
    updated_message = edit_response.json()

    # Step 3: Verify the updated text
    assert updated_message["data"]["text"] == "Updated message text"


def test_message_with_url_embed(auth_client: httpx.Client, default_group_id: str):
    """
    Test creating a message with a URL and fetching link metadata.

    This test demonstrates:
    1. Creating a message containing a URL
    2. Fetching link metadata via the links API
    3. Verifying the link data contains title/description
    """
    # Step 1: Create a message with a URL
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "Check out https://wikipedia.org",
        },
    }

    create_response = auth_client.post("/api/messages", json=message_data)
    assert create_response.status_code == 201

    # Step 2: Fetch link metadata
    link_response = auth_client.post(
        "/api/links/by_url",
        json={"url": "https://wikipedia.org"},
    )

    assert link_response.status_code == 200
    link_data = link_response.json()

    # Step 3: Verify link data contains expected fields
    # The link should have at least a title or description
    assert "id" in link_data
    # Wikipedia should return some metadata
    assert "data" in link_data or "title" in link_data
