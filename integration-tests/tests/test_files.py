"""Integration tests for file operations."""

import httpx


def test_upload_image(auth_client: httpx.Client, test_image_bytes: bytes):
    """
    Test uploading an image file.

    This test demonstrates:
    1. Uploading a file via multipart/form-data
    2. Verifying the response contains file metadata
    """
    files = {"file": ("test.png", test_image_bytes, "image/png")}

    response = auth_client.post("/api/files", files=files)

    assert response.status_code == 201
    file_data = response.json()

    # Verify response contains expected fields
    assert "id" in file_data
    assert "contentUrl" in file_data
    assert "type" in file_data
    assert file_data["type"] == "image/png"
