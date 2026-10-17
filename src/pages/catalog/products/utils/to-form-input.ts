import type { Product } from "@/@types/catalog";
import { EMPTY_TEXT } from "@/constants/validation";
import type { ProductFormInput } from "@/services/validation-schemas/product";
import { formatDecimalInput } from "@/utils/format-money";

export const EMPTY_PRODUCT_FORM: ProductFormInput = {
  name: EMPTY_TEXT,
  description: EMPTY_TEXT,
  price: EMPTY_TEXT,
  categoryId: EMPTY_TEXT,
};

export function toProductFormInput(product: Product): ProductFormInput {
  return {
    name: product.name,
    description: product.description ?? EMPTY_TEXT,
    price: formatDecimalInput(product.price),
    categoryId: product.category.id,
  };
}
