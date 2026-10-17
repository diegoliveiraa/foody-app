import { API_PATHS, ERROR_CODES, HTTP_HEADERS, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { signIn } from "../../support/auth";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { problem } from "../../support/problems";
import { stubSignedOut } from "../../support/session";

const RETRY_AFTER_SECONDS: number = 30;

const SECONDS_PATTERN: string = "[0-9]+";

const COUNTDOWN_LABEL: RegExp = new RegExp(
  `^${MESSAGES.LOGIN.WAIT(Number.NaN).replace(String(Number.NaN), SECONDS_PATTERN)}$`,
);

test("tells how long to wait and holds the button while the login is rate limited", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.LOGIN,
    problem(HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMITED, "Muitas tentativas."),
    HTTP_STATUS.TOO_MANY_REQUESTS,
    { [HTTP_HEADERS.RETRY_AFTER]: String(RETRY_AFTER_SECONDS) },
  );
  await page.goto(ROUTE_PATHS.LOGIN);

  await signIn(page, "ana@foody.dev");

  await expect(page.getByText(MESSAGES.ERRORS.RATE_LIMITED(RETRY_AFTER_SECONDS))).toBeVisible();
  await expect(page.getByRole("button", { name: COUNTDOWN_LABEL })).toBeDisabled();
  await expect(page.getByRole("button", { name: MESSAGES.LOGIN.SUBMIT })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
