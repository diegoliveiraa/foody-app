import { API_PATHS } from "../../../src/constants/api";
import { REDIRECT_TO_PARAM, ROUTE_PATHS } from "../../../src/constants/routes";
import { signIn } from "../../support/auth";
import { HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { SIGNED_IN, stubMe, stubSignedOut } from "../../support/session";

const PRIVATE_PATH: string = SCREEN_URLS.MY_ORDERS;

test("sends a signed-out visitor of a private page to the login page, remembering it", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);

  await page.goto(PRIVATE_PATH);

  await expect(page).toHaveURL(
    (url: URL): boolean =>
      url.pathname === ROUTE_PATHS.LOGIN &&
      url.searchParams.get(REDIRECT_TO_PARAM) === PRIVATE_PATH,
  );
  await expectNoHorizontalOverflow(page);
});

test("brings the visitor back to the page they were going to after signing in", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);
  await api.respond(HTTP_METHODS.POST, API_PATHS.LOGIN, SIGNED_IN);
  await stubMe(api, CUSTOMER_ME);
  await page.goto(`${ROUTE_PATHS.LOGIN}?${REDIRECT_TO_PARAM}=${encodeURIComponent(PRIVATE_PATH)}`);

  await signIn(page, CUSTOMER_ME.user.email);

  await expect(page).toHaveURL(pathIs(PRIVATE_PATH));
  await expect(page.getByRole("heading", { name: ME_LABELS.MY_ORDERS })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
