import { test, expect } from "../../fixtures/login";
import { createTestUser } from "../../helpers/common";
import { logIn, addGroup, getMe, getGroup } from "../../helpers/api";
import { fetchAuthRequest } from "../../fixtures/login";

// User settings tests create new users so as not to impact other tests with settings changes
test.describe("Test user settings", () => {
  test("User can change their name", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    await userPage.goto("/users/" + user.id + "/settings");
    const nameField = userPage.locator("#settings_form").getByPlaceholder("Choose a name");
    const name = user.me.name;
    await expect(nameField).toHaveValue(name);

    await nameField.fill(name + " edited");
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    await userPage.goto("/users/" + user.id + "/settings");
    await expect(userPage.locator(".global-alert")).not.toBeVisible();
    await expect(nameField).toHaveValue(name + " edited");
  });

  test("User can change their email", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    await userPage.goto("/users/" + user.id + "/settings");
    const emailField = userPage.locator("#settings_form").getByPlaceholder("Fill in your e-mail address here");
    const email = user.me.login;
    await expect(emailField).toHaveValue(email);

    await emailField.fill(user.me.name + "edited@example.com");
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    await userPage.goto("/users/" + user.id + "/settings");
    await expect(userPage.locator(".global-alert")).not.toBeVisible();
    await expect(emailField).toHaveValue(user.me.name + "edited@example.com");
  });

  test("User can change their password", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    await userPage.goto("/users/" + user.id + "/settings");
    const passwordField = userPage.locator("#settings_form").getByPlaceholder("Write a new password here");
    const newPassword = "new password";

    await passwordField.fill(newPassword);
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    const response = await logIn(authRequest, { login: user.me.login, password: newPassword });
    expect(response).toHaveProperty("api_key");
    expect(response.api_key).toBeTruthy();
  });

  test("email notifications setting is remembered", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    // Test default value
    await userPage.goto("/users/" + user.id + "/settings");
    let notificationsField = userPage.locator("select[name=\"notification_emails\"]");
    await expect(notificationsField).toHaveValue("immediately");

    // Test setting it to "weekly"
    await notificationsField.selectOption("weekly");
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    await userPage.goto("/users/" + user.id + "/settings");
    notificationsField = userPage.locator("select[name=\"notification_emails\"]");
    await expect(notificationsField).toHaveValue("weekly");
  });

  test("default group setting works", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);
    const defaultGroup = user.me.groups[0];

    // Test default value
    await userPage.goto("/");
    await expect(userPage).toHaveURL("/groups/" + defaultGroup.id);
    await userPage.goto("/users/" + user.id + "/settings");
    let defaultGroupField = userPage.locator("select[name=\"default_group\"]");
    await expect(defaultGroupField).toHaveValue(defaultGroup.id);

    // Create a group and change it to be the default
    const userRequest = fetchAuthRequest(user.apiKey, baseURL ?? "");
    const newGroup = await addGroup(userRequest, { name: "New default group" });
    await userPage.reload();
    await defaultGroupField.selectOption(newGroup.id);
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    // Check the value is saved in the settings form
    await userPage.goto("/users/" + user.id + "/settings");
    defaultGroupField = userPage.locator("select[name=\"default_group\"]");
    await expect(defaultGroupField).toHaveValue(newGroup.id);

    // Check the function works
    await userPage.goto("/");
    await expect(userPage).toHaveURL("/groups/" + newGroup.id);
  });

  test("default page setting works", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);
    const defaultGroup = user.me.groups[0];

    // Test default value
    await userPage.goto("/");
    await expect(userPage).toHaveURL("/groups/" + defaultGroup.id);
    await userPage.goto("/users/" + user.id + "/settings");
    let defaultPageField = userPage.locator("select[name=\"default_page\"]");
    await expect(defaultPageField).toHaveValue("default_group");

    // Test setting to feed
    await defaultPageField.selectOption("feed");
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    // Check the value is saved in the settings form
    await userPage.goto("/users/" + user.id + "/settings");
    defaultPageField = userPage.locator("select[name=\"default_page\"]");
    await expect(defaultPageField).toHaveValue("feed");

    // Check the function works
    await userPage.goto("/");
    await expect(userPage).toHaveURL("/feed");
  });

  test("language setting works", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    // Test default value
    await userPage.goto("/users/" + user.id + "/settings");
    const languageField = userPage.locator("select[name=\"lang\"]");
    await expect(languageField).toHaveValue("en_US");

    // Test setting it to French
    await languageField.selectOption("fr_FR");
    await userPage.getByRole("button", { name: /Save changes/i }).click();
    await expect(userPage.locator(".global-alert")).toContainText("Your settings were updated");

    await userPage.goto("/users/" + user.id + "/settings");
    await expect(userPage.locator("select[name=\"lang\"]")).toHaveValue("fr_FR");
    await expect(userPage.locator("button[name=\"destroy_account\"]")).toHaveText("Supprimer votre compte");
  });

  test("resetting API key works", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);

    // Test default value
    await userPage.goto("/users/" + user.id + "/settings");
    await expect(userPage.locator("input[name=\"apiKey\"]")).toHaveValue(user.apiKey);

    // Test resetting it
    await userPage.getByRole("button", { name: "Reset the API key (you will be disconnected)" }).click();
    await userPage.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(userPage).toHaveURL("/login");

    // Login again
    await userPage.goto("/login");
    await userPage.fill("#login", user.me.login);
    await userPage.fill("#password", "zusam");

    const [response] = await Promise.all([
      userPage.waitForResponse("**/api/login"),
      await userPage.getByRole("button", { name: /Connect/i }).click()
    ]);

    // Check the API key changed and is listed in the settings page
    const { api_key } = await response.json();
    await userPage.goto("/users/" + user.id + "/settings");
    await expect(userPage.locator("input[name=\"apiKey\"]")).toHaveValue(api_key);
    await expect(api_key).not.toEqual(user.apiKey);
  });

  test("deleting account", async ({ authRequest, createUserPage, baseURL }) => {
    const user = await createTestUser(authRequest, baseURL ?? "");
    const userPage = await createUserPage(user.apiKey);


    // Delete account
    await userPage.goto("/users/" + user.id + "/settings");
    await userPage.getByRole("button", { name: "Delete your account" }).click();
    await userPage.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(userPage).toHaveURL("/login");

    // Login again
    await userPage.goto("/login");
    await userPage.fill("#login", user.me.login);
    await userPage.fill("#password", "zusam");
    await userPage.getByRole("button", { name: /Connect/i }).click();

    // Login should fail
    await expect(userPage.locator(".global-alert")).toContainText("Invalid login and/or password");
  });
});

