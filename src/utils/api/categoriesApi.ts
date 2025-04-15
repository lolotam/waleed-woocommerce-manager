
/**
 * WooCommerce Categories API
 */
import { woocommerceApi, WooCommerceResponse } from "./woocommerceCore";
import { Category } from "@/types/category";

// Define a type for the params to ensure TypeScript recognizes the properties
interface CategoryApiParams {
  [key: string]: string | undefined;
  per_page?: string;
  page?: string;
}

export const categoriesApi = {
  getAll: (params: CategoryApiParams = {}) => {
    // Ensure we're using pagination correctly
    const finalParams = { ...params };
    if (!finalParams.per_page) {
      finalParams.per_page = '100'; // Use maximum allowed per page
    }
    
    if (!finalParams.page) {
      finalParams.page = '1'; // Default to first page if not specified
    }
    
    // Add logging for debugging
    console.log(`Fetching categories with params:`, finalParams);
    
    return woocommerceApi<Category[]>(`products/categories?${new URLSearchParams(finalParams).toString()}`);
  },
  get: (id: number) => woocommerceApi<Category>(`products/categories/${id}`),
  create: (data: any) => woocommerceApi<Category>('products/categories', 'POST', data),
  update: (id: number, data: any) => woocommerceApi<Category>(`products/categories/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi<Category>(`products/categories/${id}`, 'DELETE'),
};

export default categoriesApi;
