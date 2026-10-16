import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";

test("loads the app without horizontal overflow", async ({ page }): Promise<void> => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foody");
  await expectNoHorizontalOverflow(page);
});
