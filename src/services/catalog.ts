import type { FetchArgs, TagDescription } from "@reduxjs/toolkit/query";
import type {
  Category,
  CategoryRequest,
  ListProductsParams,
  Product,
  ProductPage,
  ProductRequest,
  UpdateCategoryArgs,
  UpdateProductArgs,
} from "@/@types/catalog";
import { API_PATHS, CATEGORY_PATHS, HTTP_METHODS, PRODUCT_PATHS } from "@/constants/api";
import { api } from "./api";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "./cache-tags";

type CatalogTag = TagDescription<CacheTag>;

const CATEGORY_LIST_TAG: CatalogTag = { type: CACHE_TAGS.CATEGORY, id: LIST_ID };

const PRODUCT_LIST_TAG: CatalogTag = { type: CACHE_TAGS.PRODUCT, id: LIST_ID };

const MENU_TAG: CatalogTag = CACHE_TAGS.MENU;

function categoryTags(id: Category["id"]): CatalogTag[] {
  return [{ type: CACHE_TAGS.CATEGORY, id }, CATEGORY_LIST_TAG, MENU_TAG];
}

function productTags(id: Product["id"]): CatalogTag[] {
  return [{ type: CACHE_TAGS.PRODUCT, id }, PRODUCT_LIST_TAG, MENU_TAG];
}

function postTo(url: string): FetchArgs {
  return { url, method: HTTP_METHODS.POST };
}

export const catalogApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCategories: build.query<Category[], void>({
      query: (): string => API_PATHS.CATALOG_CATEGORIES,
      providesTags: (categories: Category[] = []): CatalogTag[] => [
        CATEGORY_LIST_TAG,
        ...categories.map((category: Category): CatalogTag => ({
          type: CACHE_TAGS.CATEGORY,
          id: category.id,
        })),
      ],
    }),
    createCategory: build.mutation<Category, CategoryRequest>({
      query: (body: CategoryRequest): FetchArgs => ({
        url: API_PATHS.CATALOG_CATEGORIES,
        method: HTTP_METHODS.POST,
        body,
      }),
      invalidatesTags: (): CatalogTag[] => [CATEGORY_LIST_TAG, MENU_TAG],
    }),
    updateCategory: build.mutation<Category, UpdateCategoryArgs>({
      query: ({ id, ...body }: UpdateCategoryArgs): FetchArgs => ({
        url: CATEGORY_PATHS.ONE(id),
        method: HTTP_METHODS.PUT,
        body,
      }),
      invalidatesTags: (_category, _error, { id }: UpdateCategoryArgs): CatalogTag[] => [
        ...categoryTags(id),
        PRODUCT_LIST_TAG,
      ],
    }),
    disableCategory: build.mutation<Category, Category["id"]>({
      query: (id: Category["id"]): FetchArgs => postTo(CATEGORY_PATHS.DISABLE(id)),
      invalidatesTags: (_category, _error, id: Category["id"]): CatalogTag[] => categoryTags(id),
    }),
    enableCategory: build.mutation<Category, Category["id"]>({
      query: (id: Category["id"]): FetchArgs => postTo(CATEGORY_PATHS.ENABLE(id)),
      invalidatesTags: (_category, _error, id: Category["id"]): CatalogTag[] => categoryTags(id),
    }),
    deleteCategory: build.mutation<null, Category["id"]>({
      query: (id: Category["id"]): FetchArgs => ({
        url: CATEGORY_PATHS.ONE(id),
        method: HTTP_METHODS.DELETE,
      }),
      invalidatesTags: (_result, _error, id: Category["id"]): CatalogTag[] => categoryTags(id),
    }),
    listProducts: build.query<ProductPage, ListProductsParams>({
      query: (params: ListProductsParams): FetchArgs => ({
        url: API_PATHS.CATALOG_PRODUCTS,
        params,
      }),
      providesTags: (page: ProductPage | undefined): CatalogTag[] => [
        PRODUCT_LIST_TAG,
        ...(page?.data ?? []).map((product: Product): CatalogTag => ({
          type: CACHE_TAGS.PRODUCT,
          id: product.id,
        })),
      ],
    }),
    createProduct: build.mutation<Product, ProductRequest>({
      query: (body: ProductRequest): FetchArgs => ({
        url: API_PATHS.CATALOG_PRODUCTS,
        method: HTTP_METHODS.POST,
        body,
      }),
      invalidatesTags: (): CatalogTag[] => [PRODUCT_LIST_TAG, CATEGORY_LIST_TAG, MENU_TAG],
    }),
    updateProduct: build.mutation<Product, UpdateProductArgs>({
      query: ({ id, ...body }: UpdateProductArgs): FetchArgs => ({
        url: PRODUCT_PATHS.ONE(id),
        method: HTTP_METHODS.PUT,
        body,
      }),
      invalidatesTags: (_product, _error, { id }: UpdateProductArgs): CatalogTag[] => [
        ...productTags(id),
        CATEGORY_LIST_TAG,
      ],
    }),
    disableProduct: build.mutation<Product, Product["id"]>({
      query: (id: Product["id"]): FetchArgs => postTo(PRODUCT_PATHS.DISABLE(id)),
      invalidatesTags: (_product, _error, id: Product["id"]): CatalogTag[] => productTags(id),
    }),
    enableProduct: build.mutation<Product, Product["id"]>({
      query: (id: Product["id"]): FetchArgs => postTo(PRODUCT_PATHS.ENABLE(id)),
      invalidatesTags: (_product, _error, id: Product["id"]): CatalogTag[] => productTags(id),
    }),
    deleteProduct: build.mutation<null, Product["id"]>({
      query: (id: Product["id"]): FetchArgs => ({
        url: PRODUCT_PATHS.ONE(id),
        method: HTTP_METHODS.DELETE,
      }),
      invalidatesTags: (_result, _error, id: Product["id"]): CatalogTag[] => [
        ...productTags(id),
        CATEGORY_LIST_TAG,
      ],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDisableCategoryMutation,
  useEnableCategoryMutation,
  useDeleteCategoryMutation,
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDisableProductMutation,
  useEnableProductMutation,
  useDeleteProductMutation,
} = catalogApi;
