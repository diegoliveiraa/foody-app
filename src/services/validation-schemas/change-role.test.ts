import { describe, expect, it } from "vitest";
import type { ZodSafeParseResult } from "zod";
import { MESSAGES } from "@/constants/messages";
import { USER_ROLES } from "@/constants/users";
import { changeRoleSchema, type ChangeRoleValues } from "./change-role";

describe("change role schema", () => {
  it.each(Object.values(USER_ROLES))("accepts the role %s", (role: ChangeRoleValues["role"]) => {
    const result: ZodSafeParseResult<ChangeRoleValues> = changeRoleSchema.safeParse({ role });

    expect(result.data).toEqual({ role });
  });

  it("rejects a role the API does not know, asking to pick one", () => {
    const result: ZodSafeParseResult<ChangeRoleValues> = changeRoleSchema.safeParse({
      role: "OWNER",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(MESSAGES.VALIDATION.ROLE_REQUIRED);
  });
});
