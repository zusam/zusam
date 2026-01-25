"""Integration tests for notification emails."""

import time

import httpx


def test_notification_email_via_cron_command(
    auth_client: httpx.Client,
    client: httpx.Client,
    default_group_id: str,
    mailpit_clear,
    mailpit_messages,
    run_console_command,
):
    """
    Test notification emails are sent when running the cron command directly.

    This test demonstrates:
    1. Creating a second user with email and notification_emails='immediately'
    2. Creating a message that triggers a notification for the second user
    3. Running the notification:emails command manually
    4. Verifying the email was sent via mailpit API
    """
    # Get the invite key from the group via API
    group_response = auth_client.get(f"/api/groups/{default_group_id}")
    assert group_response.status_code == 200
    invite_key = group_response.json()["inviteKey"]

    # Step 1: Create a second user via signup with invite key
    signup_response = client.post(
        "/api/signup",
        json={
            "login": "testuser2@example.com",
            "password": "testpassword",
            "invite_key": invite_key,
        },
    )
    if signup_response.status_code != 200:
        print(f"Signup failed: {signup_response.status_code} - {signup_response.text}")
        print(f"Invite key used: {invite_key}")
    assert signup_response.status_code == 200, f"Signup failed: {signup_response.text}"
    user2_api_key = signup_response.json()["api_key"]

    # Get user2's ID
    user2_client = httpx.Client(
        base_url=client.base_url,
        headers={"X-AUTH-TOKEN": user2_api_key},
        timeout=30,
    )
    me_response = user2_client.get("/api/me")
    assert me_response.status_code == 200
    user2_id = me_response.json()["id"]

    # Step 2: Update user2 to enable immediate notification emails
    update_response = user2_client.put(
        f"/api/users/{user2_id}",
        json={
            "data": {
                "mail": "testuser2@example.com",
                "notification_emails": "immediately",
            },
        },
    )
    assert update_response.status_code == 200

    # Step 2b: Initialize lastNotificationEmailCheck by running command once
    # The NotificationEmails command skips users with empty lastNotificationEmailCheck
    # and sets it to now. So we run it once to initialize, then create message, then run again.
    run_console_command("zusam:notification:emails", "--log-send")
    time.sleep(1.5)  # Ensure timestamp crosses a second boundary

    # Step 3: Create a message as user1, which should trigger notification for user2
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "Hello! This message should trigger a notification email.",
        },
    }
    create_response = auth_client.post("/api/messages", json=message_data)
    assert create_response.status_code == 201

    # Step 4: Run the notification:emails command again to send the email
    result = run_console_command("zusam:notification:emails", "--log-send")
    assert result.returncode == 0, f"Command failed: {result.stderr}"

    # Step 5: Check mailpit for the sent email
    time.sleep(1)  # Give mailpit a moment to receive the email
    messages = mailpit_messages()
    assert len(messages) >= 1, f"Expected at least 1 email, got {len(messages)}"

    # Verify email was sent to user2
    user2_emails = [m for m in messages if "testuser2@example.com" in str(m.get("To", []))]
    assert len(user2_emails) >= 1, f"No email found for testuser2@example.com. Messages: {messages}"

    user2_client.close()


