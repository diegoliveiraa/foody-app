import type { RouteObject } from "react-router";
import { NotFoundScreen } from "./index";

export const notFoundRoute: RouteObject = {
  path: "*",
  Component: NotFoundScreen,
};
