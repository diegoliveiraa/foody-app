import { API_PATHS, ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { signIn } from "../../support/auth";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { problem } from "../../support/problems";
import { stubSignedOut } from "../../support/session";

const WRONG_CREDENTIALS_DETAIL: string = "E-mail ou senha incorretos.";

test("shows the API's message when the e-mail or password is wrong", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.LOGIN,
    problem(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS, WRONG_CREDENTIALS_DETAIL),
    HTTP_STATUS.UNAUTHORIZED,
  );
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, "ana@foody.dev", "senha-errada");

  await expect(page.getByRole("alert").filter({ hasText: WRONG_CREDENTIALS_DETAIL })).toBeVisible();
  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
  await expect(page.getByRole("button", { name: MESSAGES.LOGIN.SUBMIT })).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});
