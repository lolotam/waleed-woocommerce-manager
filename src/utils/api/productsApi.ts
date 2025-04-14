
/**
 * WooCommerce Products API
 */
import { woocommerceApi, WooCommerceResponse } from "./woocommerceCore";
import { Product } from "@/types/product";
import { ProductTag } from "@/types/product";

const productsApi = {
  getAll: (params = {}) => woocommerceApi<Product[]>(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi<Product>(`products/${id}`),
  create: (data: any) => woocommerceApi<Product>('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi<Product>(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi<Product>(`products/${id}`, 'DELETE'),
  getTags: (params = {}) => woocommerceApi<ProductTag[]>(`products/tags?${new URLSearchParams(params).toString()}`)
};

// Extract data helper function with proper typing
export const extractData = <T>(response: WooCommerceResponse<T>): T => {
  return response.data;
};

export const extractDataWithPagination = <T>(
  response: WooCommerceResponse<T>
): { data: T; totalItems: number; totalPages: number } => {
  return {
    data: response.data,
    totalItems: response.totalItems || 0,
    totalPages: response.totalPages || 0,
  };
};

export default productsApi;
