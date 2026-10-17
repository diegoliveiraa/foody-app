import type { UserRole, UserStatus } from "@/@types/users";
import { USER_ROLES, USER_STATUSES } from "@/constants/users";
import type { RoleFilter, StatusFilter } from "../filter/types";
import { ALL_FILTER } from "./index";

const ROLE: string = "Papel";

const DISABLE: string = "Desabilitar";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.CUSTOMER]: "Cliente",
  [USER_ROLES.STAFF]: "Equipe",
  [USER_ROLES.ADMIN]: "Administrador",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.ACTIVE]: "Ativo",
  [USER_STATUSES.DISABLED]: "Desabilitado",
};

export const USER_STATUS_FILTER_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.ACTIVE]: "Ativos",
  [USER_STATUSES.DISABLED]: "Desabilitados",
};

export const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  [ALL_FILTER]: "Todos os papéis",
  ...USER_ROLE_LABELS,
};

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  [ALL_FILTER]: "Todos",
  ...USER_STATUS_FILTER_LABELS,
};

export const USERS_MESSAGES = {
  SEARCH: "Buscar por nome ou e-mail",
  ROLE_FILTER: "Filtrar por papel",
  STATUS_FILTER: "Filtrar por status",
  LIST: "Lista de usuários",
  COLUMNS: {
    ROLE,
    STATUS: "Status",
    CREATED_AT: "Criado em",
    ACTIONS: "Ações",
  },
  CREATED_AT: (date: string): string => `Criado em ${date}`,
  YOU: "Você",
  EMPTY: "Nenhum usuário encontrado",
  CLEAR_FILTERS: "Limpar filtros",
  LOAD_FAILED: "Não foi possível carregar os usuários",
  ACTIONS_FOR: (name: string): string => `Ações para ${name}`,
  CHANGE_ROLE: "Alterar papel",
  DISABLE,
  ENABLE: "Habilitar",
  CANCEL: "Cancelar",
  ROLE_DIALOG: {
    TITLE: (name: string): string => `Alterar papel de ${name}`,
    ROLE,
    SAVE: "Salvar",
  },
  DISABLE_DIALOG: {
    TITLE: (name: string): string => `Desabilitar ${name}?`,
    DESCRIPTION: (name: string): string => `${name} perde o acesso imediatamente e é desconectado.`,
    CONFIRM: DISABLE,
  },
  ROLE_CHANGED: (name: string, role: string): string => `Papel de ${name} alterado para ${role}`,
  DISABLED: (name: string): string => `${name} foi desabilitado`,
  ENABLED: (name: string): string => `${name} foi habilitado`,
} as const;
