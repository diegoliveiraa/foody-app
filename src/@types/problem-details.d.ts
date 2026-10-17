import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface ProblemFieldError {
  field: string;
  message: string;
}

export interface ProblemDetails {
  status: number;
  title: string;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  errors?: ProblemFieldError[];
}

export type ApiError = FetchBaseQueryError & { retryAfterSeconds?: number };
