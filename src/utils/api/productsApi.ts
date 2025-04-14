
/**
 * WooCommerce Products API
 */
import { WooCommerceResponse, woocommerceApi } from "./woocommerceCore";
import { Product } from "@/types/product";

export const productsApi = {
  getAll: (params = {}) => woocommerceApi<Product[]>(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi<Product>(`products/${id}`),
  create: (data: any) => woocommerceApi<Product>('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi<Product>(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi<Product>(`products/${id}`, 'DELETE'),
  // SEO metadata
  updateSeoMeta: (id: number, data: any) => woocommerceApi(`products/${id}/meta`, 'PUT', data),
  // Tags
  getTags: (params = {}) => woocommerceApi(`products/tags?${new URLSearchParams(params).toString()}`),
  createTag: (data: any) => woocommerceApi('products/tags', 'POST', data)
};

export default productsApi;
