import { API_PATHS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { HTTP_INTERNAL_ERROR, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";
import { SIGNED_IN } from "../../support/session";

test("names the unexpected-error page with a level-one heading and in the browser tab", async ({
  page,
  api,
}): Promise<void> => {
  await api.respond(HTTP_METHODS.POST, API_PATHS.REFRESH, SIGNED_IN);
  await api.respond(
    HTTP_METHODS.GET,
    API_PATHS.ME,
    problem(HTTP_INTERNAL_ERROR, "INTERNAL_ERROR", "Falha inesperada"),
    HTTP_INTERNAL_ERROR,
  );

  await page.goto(SCREEN_URLS.MENU);

  await expect(
    page.getByRole("heading", { name: MESSAGES.UNEXPECTED.TITLE, level: 1 }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Algo deu errado · Foody");
  await expect(page.getByRole("button", { name: MESSAGES.ACTIONS.RETRY })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
