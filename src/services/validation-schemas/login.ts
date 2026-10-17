import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { REQUIRED_MIN_LENGTH } from "@/constants/validation";
import { emailField } from "./fields";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(REQUIRED_MIN_LENGTH, { error: MESSAGES.VALIDATION.PASSWORD_REQUIRED }),
});

export type LoginValues = z.infer<typeof loginSchema>;
