
/**
 * WooCommerce Brands API
 * Supporting both standard product tags and custom product_brand taxonomy
 */
import { woocommerceApi } from "./woocommerceCore";
import { toast } from "sonner";

// Define a type for the params to ensure TypeScript recognizes the properties
interface BrandApiParams {
  [key: string]: string | undefined;
  per_page?: string;
  page?: string;
}

export const brandsApi = {
  getAll: async (params: BrandApiParams = {}) => {
    try {
      // Ensure we're getting brands with valid parameters
      const finalParams = { ...params };
      
      // WooCommerce API limits per_page to 100 maximum
      if (!finalParams.per_page || parseInt(finalParams.per_page) > 100) {
        finalParams.per_page = '100'; // Respect WooCommerce API limit
      }
      
      if (!finalParams.page) {
        finalParams.page = '1'; // Default to first page if not specified
      }
      
      console.log(`Fetching brands with params:`, finalParams);
      
      // Try first with the custom product_brand taxonomy
      try {
        const response = await woocommerceApi(`products/brands?${new URLSearchParams(finalParams).toString()}`);
        console.log('Successfully fetched brands using products/brands endpoint');
        return response;
      } catch (brandError) {
        // If the custom endpoint fails, fallback to the standard product tags
        console.log('Failed to fetch from products/brands endpoint, falling back to product tags:', brandError);
        
        // Check if the error is a 404 (endpoint not found) which would suggest the brand taxonomy isn't available
        if (brandError.message?.includes('404') || brandError.message?.includes('not found')) {
          // Try alternative URL format for custom taxonomy
          try {
            const response = await woocommerceApi(`products/attributes/product_brand/terms?${new URLSearchParams(finalParams).toString()}`);
            console.log('Successfully fetched brands using product_brand taxonomy terms');
            return response;
          } catch (taxonomyError) {
            console.log('Failed to fetch from product_brand taxonomy:', taxonomyError);
            
            // Final fallback to standard product tags
            console.log('Falling back to standard product tags');
            return await woocommerceApi(`products/tags?${new URLSearchParams(finalParams).toString()}`);
          }
        } else {
          // For other errors, just throw
          throw brandError;
        }
      }
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
      } else if (error.message?.includes('per_page')) {
        // Handle specific error related to per_page parameter
        console.error("Per page parameter error:", error);
        toast.error('API parameter error', {
          description: 'The per_page parameter must be between 1 and 100',
          duration: 6000
        });
      }
      
      throw error;
    }
  },
  
  get: async (id: number) => {
    try {
      // Try first with custom product_brand endpoint
      try {
        return await woocommerceApi(`products/brands/${id}`);
      } catch (brandError) {
        // If endpoint not found, try with product_brand taxonomy
        if (brandError.message?.includes('404') || brandError.message?.includes('not found')) {
          try {
            return await woocommerceApi(`products/attributes/product_brand/terms/${id}`);
          } catch (taxonomyError) {
            // Final fallback to standard product tags
            return await woocommerceApi(`products/tags/${id}`);
          }
        } else {
          throw brandError;
        }
      }
    } catch (error) {
      console.error(`Error fetching brand with ID ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data: any) => {
    try {
      // Try first with custom product_brand endpoint
      try {
        return await woocommerceApi('products/brands', 'POST', data);
      } catch (brandError) {
        // If endpoint not found, try with product_brand taxonomy
        if (brandError.message?.includes('404') || brandError.message?.includes('not found')) {
          try {
            return await woocommerceApi('products/attributes/product_brand/terms', 'POST', data);
          } catch (taxonomyError) {
            // Final fallback to standard product tags
            return await woocommerceApi('products/tags', 'POST', data);
          }
        } else {
          throw brandError;
        }
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot create')) {
        toast.error('Unable to create brand', {
          description: 'Your WooCommerce user needs permission to create product brands',
          duration: 6000
        });
      }
      
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    try {
      // Try first with custom product_brand endpoint
      try {
        return await woocommerceApi(`products/brands/${id}`, 'PUT', data);
      } catch (brandError) {
        // If endpoint not found, try with product_brand taxonomy
        if (brandError.message?.includes('404') || brandError.message?.includes('not found')) {
          try {
            return await woocommerceApi(`products/attributes/product_brand/terms/${id}`, 'PUT', data);
          } catch (taxonomyError) {
            // Final fallback to standard product tags
            return await woocommerceApi(`products/tags/${id}`, 'PUT', data);
          }
        } else {
          throw brandError;
        }
      }
    } catch (error) {
      console.error(`Error updating brand ID ${id}:`, error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot edit')) {
        toast.error('Unable to update brand', {
          description: 'Your WooCommerce user needs permission to edit product brands',
          duration: 6000
        });
      }
      
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      // Try first with custom product_brand endpoint
      try {
        return await woocommerceApi(`products/brands/${id}`, 'DELETE');
      } catch (brandError) {
        // If endpoint not found, try with product_brand taxonomy
        if (brandError.message?.includes('404') || brandError.message?.includes('not found')) {
          try {
            return await woocommerceApi(`products/attributes/product_brand/terms/${id}`, 'DELETE');
          } catch (taxonomyError) {
            // Final fallback to standard product tags
            return await woocommerceApi(`products/tags/${id}`, 'DELETE');
          }
        } else {
          throw brandError;
        }
      }
    } catch (error) {
      console.error(`Error deleting brand ID ${id}:`, error);
      
      if (error.message?.includes('authentication failed') || 
          error.message?.includes('cannot delete')) {
        toast.error('Unable to delete brand', {
          description: 'Your WooCommerce user needs permission to delete product brands',
          duration: 6000
        });
      }
      
      throw error;
    }
  }
};

export default brandsApi;
