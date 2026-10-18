import type { UserRole, UserStatus } from "@/@types/users";
import { ALL_FILTER } from "@/constants/filters";
import { MESSAGES } from "@/constants/messages";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import type { RoleFilter, StatusFilter } from "../filter/types";

const ROLE: string = "Papel";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.CUSTOMER]: "Cliente",
  [USER_ROLES.STAFF]: "Equipe",
  [USER_ROLES.ADMIN]: "Administrador",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.ACTIVE]: MESSAGES.STATUS_LABELS.ACTIVE,
  [USER_STATUSES.DISABLED]: MESSAGES.STATUS_LABELS.DISABLED,
};

export const USER_STATUS_FILTER_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.ACTIVE]: MESSAGES.STATUS_FILTER_LABELS.ACTIVE,
  [USER_STATUSES.DISABLED]: MESSAGES.STATUS_FILTER_LABELS.DISABLED,
};

export const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  [ALL_FILTER]: "Todos os papéis",
  ...USER_ROLE_LABELS,
};

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  [ALL_FILTER]: MESSAGES.STATUS_FILTER_LABELS.ALL,
  ...USER_STATUS_FILTER_LABELS,
};

export const USERS_MESSAGES = {
  SEARCH: "Buscar por nome ou e-mail",
  ROLE_FILTER: "Filtrar por papel",
  STATUS_FILTER: "Filtrar por status",
  LIST: "Lista de usuários",
  COLUMNS: {
    ROLE,
    STATUS: MESSAGES.LIST.STATUS,
    CREATED_AT: MESSAGES.LIST.CREATED_AT,
    ACTIONS: MESSAGES.LIST.ACTIONS,
  },
  CREATED_AT: MESSAGES.LIST.CREATED_ON,
  YOU: "Você",
  SORT_OPTIONS: {
    NAME_ASC: MESSAGES.SORT_OPTIONS.NAME_ASC,
    NAME_DESC: MESSAGES.SORT_OPTIONS.NAME_DESC,
    EMAIL_ASC: "E-mail (A–Z)",
    NEWEST: MESSAGES.SORT_OPTIONS.NEWEST,
  },
  EMPTY: "Nenhum usuário encontrado",
  CLEAR_FILTERS: MESSAGES.ACTIONS.CLEAR_FILTERS,
  LOAD_FAILED: "Não foi possível carregar os usuários",
  ACTIONS_FOR: MESSAGES.ACTIONS.FOR,
  CHANGE_ROLE: "Alterar papel",
  DISABLE: MESSAGES.ACTIONS.DISABLE,
  ENABLE: MESSAGES.ACTIONS.ENABLE,
  CANCEL: MESSAGES.ACTIONS.CANCEL,
  ROLE_DIALOG: {
    TITLE: (name: string): string => `Alterar papel de ${name}`,
    ROLE,
    SAVE: MESSAGES.ACTIONS.SAVE,
  },
  DISABLE_DIALOG: {
    TITLE: MESSAGES.DIALOGS.DISABLE_TITLE,
    DESCRIPTION: (name: string): string =>
      `${name} perde o acesso imediatamente e a sessão é encerrada.`,
    CONFIRM: MESSAGES.ACTIONS.DISABLE,
  },
  ROLE_CHANGED: (name: string, role: string): string => `Papel alterado: ${name} agora é ${role}`,
  DISABLED: (name: string): string => `Usuário desabilitado: ${name}`,
  ENABLED: (name: string): string => `Usuário habilitado: ${name}`,
} as const;
