import type { JSX } from "react";
import { MESSAGES } from "@/constants/messages";

interface DocumentTitleProps {
  label?: string;
}

export function DocumentTitle({ label }: DocumentTitleProps): JSX.Element {
  return <title>{MESSAGES.DOCUMENT_TITLE(label)}</title>;
}
