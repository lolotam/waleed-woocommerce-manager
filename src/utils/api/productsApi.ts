
import { woocommerceApi } from './woocommerceCore';

// Get all products
export const getProducts = async (params?: any) => {
  return woocommerceApi('products', 'GET', null, params);
};

// Get a specific product
export const getProduct = async (id: number) => {
  return woocommerceApi(`products/${id}`);
};

// Create a new product
export const createProduct = async (data: any) => {
  return woocommerceApi('products', 'POST', data);
};

// Update a product
export const updateProduct = async (id: number, data: any) => {
  return woocommerceApi(`products/${id}`, 'PUT', data);
};

// Delete a product
export const deleteProduct = async (id: number) => {
  return woocommerceApi(`products/${id}`, 'DELETE');
};

// Function to get product tags
export const getTags = async (params?: any) => {
  return woocommerceApi('products/tags', 'GET', null, params);
};

// Update product SEO data
export const updateProductSeo = async (id: number | string, seoData: any) => {
  interface ProductData {
    meta_data: any[];
    short_description?: string;
    description?: string;
    tags?: number[];
  }
  
  const data: ProductData = {
    meta_data: []
  };
  
  // Add meta description if available
  if (seoData.meta_description) {
    data.meta_data.push({
      key: '_yoast_wpseo_metadesc',
      value: seoData.meta_description
    });
  }
  
  // Add meta title if available
  if (seoData.meta_title) {
    data.meta_data.push({
      key: '_yoast_wpseo_title',
      value: seoData.meta_title
    });
  }
  
  // Add focus keyword if available
  if (seoData.keywords) {
    data.meta_data.push({
      key: '_yoast_wpseo_focuskw',
      value: seoData.keywords.split(',')[0].trim()
    });
  }
  
  // Add short description if available
  if (seoData.short_description) {
    data.short_description = seoData.short_description;
  }
  
  // Add long description if available
  if (seoData.long_description) {
    data.description = seoData.long_description;
  }
  
  // Add tags if available
  if (seoData.tags && Array.isArray(seoData.tags) && seoData.tags.length > 0) {
    // First get existing tags or create new ones
    const tagPromises = seoData.tags.map(async (tagName: string) => {
      try {
        // Check if tag exists
        const existingTags = await woocommerceApi('products/tags', 'GET', null, { search: tagName });
        
        if (existingTags.data.length > 0) {
          return existingTags.data[0].id;
        } else {
          // Create new tag
          const newTag = await woocommerceApi('products/tags', 'POST', { name: tagName });
          return newTag.data.id;
        }
      } catch (error) {
        console.error(`Failed to process tag ${tagName}:`, error);
        return null;
      }
    });
    
    // Wait for all tag operations to complete
    const tagIds = await Promise.all(tagPromises);
    data.tags = tagIds.filter(id => id !== null);
  }
  
  // Add image SEO data if available
  if (seoData.image_seo) {
    // Get product data to check for featured image
    const product = await woocommerceApi(`products/${id}`);
    
    if (product.data.images && product.data.images.length > 0) {
      const imageId = product.data.images[0].id;
      
      // Update image with SEO data
      await woocommerceApi(`products/${id}/images/${imageId}`, 'PUT', {
        alt: seoData.image_seo.alt_text || '',
        title: seoData.image_seo.title || '',
        caption: seoData.image_seo.caption || '',
        description: seoData.image_seo.description || ''
      });
    }
  }
  
  // Update the product with the processed data
  return woocommerceApi(`products/${id}`, 'PUT', data);
};

// Update product fragrance SEO data - specialized for fragrance products
export const updateFragranceSeoData = async (id: number | string, fragranceSeoData: any) => {
  interface ProductData {
    meta_data: any[];
    short_description?: string;
    description?: string;
    tags?: number[];
  }
  
  const data: ProductData = {
    meta_data: []
  };
  
  // Add meta description if available
  if (fragranceSeoData.meta_description) {
    data.meta_data.push({
      key: '_yoast_wpseo_metadesc',
      value: fragranceSeoData.meta_description
    });
  }
  
  // Add SEO title if available
  if (fragranceSeoData.seo_title) {
    data.meta_data.push({
      key: '_yoast_wpseo_title',
      value: fragranceSeoData.seo_title
    });
  }
  
  // Add focus keywords if available
  if (fragranceSeoData.focus_keywords) {
    data.meta_data.push({
      key: '_yoast_wpseo_focuskw',
      value: fragranceSeoData.focus_keywords.split(',')[0].trim()
    });
    
    // Store all focus keywords
    data.meta_data.push({
      key: '_fragrance_focus_keywords',
      value: fragranceSeoData.focus_keywords
    });
  }
  
  // Add short description if available
  if (fragranceSeoData.short_description) {
    data.short_description = fragranceSeoData.short_description;
  }
  
  // Add long description if available
  if (fragranceSeoData.product_description) {
    data.description = fragranceSeoData.product_description;
  }
  
  // Add SEO tags if available
  if (fragranceSeoData.seo_tags && typeof fragranceSeoData.seo_tags === 'string') {
    const tagNames = fragranceSeoData.seo_tags.split(',').map((tag: string) => tag.trim());
    
    // First get existing tags or create new ones
    const tagPromises = tagNames.map(async (tagName: string) => {
      try {
        // Check if tag exists
        const existingTags = await woocommerceApi('products/tags', 'GET', null, { search: tagName });
        
        if (existingTags.data.length > 0) {
          return existingTags.data[0].id;
        } else {
          // Create new tag
          const newTag = await woocommerceApi('products/tags', 'POST', { name: tagName });
          return newTag.data.id;
        }
      } catch (error) {
        console.error(`Failed to process tag ${tagName}:`, error);
        return null;
      }
    });
    
    // Wait for all tag operations to complete
    const tagIds = await Promise.all(tagPromises);
    data.tags = tagIds.filter(id => id !== null);
  }
  
  // Add image SEO data if available
  if (fragranceSeoData.alt_text || fragranceSeoData.image_title || 
      fragranceSeoData.image_caption || fragranceSeoData.image_description) {
    // Get product data to check for featured image
    const product = await woocommerceApi(`products/${id}`);
    
    if (product.data.images && product.data.images.length > 0) {
      const imageId = product.data.images[0].id;
      
      // Update image with SEO data
      await woocommerceApi(`products/${id}/images/${imageId}`, 'PUT', {
        alt: fragranceSeoData.alt_text || '',
        title: fragranceSeoData.image_title || '',
        caption: fragranceSeoData.image_caption || '',
        description: fragranceSeoData.image_description || ''
      });
    }
  }
  
  // Update the product with the processed data
  return woocommerceApi(`products/${id}`, 'PUT', data);
};

// Batch update products
export const batchUpdateProducts = async (data: any) => {
  return woocommerceApi('products/batch', 'POST', data);
};

// Helper functions for pagination and data extraction - updated to remove generic type parameters
export const extractData = (response: any) => {
  return response.data;
};

export const extractDataWithPagination = (response: any) => {
  return {
    data: response.data,
    totalItems: response.totalItems,
    totalPages: response.totalPages
  };
};

// Create aliases for functions to match expected API in other files
const productsApi = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductSeo,
  updateFragranceSeoData,
  batchUpdateProducts,
  getTags,
  // Add aliases used in other files
  getAll: getProducts, // Now getAll accepts params since it aliases getProducts which accepts params
  update: updateProduct,
  create: createProduct,
  delete: deleteProduct
};

export default productsApi;
