import { ShoppingBag } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PARENT_PATH } from "@/constants/routes";
import { CHECKOUT_MESSAGES } from "../constants/messages";

export function CheckoutEmpty(): JSX.Element {
  return (
    <EmptyState
      icon={ShoppingBag}
      title={CHECKOUT_MESSAGES.EMPTY}
      description={CHECKOUT_MESSAGES.EMPTY_DESCRIPTION}
    >
      <Button asChild variant="outline">
        <Link to={PARENT_PATH}>{CHECKOUT_MESSAGES.BROWSE_MENU}</Link>
      </Button>
    </EmptyState>
  );
}
