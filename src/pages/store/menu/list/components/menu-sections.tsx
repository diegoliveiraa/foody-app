import { useId, type JSX } from "react";
import type { MenuCategory, MenuProduct } from "@/@types/menu";
import { tileToneOf } from "../utils/tile-tone";
import { ProductCard } from "./product-card";

interface MenuSectionsProps {
  sections: readonly MenuCategory[];
  canOrder: boolean;
  onAdd: (product: MenuProduct) => void;
}

interface MenuSectionProps {
  category: MenuCategory;
  canOrder: boolean;
  onAdd: (product: MenuProduct) => void;
}

function MenuSection({ category, canOrder, onAdd }: MenuSectionProps): JSX.Element {
  const headingId: string = useId();
  const tone: string = tileToneOf(category.id);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <h2 id={headingId} className="text-[19px] font-bold">
        {category.name}
      </h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {category.products.map((product: MenuProduct): JSX.Element => (
          <li key={product.id}>
            <ProductCard product={product} tone={tone} canOrder={canOrder} onAdd={onAdd} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MenuSections({ sections, canOrder, onAdd }: MenuSectionsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((category: MenuCategory): JSX.Element => (
        <MenuSection key={category.id} category={category} canOrder={canOrder} onAdd={onAdd} />
      ))}
    </div>
  );
}
