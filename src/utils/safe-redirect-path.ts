const APP_PATH_START: string = "/";

const FOREIGN_HOST_STARTS: readonly string[] = ["//", "/\\"];

export function safeRedirectPath(value: string | null): string | null {
  if (value === null || !value.startsWith(APP_PATH_START)) {
    return null;
  }
  if (FOREIGN_HOST_STARTS.some((start: string): boolean => value.startsWith(start))) {
    return null;
  }
  return value;
}
