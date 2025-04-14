
/**
 * WooCommerce Categories API
 */
import { woocommerceApi, WooCommerceResponse } from "./woocommerceCore";
import { Category } from "@/types/category";

export const categoriesApi = {
  getAll: (params = {}) => woocommerceApi<Category[]>(`products/categories?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi<Category>(`products/categories/${id}`),
  create: (data: any) => woocommerceApi<Category>('products/categories', 'POST', data),
  update: (id: number, data: any) => woocommerceApi<Category>(`products/categories/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi<Category>(`products/categories/${id}`, 'DELETE'),
};

export default categoriesApi;
