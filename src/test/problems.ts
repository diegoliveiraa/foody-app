import type { ProblemDetails } from "@/@types/problem-details";

export function problem(status: number, code: string, detail: string = code): ProblemDetails {
  return {
    status,
    title: code,
    detail,
    instance: "/test",
    code,
    requestId: `req-${code}`,
  };
}
