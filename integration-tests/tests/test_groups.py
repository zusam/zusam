"""Integration tests for group operations."""

import httpx


def test_create_group(auth_client: httpx.Client):
    """
    Test creating a new group.

    This test demonstrates:
    1. Creating a group via the API
    2. Verifying the response contains expected fields
    """
    group_data = {"name": "New Group"}

    response = auth_client.post("/api/groups", json=group_data)

    assert response.status_code == 200
    group = response.json()

    # Verify response contains expected fields
    assert "id" in group
    assert group["name"] == "New Group"
    assert "secretKey" in group


def test_rename_group(auth_client: httpx.Client):
    """
    Test renaming an existing group.

    This test demonstrates:
    1. Creating a group
    2. Renaming the group
    3. Verifying the response contains the updated name
    """
    # Step 1: Create a group
    create_response = auth_client.post(
        "/api/groups",
        json={"name": "Original Name"},
    )
    assert create_response.status_code == 200
    group = create_response.json()
    group_id = group["id"]

    # Step 2: Rename the group
    rename_response = auth_client.put(
        f"/api/groups/{group_id}",
        json={"name": "Updated Name"},
    )

    assert rename_response.status_code == 200
    updated_group = rename_response.json()

    # Step 3: Verify the updated name
    assert updated_group["name"] == "Updated Name"


def test_signup_with_invitation(
    auth_client: httpx.Client, client: httpx.Client, api_url: str, default_group_id: str
):
    """
    Test signing up a new user with an invitation key.

    This test demonstrates:
    1. Getting the invite key from the default group
    2. Using an invite key to sign up a new user
    3. Verifying the new user receives an API key
    4. Verifying the new user can access the group
    """
    # Step 1: Get the invite key from the group
    # The inviteKey is only returned when the user has access to the group
    group_response = auth_client.get(f"/api/groups/{default_group_id}")
    assert group_response.status_code == 200
    group_data = group_response.json()
    invite_key = group_data["inviteKey"]

    # Step 2: Signup new user with invite key
    signup_data = {
        "login": "newuser@test.com",
        "password": "test123",
        "invite_key": invite_key,
    }

    signup_response = client.post("/api/signup", json=signup_data)

    assert signup_response.status_code == 200
    signup_result = signup_response.json()

    # Step 3: Verify new user receives API key
    assert "api_key" in signup_result

    # Step 4: Verify new user can access the group
    new_user_api_key = signup_result["api_key"]
    with httpx.Client(
        base_url=api_url,
        headers={"X-AUTH-TOKEN": new_user_api_key},
        timeout=30,
    ) as new_user_client:
        new_group_response = new_user_client.get(f"/api/groups/{default_group_id}")
        assert new_group_response.status_code == 200
        new_group_data = new_group_response.json()
        assert new_group_data["id"] == default_group_id
