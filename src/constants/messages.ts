import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  DISPLAY_ORDER_MAX,
  DISPLAY_ORDER_MIN,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MAX,
} from "./catalog";
import { formatMoney } from "@/utils/format-money";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "./validation";

const CREATED_AT: string = "Criado em";

export const MESSAGES = {
  BRAND: "foody",
  TAGLINE: "Comida boa, do nosso fogão até a sua porta.",
  LOADING: "Carregando",
  CLOSE: "Fechar",
  FIELDS: {
    NAME: "Nome",
    EMAIL: "E-mail",
    PASSWORD: "Senha",
  },
  VALIDATION: {
    NAME_LENGTH: `Informe um nome entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres`,
    EMAIL_INVALID: "Informe um e-mail válido",
    EMAIL_TOO_LONG: "O e-mail está longo demais",
    PASSWORD_REQUIRED: "Informe a senha",
    PASSWORD_TOO_SHORT: `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    PASSWORD_TOO_LONG: "A senha está longa demais; acentos e emojis ocupam mais espaço",
    ROLE_REQUIRED: "Escolha um papel",
    PRODUCT_NAME_LENGTH: `Informe um nome entre ${PRODUCT_NAME_MIN_LENGTH} e ${PRODUCT_NAME_MAX_LENGTH} caracteres`,
    DESCRIPTION_TOO_LONG: `A descrição pode ter até ${PRODUCT_DESCRIPTION_MAX_LENGTH} caracteres`,
    PRICE_REQUIRED: "Informe o preço",
    PRICE_INVALID: "Informe o preço com até duas casas decimais, como 34,90",
    PRICE_POSITIVE: "O preço precisa ser maior que zero",
    PRICE_TOO_HIGH: `O preço máximo é ${formatMoney(PRODUCT_PRICE_MAX)}`,
    CATEGORY_REQUIRED: "Escolha uma categoria",
    CATEGORY_NAME_LENGTH: `Informe um nome entre ${CATEGORY_NAME_MIN_LENGTH} e ${CATEGORY_NAME_MAX_LENGTH} caracteres`,
    DISPLAY_ORDER_RANGE: `Informe um número inteiro de ${DISPLAY_ORDER_MIN} a ${DISPLAY_ORDER_MAX}`,
  },
  LOGIN: {
    TITLE: "Entrar",
    SUBMIT: "Entrar",
    NO_ACCOUNT: "Ainda não tem conta?",
    REGISTER_LINK: "Criar conta",
    WAIT: (seconds: number): string => `Tente de novo em ${seconds} s`,
  },
  REGISTER: {
    TITLE: "Criar conta",
    SUBMIT: "Criar conta",
    HAS_ACCOUNT: "Já tem conta?",
    LOGIN_LINK: "Entrar",
  },
  SESSION: {
    EXPIRED: "Sua sessão expirou, entre novamente",
  },
  ERRORS: {
    RATE_LIMITED: (seconds: number): string => `Muitas tentativas. Tente de novo em ${seconds} s`,
    UNAVAILABLE: "Não foi possível falar com o servidor. Tente novamente.",
  },
  NAVIGATION: {
    MAIN: "Navegação principal",
    ACCOUNT: "Conta",
    ACCOUNT_DESCRIPTION: "Dados da sua conta",
    LOGOUT: "Sair",
    OPEN_MENU: "Abrir menu",
    MENU_TITLE: "Menu",
    MENU_DESCRIPTION: "Telas que você pode abrir",
    TOGGLE_SIDEBAR: "Mostrar ou esconder o menu",
  },
  ACTIONS: {
    CANCEL: "Cancelar",
    SAVE: "Salvar",
    EDIT: "Editar",
    DELETE: "Excluir",
    DISABLE: "Desabilitar",
    ENABLE: "Habilitar",
    DISABLE_INSTEAD: "Desabilitar em vez disso",
    CLEAR_FILTERS: "Limpar filtros",
    FOR: (name: string): string => `Ações para ${name}`,
  },
  DIALOGS: {
    EDIT_TITLE: (name: string): string => `Editar ${name}`,
    DISABLE_TITLE: (name: string): string => `Desabilitar ${name}?`,
    DELETE_TITLE: (name: string): string => `Excluir ${name}?`,
    CANNOT_UNDO: "Esta ação não pode ser desfeita.",
  },
  STATUS_LABELS: {
    ACTIVE: "Ativo",
    DISABLED: "Desabilitado",
  },
  STATUS_FILTER_LABELS: {
    ALL: "Todos",
    ACTIVE: "Ativos",
    DISABLED: "Desabilitados",
  },
  LIST: {
    STATUS: "Status",
    CREATED_AT,
    ACTIONS: "Ações",
    CREATED_ON: (date: string): string => `${CREATED_AT} ${date}`,
    PAGINATION: "Paginação",
    PAGE_SIZE: "Itens por página",
    PREVIOUS_PAGE: "Página anterior",
    NEXT_PAGE: "Próxima página",
    PAGE_OF: (page: number, totalPages: number): string => `Página ${page} de ${totalPages}`,
    RANGE: (first: number, last: number, total: number): string => `${first}–${last} de ${total}`,
  },
  SCREEN_PLACEHOLDER: {
    TITLE: "Esta tela ainda está sendo preparada",
  },
  FORBIDDEN: {
    TITLE: "Acesso negado",
    DESCRIPTION: "Sua conta não tem acesso a esta tela.",
  },
  NOT_FOUND: {
    TITLE: "Página não encontrada",
    DESCRIPTION: "O endereço que você abriu não existe.",
  },
  UNEXPECTED: {
    TITLE: "Algo deu errado",
    DESCRIPTION: "Não foi possível carregar o Foody agora.",
    RETRY: "Tentar novamente",
  },
  BACK_HOME: "Voltar ao início",
} as const;
