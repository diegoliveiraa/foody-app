import type { JSX } from "react";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { TopProductRow } from "../types";
import { DashboardSection } from "./dashboard-section";
import { EmptySectionNote } from "./empty-section-note";

function ProductList({ products }: { products: readonly TopProductRow[] }): JSX.Element {
  return (
    <ol className="flex flex-col gap-2.5">
      {products.map((product: TopProductRow): JSX.Element => (
        <li key={product.productId} className="flex items-center gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-secondary text-[13px] font-bold text-secondary-foreground"
          >
            {product.rank}
          </span>
          <span className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere]">
            {product.name}
          </span>
          <span className="shrink-0 text-muted-foreground">{product.units}</span>
          <span className="shrink-0 text-right font-bold">{product.revenue}</span>
        </li>
      ))}
    </ol>
  );
}

export function TopProducts({ products }: { products: readonly TopProductRow[] }): JSX.Element {
  return (
    <DashboardSection title={DASHBOARD_MESSAGES.TOP_PRODUCTS}>
      {products.length === 0 ? (
        <EmptySectionNote>{DASHBOARD_MESSAGES.NO_DELIVERED_ORDERS}</EmptySectionNote>
      ) : (
        <ProductList products={products} />
      )}
    </DashboardSection>
  );
}
