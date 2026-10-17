import { API_PATHS, ERROR_CODES, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { VALID_PASSWORD } from "../../support/auth";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { problem } from "../../support/problems";
import { stubSignedOut } from "../../support/session";

const EMAIL_TAKEN_DETAIL: string = "Este e-mail já está cadastrado.";

test("tells on the e-mail field that the address already has an account", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.REGISTER,
    problem(HTTP_STATUS.CONFLICT, ERROR_CODES.EMAIL_ALREADY_REGISTERED, EMAIL_TAKEN_DETAIL),
    HTTP_STATUS.CONFLICT,
  );
  await page.goto(ROUTE_PATHS.REGISTER);

  await page.getByLabel(MESSAGES.FIELDS.NAME).fill("Ana Souza");
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill("ana@foody.dev");
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page.getByText(EMAIL_TAKEN_DETAIL)).toBeVisible();
  await expect(page.getByLabel(MESSAGES.FIELDS.EMAIL)).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.REGISTER));
  await expectNoHorizontalOverflow(page);
});
