
/**
 * WooCommerce Products API
 */
import { woocommerceApi, WooCommerceResponse } from "./woocommerceCore";
import { Product } from "@/types/product";
import { ProductTag } from "@/types/product";

const productsApi = {
  getAll: (params = {}) => woocommerceApi<Product[]>(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi<Product>(`products/${id}`),
  create: (data: any) => woocommerceApi<Product>('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi<Product>(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi<Product>(`products/${id}`, 'DELETE'),
  getTags: (params = {}) => woocommerceApi<ProductTag[]>(`products/tags?${new URLSearchParams(params).toString()}`)
};

// Extract data helper function with proper typing
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

// New function to update product SEO fields using AI-generated content
export const updateProductSeo = async (productId: number | string, seoData: any) => {
  try {
    // Convert string ID to number if needed
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    
    if (isNaN(id)) {
      throw new Error(`Invalid product ID: ${productId}`);
    }
    
    // Prepare update payload
    const updateData: any = {
      description: seoData.long_description || "",
      short_description: seoData.short_description || "",
      status: "publish" // Publish the product
    };
    
    // Add meta data for SEO
    updateData.meta_data = [
      {
        key: "rankmath_title",
        value: seoData.meta_title || ""
      },
      {
        key: "rankmath_description",
        value: seoData.meta_description || ""
      },
      {
        key: "rankmath_focus_keyword",
        value: seoData.keywords || ""
      }
    ];
    
    // Add tags if provided
    if (seoData.tags && Array.isArray(seoData.tags) && seoData.tags.length > 0) {
      // First fetch existing tags to see if we need to create new ones
      const existingTagsResponse = await productsApi.getTags({ per_page: 100 });
      const existingTags = extractData(existingTagsResponse);
      
      const tagIds = [];
      
      // Process each tag
      for (const tagName of seoData.tags) {
        // Check if tag already exists
        const existingTag = existingTags.find(t => 
          t.name.toLowerCase() === tagName.toLowerCase()
        );
        
        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          // Create new tag
          try {
            const createTagResponse = await woocommerceApi('products/tags', 'POST', {
              name: tagName
            });
            const newTag = extractData(createTagResponse);
            tagIds.push(newTag.id);
          } catch (error) {
            console.error(`Failed to create tag "${tagName}":`, error);
            // Continue with other tags
          }
        }
      }
      
      // Add tags to update data
      if (tagIds.length > 0) {
        updateData.tags = tagIds;
      }
    }
    
    // Update image SEO if product has images and image SEO data is provided
    if (seoData.image_seo) {
      // First get the product to check for images
      const productResponse = await productsApi.get(id);
      const product = extractData(productResponse);
      
      if (product.images && product.images.length > 0) {
        // Get the first image (main product image)
        const mainImage = product.images[0];
        const updatedImage = {
          id: mainImage.id,
          alt: seoData.image_seo.alt_text || "",
          name: seoData.image_seo.title || "",
          caption: seoData.image_seo.caption || "",
          description: seoData.image_seo.description || ""
        };
        
        updateData.images = [updatedImage];
      }
    }
    
    // Update the product
    const response = await productsApi.update(id, updateData);
    return extractData(response);
  } catch (error) {
    console.error("Error updating product SEO:", error);
    throw error;
  }
};

export default productsApi;
