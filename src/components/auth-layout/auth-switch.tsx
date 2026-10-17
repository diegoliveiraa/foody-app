import type { JSX } from "react";
import { Link } from "react-router";

interface AuthSwitchProps {
  question: string;
  linkLabel: string;
  to: string;
}

export function AuthSwitch({ question, linkLabel, to }: AuthSwitchProps): JSX.Element {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-muted-foreground">
      {question}
      <Link
        to={to}
        className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hover"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
