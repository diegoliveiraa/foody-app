import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { USER_ROLES } from "@/constants/users";

export const changeRoleSchema = z.object({
  role: z.enum(USER_ROLES, { error: MESSAGES.VALIDATION.ROLE_REQUIRED }),
});

export type ChangeRoleValues = z.infer<typeof changeRoleSchema>;
