
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
};

export default mediaApi;
