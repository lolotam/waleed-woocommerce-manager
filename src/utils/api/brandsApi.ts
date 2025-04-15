
/**
 * WooCommerce Brands API (using product tags)
 */
import { woocommerceApi } from "./woocommerceCore";

// Define a type for the params to ensure TypeScript recognizes the properties
interface BrandApiParams {
  [key: string]: string | undefined;
  per_page?: string;
  page?: string;
}

// Using WooCommerce product tags as brands
// This is a common approach when WooCommerce doesn't have a specific "brands" feature
export const brandsApi = {
  getAll: (params: BrandApiParams = {}) => {
    // Ensure we're getting all tags by default for accurate count
    const finalParams = { ...params };
    if (!finalParams.per_page) {
      finalParams.per_page = '100'; // Use maximum allowed per page for better count accuracy
    }
    
    if (!finalParams.page) {
      finalParams.page = '1'; // Default to first page if not specified
    }
    
    // Add logging for debugging
    console.log(`Fetching brands with params:`, finalParams);
    
    return woocommerceApi(`products/tags?${new URLSearchParams(finalParams).toString()}`);
  },
  get: (id: number) => woocommerceApi(`products/tags/${id}`),
  create: (data: any) => woocommerceApi('products/tags', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/tags/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/tags/${id}`, 'DELETE'),
};

export default brandsApi;
