import { cn } from "cn";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { JSX } from "react";
import type { MenuProduct } from "@/@types/menu";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/utils/format-money";
import { MENU_MESSAGES } from "../constants/messages";

interface ProductCardProps {
  product: MenuProduct;
  tone: string;
  canOrder: boolean;
  onAdd: (product: MenuProduct) => void;
}

export function ProductCard({ product, tone, canOrder, onAdd }: ProductCardProps): JSX.Element {
  return (
    <article
      aria-label={product.name}
      className="flex h-full gap-3.5 rounded-[18px] border bg-card p-3.5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-sans text-base font-semibold break-words">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {product.description}
          </p>
        )}
        <span className="mt-auto pt-1.5 text-base font-bold">{formatMoney(product.price)}</span>
      </div>
      <div className="relative size-23 shrink-0">
        <div
          aria-hidden="true"
          className={cn("flex size-full items-center justify-center rounded-2xl", tone)}
        >
          <UtensilsCrossed className="size-9" strokeWidth={1.5} />
        </div>
        {canOrder && (
          <Button
            type="button"
            size="icon"
            aria-label={MENU_MESSAGES.ADD(product.name)}
            onClick={(): void => onAdd(product)}
            className="absolute -right-1.5 -bottom-1.5 rounded-full border-3 border-card shadow-sm [&_svg:not([class*='size-'])]:size-5"
          >
            <Plus aria-hidden="true" strokeWidth={2.25} />
          </Button>
        )}
      </div>
    </article>
  );
}
