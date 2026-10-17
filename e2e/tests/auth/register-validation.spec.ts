import { API_PATHS, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { VALID_PASSWORD } from "../../support/auth";
import { HTTP_METHODS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { problem } from "../../support/problems";
import { stubSignedOut } from "../../support/session";

const SERVER_NAME_MESSAGE: string = "O nome não pode conter apenas números.";

test("points at each invalid field before calling the API", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await page.goto(ROUTE_PATHS.REGISTER);

  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill("ana@");
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill("curta");
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page.getByText(MESSAGES.VALIDATION.NAME_LENGTH)).toBeVisible();
  await expect(page.getByText(MESSAGES.VALIDATION.EMAIL_INVALID)).toBeVisible();
  await expect(page.getByText(MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)).toBeVisible();
  await expect(page.getByLabel(MESSAGES.FIELDS.NAME)).toHaveAttribute("aria-invalid", "true");
  await expectNoHorizontalOverflow(page);
});

test("puts the API's field errors on the fields they belong to", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.REGISTER,
    problem(HTTP_STATUS.BAD_REQUEST, "VALIDATION_FAILED", "Há campos inválidos.", [
      { field: "name", message: SERVER_NAME_MESSAGE },
    ]),
    HTTP_STATUS.BAD_REQUEST,
  );
  await page.goto(ROUTE_PATHS.REGISTER);

  await page.getByLabel(MESSAGES.FIELDS.NAME).fill("12345");
  await page.getByLabel(MESSAGES.FIELDS.EMAIL).fill("ana@foody.dev");
  await page.getByLabel(MESSAGES.FIELDS.PASSWORD).fill(VALID_PASSWORD);
  await page.getByRole("button", { name: MESSAGES.REGISTER.SUBMIT }).click();

  await expect(page.getByText(SERVER_NAME_MESSAGE)).toBeVisible();
  await expect(page.getByLabel(MESSAGES.FIELDS.NAME)).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.REGISTER));
});
