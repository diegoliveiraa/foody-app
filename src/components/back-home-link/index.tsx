import type { JSX } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { ROUTE_PATHS } from "@/constants/routes";

export function BackHomeLink(): JSX.Element {
  return (
    <Button asChild variant="outline">
      <Link to={ROUTE_PATHS.HOME}>{MESSAGES.BACK_HOME}</Link>
    </Button>
  );
}
