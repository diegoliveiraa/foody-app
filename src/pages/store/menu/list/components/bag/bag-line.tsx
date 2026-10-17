import { Minus, Plus, Trash2 } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/utils/format-money";
import { MENU_MESSAGES } from "../../constants/messages";
import type { BagLine, CartModel } from "../../types";

interface BagLineItemProps {
  line: BagLine;
  cart: CartModel;
}

const LINE_CLASS: string = "flex flex-col gap-2 border-b border-muted py-3 last:border-b-0";

function Amount({ value, className }: { value: number | null; className: string }): JSX.Element {
  if (value === null) {
    return <Skeleton className="h-4 w-16" />;
  }
  return <span className={className}>{formatMoney(value)}</span>;
}

function QuantityStepper({ line, cart }: BagLineItemProps): JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-full border border-input p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={MENU_MESSAGES.BAG.DECREASE(line.name)}
        onClick={(): void => cart.decrease(line.productId)}
        className="rounded-full text-primary"
      >
        <Minus aria-hidden="true" strokeWidth={2.25} />
      </Button>
      <span className="min-w-5 text-center font-semibold">{line.quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={MENU_MESSAGES.BAG.INCREASE(line.name)}
        disabled={!line.canIncrease}
        onClick={(): void => cart.increase(line.productId)}
        className="rounded-full text-primary"
      >
        <Plus aria-hidden="true" strokeWidth={2.25} />
      </Button>
    </div>
  );
}

function AvailableLine({ line, cart }: BagLineItemProps): JSX.Element {
  return (
    <li aria-label={line.name} className={LINE_CLASS}>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold break-words">{line.name}</span>
          {line.unitPrice === null ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-sm text-muted-foreground">
              {MENU_MESSAGES.BAG.EACH(formatMoney(line.unitPrice))}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={MENU_MESSAGES.BAG.REMOVE(line.name)}
          onClick={(): void => cart.remove(line.productId)}
          className="-mt-1.5 -mr-2 text-muted-foreground"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <QuantityStepper line={line} cart={cart} />
        <Amount value={line.subtotal} className="text-[15px] font-semibold" />
      </div>
    </li>
  );
}

function UnavailableLine({ line, cart }: BagLineItemProps): JSX.Element {
  return (
    <li aria-label={line.name} className={LINE_CLASS}>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold break-words text-muted-foreground">
            {line.name}
          </span>
          <span className="text-sm text-muted-foreground">
            {MENU_MESSAGES.BAG.UNAVAILABLE_HINT}
          </span>
        </div>
        <Badge variant="destructive">{MENU_MESSAGES.BAG.UNAVAILABLE}</Badge>
      </div>
      <Button
        type="button"
        variant="outline"
        aria-label={MENU_MESSAGES.BAG.REMOVE(line.name)}
        onClick={(): void => cart.remove(line.productId)}
        className="self-start"
      >
        <Trash2 aria-hidden="true" />
        {MENU_MESSAGES.BAG.REMOVE_UNAVAILABLE}
      </Button>
    </li>
  );
}

export function BagLineItem({ line, cart }: BagLineItemProps): JSX.Element {
  if (!line.available) {
    return <UnavailableLine line={line} cart={cart} />;
  }
  return <AvailableLine line={line} cart={cart} />;
}
