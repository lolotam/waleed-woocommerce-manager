
/**
 * WooCommerce Brands API (using product tags)
 */
import { woocommerceApi } from "./woocommerceCore";
import { toast } from "sonner";

// Define a type for the params to ensure TypeScript recognizes the properties
interface BrandApiParams {
  [key: string]: string | undefined;
  per_page?: string;
  page?: string;
}

// Using WooCommerce product tags as brands
// This is a common approach when WooCommerce doesn't have a specific "brands" feature
export const brandsApi = {
  getAll: async (params: BrandApiParams = {}) => {
    try {
      // Ensure we're getting all tags by default for accurate count
      const finalParams = { ...params };
      if (!finalParams.per_page) {
        finalParams.per_page = '100'; // Use maximum allowed per page for better count accuracy
      }
      
      if (!finalParams.page) {
        finalParams.page = '1'; // Default to first page if not specified
      }
      
      console.log(`Fetching brands with params:`, finalParams);
      
      return await woocommerceApi(`products/tags?${new URLSearchParams(finalParams).toString()}`);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      
      // Enhanced error handling with troubleshooting guidance
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot list resources') ||
          error.message?.includes('401')) {
        
        toast.error('Authentication failed: Insufficient permissions', {
          description: 'Your WooCommerce user needs permission to manage products',
          duration: 8000,
          action: {
            label: 'Troubleshoot',
            onClick: () => {
              toast.message('Troubleshooting Tips', {
                description: 'Check that your user has the Administrator role or has "manage_product_terms" capability',
                duration: 10000,
                action: {
                  label: 'Learn More',
                  onClick: () => window.open('https://woocommerce.github.io/woocommerce-rest-api-docs/?shell#authentication-over-http', '_blank')
                }
              });
            }
          }
        });
      }
      
      throw error;
    }
  },
  
  get: async (id: number) => {
    try {
      return await woocommerceApi(`products/tags/${id}`);
    } catch (error) {
      console.error(`Error fetching brand with ID ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data: any) => {
    try {
      return await woocommerceApi('products/tags', 'POST', data);
    } catch (error) {
      console.error('Error creating brand:', error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot create')) {
        toast.error('Unable to create brand', {
          description: 'Your WooCommerce user needs permission to create product tags',
          duration: 6000
        });
      }
      
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    try {
      return await woocommerceApi(`products/tags/${id}`, 'PUT', data);
    } catch (error) {
      console.error(`Error updating brand ID ${id}:`, error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot edit')) {
        toast.error('Unable to update brand', {
          description: 'Your WooCommerce user needs permission to edit product tags',
          duration: 6000
        });
      }
      
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      return await woocommerceApi(`products/tags/${id}`, 'DELETE');
    } catch (error) {
      console.error(`Error deleting brand ID ${id}:`, error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot delete')) {
        toast.error('Unable to delete brand', {
          description: 'Your WooCommerce user needs permission to delete product tags',
          duration: 6000
        });
      }
      
      throw error;
    }
  }
};

export default brandsApi;
