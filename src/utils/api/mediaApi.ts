
/**
 * WordPress Media API
 */
import { toast } from "sonner";
import { getWooCommerceConfig } from "./woocommerceCore";
import brandsApi from "./brandsApi";
import categoriesApi from "./categoriesApi";

export const mediaApi = {
  upload: async (file: File, metadata = {}) => {
    const config = getWooCommerceConfig();
    
    if (!config.url) {
      toast.error('WooCommerce store URL not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media`);
    
    // Headers to use for the request
    const headers: Record<string, string> = {};
    
    // Set up authentication based on the selected method
    const authMethod = config.authMethod || 'app_password';
    
    if (authMethod === 'consumer_keys') {
      if (!config.consumerKey || !config.consumerSecret) {
        toast.error('WooCommerce API keys not configured. Please check settings.');
        throw new Error('WooCommerce API keys not configured');
      }
      // Using consumer key/secret as URL parameters
      url.searchParams.append('consumer_key', config.consumerKey);
      url.searchParams.append('consumer_secret', config.consumerSecret);
    } else if (authMethod === 'app_password') {
      if (!config.wpUsername || !config.wpAppPassword) {
        toast.error('WordPress username and application password required. Please check settings.');
        throw new Error('WordPress credentials not configured');
      }
      // Using Basic Auth with application password
      const auth = btoa(`${config.wpUsername}:${config.wpAppPassword}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }

    try {
      console.log(`Attempting to upload file ${file.name} to ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Media upload error response:', errorData);
        
        if (errorData.code === 'rest_cannot_create' || 
            errorData.message?.includes('not allowed to create posts')) {
          const errorMessage = 'Permission denied: Your WordPress user lacks media upload permissions.';
          
          // Display more detailed toast message with instructions
          toast.error(errorMessage, {
            description: 'Use an administrator account or configure application passwords.',
            duration: 8000
          });
          
          throw new Error(errorMessage);
        }
        
        throw new Error(errorData.message || 'Media upload error');
      }

      return await response.json();
    } catch (error) {
      console.error('Media upload error:', error);
      
      if (error.message?.includes('permission denied') || 
          error.message?.includes('not allowed to create posts')) {
        toast.error('WordPress Permission Error', {
          description: 'Your current credentials lack media upload permissions. Please use an admin account.',
          duration: 8000,
        });
      } else {
        toast.error(`Media upload error: ${error.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
  
  getAll: (params = {}) => {
    const config = getWooCommerceConfig();
    
    if (!config.url) {
      toast.error('WooCommerce store URL not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media`);
    
    // Headers to use for the request
    const headers: Record<string, string> = {};
    
    // Set up authentication based on the selected method
    const authMethod = config.authMethod || 'consumer_keys';
    
    if (authMethod === 'consumer_keys') {
      if (!config.consumerKey || !config.consumerSecret) {
        toast.error('WooCommerce API keys not configured. Please check settings.');
        throw new Error('WooCommerce API keys not configured');
      }
      url.searchParams.append('consumer_key', config.consumerKey);
      url.searchParams.append('consumer_secret', config.consumerSecret);
    } else if (authMethod === 'app_password') {
      if (!config.wpUsername || !config.wpAppPassword) {
        toast.error('WordPress Application Password not configured. Please check settings.');
        throw new Error('WordPress Application Password not configured');
      }
      // Using Basic Auth with application password
      const auth = btoa(`${config.wpUsername}:${config.wpAppPassword}`);
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    return fetch(url.toString(), { headers })
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
  
  update: async (id: number, metadata: any) => {
    const config = getWooCommerceConfig();
    
    if (!config.url) {
      toast.error('WooCommerce store URL not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/wp/v2/media/${id}`);
    
    // Headers to use for the request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Set up authentication based on the selected method
    const authMethod = config.authMethod || 'consumer_keys';
    
    if (authMethod === 'consumer_keys') {
      if (!config.consumerKey || !config.consumerSecret) {
        toast.error('WooCommerce API keys not configured. Please check settings.');
        throw new Error('WooCommerce API keys not configured');
      }
      url.searchParams.append('consumer_key', config.consumerKey);
      url.searchParams.append('consumer_secret', config.consumerSecret);
    } else if (authMethod === 'app_password') {
      if (!config.wpUsername || !config.wpAppPassword) {
        toast.error('WordPress Application Password not configured. Please check settings.');
        throw new Error('WordPress Application Password not configured');
      }
      // Using Basic Auth with application password
      const auth = btoa(`${config.wpUsername}:${config.wpAppPassword}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
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
  
  uploadAndAssignLogo: async (file: File, targetName: string, targetType: "brands" | "categories", options = { addToDescription: false }) => {
    try {
      console.log(`Attempting to upload logo for ${targetName} (${targetType})`);
      
      try {
        const uploadResult = await mediaApi.upload(file, {
          title: `${targetName} Logo`,
          alt_text: `${targetName} Logo`,
          caption: `Logo for ${targetName}`
        });
        
        if (!uploadResult || !uploadResult.id) {
          throw new Error('Media upload failed');
        }
        
        let targetId = null;
        let targetData = null;
        
        if (targetType === 'brands') {
          const brandsResponse = await brandsApi.getAll({per_page: '200'});
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
          const categoriesResponse = await categoriesApi.getAll({per_page: '200'});
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
        
        const updateData: any = {
          image: {
            id: uploadResult.id
          }
        };
        
        if (options.addToDescription) {
          const existingDescription = targetData?.description || '';
          const imageHtml = `<p><img src="${uploadResult.source_url}" alt="${targetName} Logo" class="brand-logo" /></p>`;
          updateData.description = imageHtml + existingDescription;
        }
        
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
        if (error.message?.includes('permission denied') || 
            error.message?.includes('not allowed to create')) {
          // Convert the error to a more user-friendly message
          throw new Error(`Permission Error: Your WooCommerce API keys don't have the required permissions. Please use the application password method with an administrator account.`);
        }
        throw error;
      }
    } catch (error) {
      console.error('Logo assignment error:', error);
      throw error;
    }
  }
};

export default mediaApi;
