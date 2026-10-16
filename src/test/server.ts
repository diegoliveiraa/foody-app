import { setupServer, type SetupServer } from "msw/node";

export const server: SetupServer = setupServer();

export function apiUrl(path: string): string {
  return `${import.meta.env.VITE_API_URL}${path}`;
}
