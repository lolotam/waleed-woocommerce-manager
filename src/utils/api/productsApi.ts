
/**
 * WooCommerce Products API
 */
import { woocommerceApi } from "./woocommerceCore";

export const productsApi = {
  getAll: (params = {}) => woocommerceApi(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/${id}`),
  create: (data: any) => woocommerceApi('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/${id}`, 'DELETE'),
  // SEO metadata
  updateSeoMeta: (id: number, data: any) => woocommerceApi(`products/${id}/meta`, 'PUT', data),
  // Tags
  getTags: (params = {}) => woocommerceApi(`products/tags?${new URLSearchParams(params).toString()}`),
  createTag: (data: any) => woocommerceApi('products/tags', 'POST', data)
};

export default productsApi;
