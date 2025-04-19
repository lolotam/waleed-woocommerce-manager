
import { toast } from "sonner";
import { woocommerceApi } from "./woocommerceCore";

// Helper function to extract data with pagination
export const extractDataWithPagination = (response: any) => {
  return {
    products: response.data,
    totalItems: response.totalItems || 0,
    totalPages: response.totalPages || 0
  };
};

// Helper function to extract data without pagination
export const extractData = (response: any) => {
  return response.data;
};

// Get all products with pagination
export const getProducts = async (
  page: number = 1,
  perPage: number = 10,
  params = {}
) => {
  try {
    const response = await woocommerceApi('products', 'GET', null, {
      page,
      per_page: perPage,
      ...params
    });
    
    return {
      products: response.data,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 0
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProduct = async (id: number) => {
  try {
    const response = await woocommerceApi(`products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Update a product SEO fields (meta title, meta description, etc)
export const updateProductSeo = async (productId: number | string, seoData: any) => {
  try {
    // Extract SEO fields from the AI response
    const updateData: any = {};
    
    // Map common SEO fields
    if (seoData.meta_title || seoData.metaTitle) {
      updateData.meta_title = seoData.meta_title || seoData.metaTitle;
    }
    
    if (seoData.meta_description || seoData.metaDescription) {
      updateData.meta_description = seoData.meta_description || seoData.metaDescription;
    }
    
    // Handle yoast SEO specific fields if they exist
    if (seoData.yoast_wpseo_title || seoData.yoastTitle) {
      updateData.yoast_wpseo_title = seoData.yoast_wpseo_title || seoData.yoastTitle;
    }
    
    if (seoData.yoast_wpseo_metadesc || seoData.yoastDescription) {
      updateData.yoast_wpseo_metadesc = seoData.yoast_wpseo_metadesc || seoData.yoastDescription;
    }
    
    // Handle focus keywords
    if (seoData.focus_keyword || seoData.focusKeyword) {
      updateData.yoast_wpseo_focuskw = seoData.focus_keyword || seoData.focusKeyword;
    }
    
    // Handle slug/permalink if provided
    if (seoData.slug) {
      updateData.slug = seoData.slug;
    }
    
    // Handle general product data updates
    if (seoData.short_description || seoData.shortDescription) {
      updateData.short_description = seoData.short_description || seoData.shortDescription;
    }
    
    if (seoData.description) {
      updateData.description = seoData.description;
    }
    
    // Add meta_data array for custom fields if needed
    if (Object.keys(seoData).some(key => key.startsWith('custom_') || key.startsWith('meta_'))) {
      updateData.meta_data = [];
      
      Object.keys(seoData).forEach(key => {
        if (key.startsWith('custom_') || key.startsWith('meta_')) {
          updateData.meta_data.push({
            key: key.replace('custom_', ''),
            value: seoData[key]
          });
        }
      });
    }
    
    console.log('Updating product with SEO data:', updateData);
    
    // Make the actual API call to WooCommerce
    const response = await woocommerceApi(`products/${productId}`, 'PUT', updateData);
    
    console.log('Product updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId} SEO:`, error);
    throw error;
  }
};

// Create a default export for the productsApi
const productsApi = {
  getProducts,
  getProduct,
  updateProductSeo
};

export default productsApi;
