import type { Locator, Page } from "@playwright/test";
import { MESSAGES } from "../../src/constants/messages";
import { isMobileViewport } from "./layout";

export async function openBackofficeNavigation(page: Page): Promise<Locator> {
  if (isMobileViewport(page)) {
    await page.getByRole("button", { name: MESSAGES.NAVIGATION.OPEN_MENU }).click();
  }
  return page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });
}
