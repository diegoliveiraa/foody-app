import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "./validation";

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
  LIST: {
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
