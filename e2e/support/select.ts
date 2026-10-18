import type { Locator, Page } from "@playwright/test";
import { MESSAGES } from "../../src/constants/messages";

export async function chooseOption(page: Page, select: Locator, option: string): Promise<void> {
  await select.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

export function sortSelect(page: Page): Locator {
  return page.getByRole("combobox", { name: MESSAGES.LIST.SORT_BY });
}

export async function sortOptionLabels(page: Page): Promise<string[]> {
  await sortSelect(page).click();
  const labels: string[] = await page.getByRole("option").allTextContents();
  await page.keyboard.press("Escape");
  return labels;
}
