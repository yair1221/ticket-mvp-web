import { test, expect } from "@playwright/test";

test.describe("Login flow (UI)", () => {
  test("phone step requires consent before enabling submit", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /אימות מספר טלפון/ })).toBeVisible();

    const phoneInput = page.getByPlaceholder("05X-XXX-XXXX");
    await phoneInput.fill("0501234567");

    const submit = page.getByRole("button", { name: /שלח קוד אימות/ });
    await expect(submit).toBeDisabled();

    const consent = page.getByRole("checkbox");
    await consent.check();
    await expect(submit).toBeEnabled();
  });

  test("consent links to terms + privacy", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /לתקנון/ })).toHaveAttribute(
      "href",
      "/terms",
    );
    await expect(page.getByRole("link", { name: /מדיניות הפרטיות/ })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
