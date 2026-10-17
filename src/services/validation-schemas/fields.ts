import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { EMAIL_MAX_LENGTH } from "@/constants/validation";

export const emailField = z
  .string()
  .trim()
  .max(EMAIL_MAX_LENGTH, { error: MESSAGES.VALIDATION.EMAIL_TOO_LONG })
  .pipe(z.email({ error: MESSAGES.VALIDATION.EMAIL_INVALID }));
