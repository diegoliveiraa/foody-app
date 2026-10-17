import type { RouteObject } from "react-router";
import { notFoundRoute } from "./not-found/not-found.routes";

export const errorsRoute: RouteObject = {
  children: [notFoundRoute],
};
