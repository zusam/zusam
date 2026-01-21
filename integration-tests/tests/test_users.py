"""Integration tests for user operations."""

import httpx


def test_change_user_avatar(
    auth_client: httpx.Client, default_user_id: str, test_image_bytes: bytes
):
    """
    Test changing a user's avatar.

    This test demonstrates:
    1. Uploading an image file
    2. Updating the user's avatar to the uploaded file
    3. Verifying the user now has the avatar set
    """
    # Step 1: Upload an image file
    files = {"file": ("avatar.png", test_image_bytes, "image/png")}
    upload_response = auth_client.post("/api/files", files=files)

    assert upload_response.status_code == 201
    file_data = upload_response.json()
    file_id = file_data["id"]

    # Step 2: Update user avatar
    update_response = auth_client.put(
        f"/api/users/{default_user_id}",
        json={"avatar": file_id},
    )

    assert update_response.status_code == 200
    user_data = update_response.json()

    # Step 3: Verify user now has avatar set
    assert "avatar" in user_data
    assert user_data["avatar"]["id"] == file_id
