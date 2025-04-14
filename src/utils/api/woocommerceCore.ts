
/**
 * WooCommerce Core API utilities
 */
import { toast } from "sonner";

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// Get WooCommerce config from localStorage or use default empty values
export const getWooCommerceConfig = (): WooCommerceConfig => {
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
export const woocommerceApi = async (endpoint: string, method = 'GET', data = null) => {
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
