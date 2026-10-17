export const ROUTE_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export const REDIRECT_TO_PARAM: string = "redirectTo";

export const ROOT_ROUTE_ID: string = "root";

export const PATH_SEPARATOR: string = "/";

export const EMPTY_PATH: string = "";

export const ID_PARAM = "id" as const;

export const ID_SEGMENT: string = `:${ID_PARAM}`;

export const PARENT_PATH: string = "..";
