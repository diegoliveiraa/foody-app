import type { ComponentType, JSX } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { HTTP_STATUS } from "@/constants/api";
import { ForbiddenScreen } from "@/pages/errors/forbidden";
import { NotFoundScreen } from "@/pages/errors/not-found";
import { UnexpectedErrorScreen } from "@/pages/errors/unexpected";

const ERROR_SCREENS: Partial<Record<number, ComponentType>> = {
  [HTTP_STATUS.FORBIDDEN]: ForbiddenScreen,
  [HTTP_STATUS.NOT_FOUND]: NotFoundScreen,
};

export function RouteErrorBoundary(): JSX.Element {
  const error: unknown = useRouteError();
  const Screen: ComponentType =
    (isRouteErrorResponse(error) ? ERROR_SCREENS[error.status] : undefined) ??
    UnexpectedErrorScreen;

  return <Screen />;
}
