
/**
 * WooCommerce Products API
 */
import { woocommerceApi, WooCommerceResponse } from "./woocommerceCore";

const productsApi = {
  getAll: (params = {}) => woocommerceApi(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/${id}`),
  create: (data: any) => woocommerceApi('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/${id}`, 'DELETE'),
  // Adding back the getTags method that was removed
  getTags: (params = {}) => woocommerceApi(`products/tags?${new URLSearchParams(params).toString()}`)
};

// Make sure extractDataWithPagination is exported
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
