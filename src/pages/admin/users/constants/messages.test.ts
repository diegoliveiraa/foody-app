import { describe, expect, it } from "vitest";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import { USER_ROLE_LABELS, USER_STATUS_FILTER_LABELS, USER_STATUS_LABELS } from "./messages";

describe("user labels", () => {
  it("names each role in Portuguese", () => {
    expect(USER_ROLE_LABELS).toEqual({
      CUSTOMER: "Cliente",
      STAFF: "Equipe",
      ADMIN: "Administrador",
    });
  });

  it("names each status in Portuguese, singular on a user and plural in the filter", () => {
    expect(USER_STATUS_LABELS).toEqual({ ACTIVE: "Ativo", DISABLED: "Desabilitado" });
    expect(USER_STATUS_FILTER_LABELS).toEqual({ ACTIVE: "Ativos", DISABLED: "Desabilitados" });
  });

  it("has a label for every role and status the API answers, and no other", () => {
    expect(Object.keys(USER_ROLE_LABELS).sort()).toEqual(Object.values(USER_ROLES).sort());
    expect(Object.keys(USER_STATUS_LABELS).sort()).toEqual(Object.values(USER_STATUSES).sort());
  });
});
