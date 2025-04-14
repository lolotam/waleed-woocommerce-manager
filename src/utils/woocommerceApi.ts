/**
 * WooCommerce API utilities for interacting with the WooCommerce REST API
 */
import { toast } from "sonner";

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// Get WooCommerce config from localStorage or use default empty values
const getWooCommerceConfig = (): WooCommerceConfig => {
  const config = localStorage.getItem('woocommerce_config');
  if (config) {
    return JSON.parse(config);
  }
  return {
    url: '',
    consumerKey: '',
    consumerSecret: ''
  };
};

// Base API handler for WooCommerce requests
const woocommerceApi = async (endpoint: string, method = 'GET', data = null) => {
  const config = getWooCommerceConfig();
  
  if (!config.url || !config.consumerKey || !config.consumerSecret) {
    toast.error('WooCommerce API not configured. Please check settings.');
    throw new Error('WooCommerce API not configured');
  }

  // Clean the URL to ensure proper format
  const cleanUrl = config.url.trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    toast.error('WooCommerce URL must start with http:// or https://');
    throw new Error('Invalid WooCommerce URL format');
  }

  const url = new URL(`${cleanUrl}/wp-json/wc/v3/${endpoint}`);
  
  // Add authentication
  url.searchParams.append('consumer_key', config.consumerKey);
  url.searchParams.append('consumer_secret', config.consumerSecret);

  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('WooCommerce API error:', error);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      toast.error('Connection timed out. Please check your store URL and try again.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      toast.error('Network error. Make sure your store URL is accessible and has proper CORS settings.');
    } else {
      toast.error(`WooCommerce API error: ${error.message || 'Unknown error'}`);
    }
    
    throw error;
  }
};

// API endpoints for different resources
export const productsApi = {
  getAll: (params = {}) => woocommerceApi(`products?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/${id}`),
  create: (data: any) => woocommerceApi('products', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/${id}`, 'DELETE'),
  // SEO metadata
  updateSeoMeta: (id: number, data: any) => woocommerceApi(`products/${id}/meta`, 'PUT', data),
  // Tags
  getTags: (params = {}) => woocommerceApi(`products/tags?${new URLSearchParams(params).toString()}`),
  createTag: (data: any) => woocommerceApi('products/tags', 'POST', data)
};

export const categoriesApi = {
  getAll: (params = {}) => woocommerceApi(`products/categories?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/categories/${id}`),
  create: (data: any) => woocommerceApi('products/categories', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/categories/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/categories/${id}`, 'DELETE'),
};

// Updated brandsApi to use product tags as brands
// This is a common approach when WooCommerce doesn't have a specific "brands" feature
export const brandsApi = {
  getAll: (params = {}) => woocommerceApi(`products/tags?${new URLSearchParams({...params, per_page: 100}).toString()}`),
  get: (id: number) => woocommerceApi(`products/tags/${id}`),
  create: (data: any) => woocommerceApi('products/tags', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/tags/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/tags/${id}`, 'DELETE'),
};

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

export const testConnection = async (): Promise<boolean> => {
  try {
    // Use a simpler endpoint for testing connection
    await woocommerceApi('data');
    toast.success('WooCommerce connection successful!');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    // The error toast is already shown in the woocommerceApi function
    return false;
  }
};

export default {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  media: mediaApi,
  testConnection,
};