def test_notification_email_via_page_call(
    auth_client: httpx.Client,
    client: httpx.Client,
    default_group_id: str,
    mailpit_clear,
    mailpit_messages,
    get_container_logs,
    run_console_command,
):
    """
    Test notification emails are sent when triggered via GET request (TerminateListener).

    This test will likely FAIL, revealing the issue with TerminateListener not
    triggering cron tasks on page calls.

    Steps:
    1. Create a second user with email and notification_emails='immediately'
    2. Create a message that triggers a notification for the second user
    3. Make a GET request to trigger TerminateListener
    4. Check if email was sent
    """
    # Get the invite key from the group via API
    group_response = auth_client.get(f"/api/groups/{default_group_id}")
    assert group_response.status_code == 200
    invite_key = group_response.json()["inviteKey"]

    # Step 1: Create a second user via signup with invite key
    signup_response = client.post(
        "/api/signup",
        json={
            "login": "testuser3@example.com",
            "password": "testpassword",
            "invite_key": invite_key,
        },
    )
    assert signup_response.status_code == 200
    user_api_key = signup_response.json()["api_key"]

    # Get user's ID
    user_client = httpx.Client(
        base_url=client.base_url,
        headers={"X-AUTH-TOKEN": user_api_key},
        timeout=30,
    )
    me_response = user_client.get("/api/me")
    assert me_response.status_code == 200
    user_id = me_response.json()["id"]

    # Step 2: Update user to enable immediate notification emails
    update_response = user_client.put(
        f"/api/users/{user_id}",
        json={
            "data": {
                "mail": "testuser3@example.com",
                "notification_emails": "immediately",
            },
        },
    )
    assert update_response.status_code == 200

    # Step 2b: Initialize lastNotificationEmailCheck by running command once
    # The NotificationEmails command skips users with empty lastNotificationEmailCheck
    run_console_command("zusam:notification:emails", "--log-send")
    time.sleep(1.5)  # Ensure timestamp crosses a second boundary

    # Step 3: Create a message as user1, which should trigger notification
    message_data = {
        "group": default_group_id,
        "data": {
            "text": "This message should trigger notification via TerminateListener.",
        },
    }
    create_response = auth_client.post("/api/messages", json=message_data)
    assert create_response.status_code == 201

    # Step 4: Make multiple GET requests to trigger TerminateListener
    # The TerminateListener should run cron tasks after the response is sent
    for _ in range(5):
        auth_client.get("/api/me")
        time.sleep(0.5)

    # Give some time for async processing
    time.sleep(3)

    # Step 5: Check mailpit for the sent email
    messages = mailpit_messages()

    # Get container logs for debugging
    logs = get_container_logs(200)

    # Check if email was sent to user
    user_emails = [m for m in messages if "testuser3@example.com" in str(m.get("To", []))]

    if len(user_emails) == 0:
        print("\n=== DEBUG: No email found ===")
        print(f"Total messages in mailpit: {len(messages)}")
        print(f"Recent container logs:\n{logs[-2000:]}")

    assert len(user_emails) >= 1, (
        f"No email found for testuser3@example.com via page call. "
        f"This may indicate TerminateListener is not triggering cron tasks. "
        f"Total emails: {len(messages)}"
    )

    user_client.close()


def test_cron_task_runs_on_get_request(
    auth_client: httpx.Client,
    get_log_file,
):
    """
    Debug test to verify if cron tasks are being triggered on GET requests.

    This test makes GET requests and checks the application log file for debug messages
    from the Cron.php runTask() method.
    """
    # Clear any cached logs by making a request first
    auth_client.get("/api/me")
    time.sleep(1)

    # Make several GET requests to trigger TerminateListener
    for i in range(5):
        auth_client.get("/api/me")
        time.sleep(0.3)

    # Give time for any async processing
    time.sleep(2)

    # Get new logs from the application log file
    new_logs = get_log_file(100)

    # Check for debug messages from runTask()
    debug_indicators = [
        "runTask() called",
        "runTask() passed POST/FILES check",
        "runTask() acquired lock",
        "Running zusam:",
    ]

    found_indicators = []
    for indicator in debug_indicators:
        if indicator in new_logs:
            found_indicators.append(indicator)

    print("\n=== DEBUG: Cron task execution trace ===")
    print(f"Found debug indicators: {found_indicators}")
    print(f"Recent logs from prod.log:\n{new_logs[-3000:]}")

    # This is a diagnostic test - we want to see what's happening
    # The assertions help us understand the flow
    assert "runTask() called" in new_logs or "Running zusam:" in new_logs or len(found_indicators) > 0, (
        f"No evidence of runTask() being called. "
        f"Check if TerminateListener is actually invoking Cron->runTask(). "
        f"Found indicators: {found_indicators}"
    )
