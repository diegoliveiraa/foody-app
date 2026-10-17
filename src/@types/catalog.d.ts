import type { components, operations } from "./api";

export type Category = components["schemas"]["CategoryResponse"];

export type CategoryRequest = components["schemas"]["CategoryRequest"];

export type Product = components["schemas"]["ProductResponse"];

export type ProductPage = components["schemas"]["PageResponseProductResponse"];

export type ProductRequest = components["schemas"]["ProductRequest"];

export type ProductCategory = components["schemas"]["ProductCategory"];

export type CatalogStatus = Product["status"];

export type CatalogPath = operations["productUpdate"]["parameters"]["path"];

export type UpdateProductArgs = CatalogPath & ProductRequest;

export type UpdateCategoryArgs = CatalogPath & CategoryRequest;

export type ListProductsParams = NonNullable<operations["productList"]["parameters"]["query"]>;
