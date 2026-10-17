import { describe, expect, it } from "vitest";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import {
  USER_ROLE_LABELS,
  USER_STATUS_FILTER_LABELS,
  USER_STATUS_LABELS,
  USERS_MESSAGES,
} from "./messages";

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

  it("words what happens to a user without agreeing with the user's gender", () => {
    expect(USERS_MESSAGES.DISABLED("Ana Souza")).toBe("Usuário desabilitado: Ana Souza");
    expect(USERS_MESSAGES.ENABLED("Ana Souza")).toBe("Usuário habilitado: Ana Souza");
    expect(USERS_MESSAGES.ROLE_CHANGED("Ana Souza", "Equipe")).toBe(
      "Papel alterado: Ana Souza agora é Equipe",
    );
    expect(USERS_MESSAGES.DISABLE_DIALOG.DESCRIPTION("Ana Souza")).toBe(
      "Ana Souza perde o acesso imediatamente e a sessão é encerrada.",
    );
  });
});
