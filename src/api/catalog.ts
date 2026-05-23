import { apiGet } from './client';
import type { Category, Product, ProductsResponse } from './types';

export const getCategories = (): Promise<Category[]> =>
  apiGet<Category[]>('/categories');

export const getProducts = (params: {
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  storeId?: string;
  brand?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductsResponse> => {
  const p: Record<string, string> = {};
  if (params.categoryId) p.categoryId = params.categoryId;
  if (params.search) p.search = params.search;
  if (params.inStock) p.inStock = 'true';
  if (params.storeId) p.storeId = params.storeId;
  if (params.brand) p.brand = params.brand;
  if (params.limit) p.limit = String(params.limit);
  if (params.offset) p.offset = String(params.offset);
  return apiGet<ProductsResponse>('/products', p);
};

export const getProduct = (id: string): Promise<Product> =>
  apiGet<Product>(`/products/${id}`);

export const getStock = (productId: string): Promise<{ shopId: string; quantity: number }[]> =>
  apiGet(`/stock`, { productId });

export const getBrands = (categoryId: string): Promise<{ name: string }[]> =>
  apiGet('/brands', { categoryId });

export const getSubcategories = (categoryId: string): Promise<{ id: string; title: string; slug: string }[]> =>
  apiGet('/subcategories', { categoryId });
