import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
} from "@/constants/validation";
import { utf8ByteLength } from "@/utils/utf8-byte-length";
import { emailField } from "./fields";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, { error: MESSAGES.VALIDATION.NAME_LENGTH })
    .max(NAME_MAX_LENGTH, { error: MESSAGES.VALIDATION.NAME_LENGTH }),
  email: emailField,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: MESSAGES.VALIDATION.PASSWORD_TOO_SHORT })
    .refine((password: string): boolean => utf8ByteLength(password) <= PASSWORD_MAX_BYTES, {
      error: MESSAGES.VALIDATION.PASSWORD_TOO_LONG,
    }),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export type RegisterField = keyof RegisterValues;

export const REGISTER_FIELDS: readonly RegisterField[] = registerSchema.keyof().options;