test("settings page tabs work", async ({ authRequest, page }) => {
  const me = await getMe(authRequest);
  const group = await addGroup(authRequest, { name: "New group for tab testing" });

  await page.goto("/users/" + me.id + "/settings");
  const tabs = page.locator(".settings .nav-tabs");
  const accountTab = tabs.getByText("Account");
  const groupTab = tabs.getByText("Groups", { exact: true });
  await expect(accountTab).toBeVisible();
  await expect(groupTab).toBeVisible();
  
  await groupTab.click();
  await tabs.locator("a[href=\"/groups/" + group.id + "/settings\"]").click();
  await expect(page).toHaveURL("/groups/" + group.id + "/settings");

  await accountTab.click();
  await expect(page).toHaveURL("/users/" + me.id + "/settings");
});

test.describe("Test group settings", () => {
  test("changing group name", async ({ authRequest, page }) => {
    const group = await addGroup(authRequest, { name: "New group" });
    await page.goto("/groups/" + group.id + "/settings");

    const nameField = page.locator("#settings_form").getByPlaceholder("Choose a name");
    const name = group.name;

    // Flaky test because of async loading, wait for everything to be loaded before continuing
    await page.waitForLoadState("networkidle");

    await expect(nameField).toHaveValue(name);
    await nameField.fill(name + " edited");
    await expect(nameField).toHaveValue(name + " edited");

    await page.getByRole("button", { name: /Save changes/i }).click();
    await expect(page.locator(".global-alert")).toHaveText("The group was updated.");
    await expect(nameField).toHaveValue(name + " edited");


    await page.goto("/groups/" + group.id + "/settings");
    await expect(page.locator(".global-alert")).not.toBeVisible();
    await expect(nameField).toHaveValue(name + " edited");
  });

  
  test("reseting invite link", async ({ authRequest, page, baseURL }) => {
    const group = await addGroup(authRequest, { name: "New group" });
    await page.goto("/groups/" + group.id + "/settings");
    const groupData = await getGroup(authRequest, { groupId: group.id });
    const inviteKeyField = page.locator(".settings input[name='inviteKey']");
    await expect(inviteKeyField).toHaveValue(baseURL + "/invitation/" + groupData.inviteKey);

    await page.getByRole("button", { name: "Reset invitation link" }).click();
    await page.locator(".modal-content").getByRole("button", { name: "Reset invitation link", exact: true }).click();
    await expect(page.locator(".global-alert")).toHaveText("The group was updated.");

    await page.goto("/groups/" + group.id + "/settings");
    const newKey = (await getGroup(authRequest, { groupId: group.id })).inviteKey ?? "";
    await expect(page.locator(".settings input[name='inviteKey']")).toHaveValue(baseURL + "/invitation/" + newKey);
    await expect(groupData.inviteKey).not.toEqual(newKey);
  });

  test("leaving a group", async ({ authRequest, page }) => {
    const group = await addGroup(authRequest, { name: "New group" });
    await page.goto("/groups/" + group.id + "/settings");

    await page.getByRole("button", { name: "Leave the group" }).click();
    await page.locator(".modal-content").getByRole("button", { name: "Leave the group", exact: true }).click();
    await page.locator(".modal-content").getByRole("button", { name: "Delete group", exact: true }).click();
    await expect(page.locator(".global-alert")).toHaveText("You left the group.");

    await page.goto("/groups/" + group.id + "/settings");
    const me = await getMe(authRequest);
    await expect(page).toHaveURL("/groups/" + me.data.default_group);
  });
});
