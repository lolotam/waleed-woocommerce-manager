
import { fetchWooApi } from './woocommerceCore';

// Get all products
export const getProducts = async () => {
  return fetchWooApi('products');
};

// Get a specific product
export const getProduct = async (id: number) => {
  return fetchWooApi(`products/${id}`);
};

// Create a new product
export const createProduct = async (data: any) => {
  return fetchWooApi('products', {
    method: 'POST',
    data
  });
};

// Update a product
export const updateProduct = async (id: number, data: any) => {
  return fetchWooApi(`products/${id}`, {
    method: 'PUT',
    data
  });
};

// Delete a product
export const deleteProduct = async (id: number) => {
  return fetchWooApi(`products/${id}`, {
    method: 'DELETE'
  });
};

// Update product SEO data
export const updateProductSeo = async (id: number | string, seoData: any) => {
  const data = {
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
        const existingTags = await fetchWooApi('products/tags', {
          method: 'GET',
          params: { search: tagName }
        });
        
        if (existingTags.length > 0) {
          return existingTags[0].id;
        } else {
          // Create new tag
          const newTag = await fetchWooApi('products/tags', {
            method: 'POST',
            data: { name: tagName }
          });
          return newTag.id;
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
    const product = await fetchWooApi(`products/${id}`);
    
    if (product.images && product.images.length > 0) {
      const imageId = product.images[0].id;
      
      // Update image with SEO data
      await fetchWooApi(`products/${id}/images/${imageId}`, {
        method: 'PUT',
        data: {
          alt: seoData.image_seo.alt_text || '',
          title: seoData.image_seo.title || '',
          caption: seoData.image_seo.caption || '',
          description: seoData.image_seo.description || ''
        }
      });
    }
  }
  
  // Update the product with the processed data
  return fetchWooApi(`products/${id}`, {
    method: 'PUT',
    data
  });
};

// Batch update products
export const batchUpdateProducts = async (data: any) => {
  return fetchWooApi('products/batch', {
    method: 'POST',
    data
  });
};
