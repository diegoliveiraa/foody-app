import { QUERY_START, REDIRECT_TO_PARAM, ROUTE_PATHS } from "@/constants/routes";
import { safeRedirectPath } from "./safe-redirect-path";

export function redirectDestination(redirectTo: string | null): string {
  return safeRedirectPath(redirectTo) ?? ROUTE_PATHS.HOME;
}

export function authPathKeeping(path: string, redirectTo: string | null): string {
  const destination: string | null = safeRedirectPath(redirectTo);
  if (destination === null) {
    return path;
  }
  const search: URLSearchParams = new URLSearchParams({ [REDIRECT_TO_PARAM]: destination });
  return `${path}${QUERY_START}${search.toString()}`;
}
