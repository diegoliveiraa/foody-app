import { describe, expect, it } from "vitest";
import type { ApiError, ProblemDetails } from "@/@types/problem-details";
import { MESSAGES } from "@/constants/messages";
import { extractApiError, knownFieldErrors, type ApiErrorInfo } from "./api-error";

const CONFLICT: ProblemDetails = {
  status: 409,
  title: "Conflict",
  detail: "Este e-mail já está cadastrado.",
  instance: "/auth/register",
  code: "EMAIL_ALREADY_REGISTERED",
  requestId: "req-1",
};

const VALIDATION: ProblemDetails = {
  status: 400,
  title: "Bad Request",
  detail: "Há campos inválidos.",
  instance: "/auth/register",
  code: "VALIDATION_FAILED",
  requestId: "req-2",
  errors: [
    { field: "name", message: "O nome é obrigatório." },
    { field: "password", message: "A senha é curta demais." },
    { field: "password", message: "A senha é fraca." },
  ],
};

describe("extractApiError", () => {
  it("shows the API's detail and keeps its code and request id", () => {
    const error: ApiError = { status: 409, data: CONFLICT };

    const info: ApiErrorInfo = extractApiError(error);

    expect(info).toEqual({
      status: 409,
      detail: CONFLICT.detail,
      code: "EMAIL_ALREADY_REGISTERED",
      requestId: "req-1",
      fieldErrors: {},
      retryAfterSeconds: null,
    });
  });

  it("maps errors[] onto their fields, keeping the first message of each field", () => {
    const error: ApiError = { status: 400, data: VALIDATION };

    const info: ApiErrorInfo = extractApiError(error);

    expect(info.fieldErrors).toEqual({
      name: "O nome é obrigatório.",
      password: "A senha é curta demais.",
    });
  });

  it("carries the Retry-After seconds the base query attached to a 429", () => {
    const error: ApiError = {
      status: 429,
      data: { ...CONFLICT, status: 429, code: "RATE_LIMITED" },
      retryAfterSeconds: 30,
    };

    const info: ApiErrorInfo = extractApiError(error);

    expect(info.code).toBe("RATE_LIMITED");
    expect(info.retryAfterSeconds).toBe(30);
  });

  it("falls back to a generic message when the API could not be reached", () => {
    const error: ApiError = { status: "FETCH_ERROR", error: "TypeError: Failed to fetch" };

    const info: ApiErrorInfo = extractApiError(error);

    expect(info).toEqual({
      status: null,
      detail: MESSAGES.ERRORS.UNAVAILABLE,
      code: null,
      requestId: null,
      fieldErrors: {},
      retryAfterSeconds: null,
    });
  });

  it("falls back to a generic message when the answer is not Problem Details", () => {
    const error: ApiError = { status: 502, data: "<html>Bad gateway</html>" };

    const info: ApiErrorInfo = extractApiError(error);

    expect(info.detail).toBe(MESSAGES.ERRORS.UNAVAILABLE);
    expect(info.code).toBeNull();
    expect(info.status).toBe(502);
  });

  it("falls back to a generic message for a value that is not an API error", () => {
    const info: ApiErrorInfo = extractApiError(new Error("boom"));

    expect(info.detail).toBe(MESSAGES.ERRORS.UNAVAILABLE);
  });
});

describe("knownFieldErrors", () => {
  it("keeps only the messages of the fields a form has, in the API's order", () => {
    const info: ApiErrorInfo = extractApiError({ status: 400, data: VALIDATION });

    const errors: [string, string][] = knownFieldErrors(info, ["password", "email"]);

    expect(errors).toEqual([["password", "A senha é curta demais."]]);
  });

  it("finds nothing when the API sent no field errors", () => {
    const info: ApiErrorInfo = extractApiError({ status: 409, data: CONFLICT });

    expect(knownFieldErrors(info, ["name"])).toEqual([]);
  });
});
