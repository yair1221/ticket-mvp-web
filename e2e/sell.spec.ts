import { test, expect } from "@playwright/test";

test.describe("Sell form (UI validation)", () => {
  test("submit is disabled until event + price + section are chosen", async ({ page }) => {
    await page.goto("/sell");
    const submit = page.getByRole("button", { name: /פרסם כרטיס/ });
    await expect(submit).toBeDisabled();
  });

  test("price input strips non-digits", async ({ page }) => {
    await page.goto("/sell");
    const priceInput = page.getByPlaceholder("0");
    await priceInput.fill("abc123def");
    await expect(priceInput).toHaveValue("123");
  });
});
