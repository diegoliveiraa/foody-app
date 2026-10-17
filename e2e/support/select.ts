import type { Locator, Page } from "@playwright/test";

export async function chooseOption(page: Page, select: Locator, option: string): Promise<void> {
  await select.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
