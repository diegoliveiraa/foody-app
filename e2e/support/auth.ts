import type { Page } from "@playwright/test";
import { MESSAGES } from "../../src/constants/messages";

export const VALID_PASSWORD: string = "senha-forte-123";

export async function signIn(
  page: Page,
  email: string,
  password: string = VALID_PASSWORD,
): Promise<void> {
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill(email);
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(password);
  await page.getByRole("button", { name: MESSAGES.LOGIN.SUBMIT }).click();
}
