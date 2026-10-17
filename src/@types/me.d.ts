import type { components } from "./api";

export type MeResponse = components["schemas"]["MeResponse"];

export type MeModule = components["schemas"]["MeModule"];

export type MeScreen = components["schemas"]["MeScreen"];

export type MeUser = components["schemas"]["MeUser"];

export type ScreenAction = MeScreen["actions"][number];
