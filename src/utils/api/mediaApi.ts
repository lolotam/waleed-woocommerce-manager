
/**
 * WordPress Media API
 */
import { toast } from "sonner";
import { getWooCommerceConfig } from "./woocommerceCore";

export const mediaApi = {
  upload: async (file: File, metadata = {}) => {
    const config = getWooCommerceConfig();
    
    if (!config.url || !config.consumerKey || !config.consumerSecret) {
      toast.error('WooCommerce API not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media`);
    url.searchParams.append('consumer_key', config.consumerKey);
    url.searchParams.append('consumer_secret', config.consumerSecret);

    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Media upload error');
      }

      return await response.json();
    } catch (error) {
      console.error('Media upload error:', error);
      toast.error(`Media upload error: ${error.message || 'Unknown error'}`);
      throw error;
    }
  },
  
  // Get all media
  getAll: (params = {}) => {
    const config = getWooCommerceConfig();
    
    if (!config.url || !config.consumerKey || !config.consumerSecret) {
      toast.error('WooCommerce API not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media`);
    // Add authentication
    url.searchParams.append('consumer_key', config.consumerKey);
    url.searchParams.append('consumer_secret', config.consumerSecret);
    
    // Add additional params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    return fetch(url.toString())
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error('Media fetch error:', error);
        toast.error(`Media fetch error: ${error.message || 'Unknown error'}`);
        throw error;
      });
  },
  
  // Update media metadata
  update: async (id: number, metadata: any) => {
    const config = getWooCommerceConfig();
    
    if (!config.url || !config.consumerKey || !config.consumerSecret) {
      toast.error('WooCommerce API not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media/${id}`);
    url.searchParams.append('consumer_key', config.consumerKey);
    url.searchParams.append('consumer_secret', config.consumerSecret);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Media update error');
      }

      return await response.json();
    } catch (error) {
      console.error('Media update error:', error);
      toast.error(`Media update error: ${error.message || 'Unknown error'}`);
      throw error;
    }
  },
  
  // Upload logo and assign to brand or category
  uploadAndAssignLogo: async (file: File, targetName: string, targetType: "brands" | "categories", options = { addToDescription: false }) => {
    try {
      // Step 1: Upload the image to media library
      const uploadResult = await mediaApi.upload(file, {
        title: `${targetName} Logo`,
        alt_text: `${targetName} Logo`,
        caption: `Logo for ${targetName}`
      });
      
      if (!uploadResult || !uploadResult.id) {
        throw new Error('Media upload failed');
      }
      
      // Step 2: Find the target (brand or category) by name
      let targetId = null;
      let targetData = null;
      
      if (targetType === 'brands') {
        const brandsResponse = await brandsApi.getAll();
        if (brandsResponse && brandsResponse.data) {
          const brand = brandsResponse.data.find(b => 
            b.name.toLowerCase() === targetName.toLowerCase()
          );
          if (brand) {
            targetId = brand.id;
            targetData = brand;
          }
        }
      } else {
        const categoriesResponse = await categoriesApi.getAll();
        if (categoriesResponse && categoriesResponse.data) {
          const category = categoriesResponse.data.find(c => 
            c.name.toLowerCase() === targetName.toLowerCase()
          );
          if (category) {
            targetId = category.id;
            targetData = category;
          }
        }
      }
      
      if (!targetId) {
        throw new Error(`${targetType === 'brands' ? 'Brand' : 'Category'} "${targetName}" not found`);
      }
      
      // Step 3: Update the target with the new image
      const updateData: any = {
        image: {
          id: uploadResult.id
        }
      };
      
      // Optionally add to description
      if (options.addToDescription) {
        const existingDescription = targetData?.description || '';
        const imageHtml = `<p><img src="${uploadResult.source_url}" alt="${targetName} Logo" class="brand-logo" /></p>`;
        updateData.description = imageHtml + existingDescription;
      }
      
      // Step 4: Update the target entity
      let updateResult;
      if (targetType === 'brands') {
        updateResult = await brandsApi.update(targetId, updateData);
      } else {
        updateResult = await categoriesApi.update(targetId, updateData);
      }
      
      return {
        success: true,
        mediaId: uploadResult.id,
        targetId: targetId,
        message: `Logo successfully assigned to ${targetName}`
      };
    } catch (error) {
      console.error('Logo assignment error:', error);
      throw error;
    }
  }
};

export default mediaApi;
