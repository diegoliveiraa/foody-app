import type { ProblemDetails, ProblemFieldError } from "../../src/@types/problem-details";

export function problem(
  status: number,
  code: string,
  detail: string,
  errors?: ProblemFieldError[],
): ProblemDetails {
  return {
    status,
    title: code,
    detail,
    instance: "/e2e",
    code,
    requestId: `e2e-${code.toLowerCase()}`,
    ...(errors ? { errors } : {}),
  };
}
