import { CircleAlert } from "lucide-react";
import type { JSX } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormAlertProps {
  message?: string;
}

export function FormAlert({ message }: FormAlertProps): JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
