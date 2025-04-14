
/**
 * WooCommerce Categories API
 */
import { woocommerceApi } from "./woocommerceCore";

export const categoriesApi = {
  getAll: (params = {}) => woocommerceApi(`products/categories?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/categories/${id}`),
  create: (data: any) => woocommerceApi('products/categories', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/categories/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/categories/${id}`, 'DELETE'),
};

export default categoriesApi;
