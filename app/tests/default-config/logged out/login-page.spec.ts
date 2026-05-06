import { test, expect } from "@playwright/test";

test("missing all login details", async ({ page }) => {
  await page.goto("/login");
  await page.click("button[type=\"submit\"]");
  await expect(page.locator(".global-alert")).toContainText(
    "Login cannot be empty",
  );
});

test("missing password only", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#login", "username");
  await page.click("button[type=\"submit\"]");
  await expect(page.locator(".global-alert")).toContainText(
    "Password cannot be empty",
  );
});

test("missing email only", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#login").clear();
  await page.fill("#password", "password");
  await page.click("button[type=\"submit\"]");
  await expect(page.locator(".global-alert")).toContainText(
    "Login cannot be empty",
  );
});

test("invalid login", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#login", "username");
  await page.fill("#password", "password");
  await page.click("button[type=\"submit\"]");
  await expect(page.locator(".global-alert")).toContainText(
    "Invalid login and/or password",
  );
});

test("forgot password", async ({ page }) => {
  await page.goto("/login");
  await page.getByText("Forgot your password?").click();
  await expect(page.locator(".welcome")).toContainText(
    "Emails are disabled. Please contact your system administrator to reset your password.",
  );
});
