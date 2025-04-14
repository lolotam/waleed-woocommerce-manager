
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

  const url = new URL(`${config.url}/wp-json/wc/v3/${endpoint}`);
  
  // Add authentication
  url.searchParams.append('consumer_key', config.consumerKey);
  url.searchParams.append('consumer_secret', config.consumerSecret);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'WooCommerce API error');
    }

    return await response.json();
  } catch (error) {
    console.error('WooCommerce API error:', error);
    toast.error(`WooCommerce API error: ${error.message || 'Unknown error'}`);
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
};

export const categoriesApi = {
  getAll: (params = {}) => woocommerceApi(`products/categories?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/categories/${id}`),
  create: (data: any) => woocommerceApi('products/categories', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/categories/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/categories/${id}`, 'DELETE'),
};

export const brandsApi = {
  // Since brands are a custom taxonomy, we need to adapt this to your specific WooCommerce setup
  getAll: (params = {}) => woocommerceApi(`products/attributes/brand_name/terms?${new URLSearchParams(params).toString()}`),
  get: (id: number) => woocommerceApi(`products/attributes/brand_name/terms/${id}`),
  create: (data: any) => woocommerceApi('products/attributes/brand_name/terms', 'POST', data),
  update: (id: number, data: any) => woocommerceApi(`products/attributes/brand_name/terms/${id}`, 'PUT', data),
  delete: (id: number) => woocommerceApi(`products/attributes/brand_name/terms/${id}`, 'DELETE'),
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
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await woocommerceApi('system_status');
    toast.success('WooCommerce connection successful!');
    return true;
  } catch (error) {
    toast.error('WooCommerce connection failed.');
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
