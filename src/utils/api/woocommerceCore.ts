
/**
 * WooCommerce Core API utilities
 */
import { toast } from "sonner";

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  wpUsername?: string;
  wpAppPassword?: string;
  authMethod?: 'consumer_keys' | 'app_password' | 'oauth';
}

// Response type for WooCommerce API including headers
export interface WooCommerceResponse<T = any> {
  data: T;
  headers: {
    [key: string]: string;
  };
  totalItems?: number;
  totalPages?: number;
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
    consumerSecret: '',
    wpUsername: '',
    wpAppPassword: '',
    authMethod: 'app_password' // Default to WordPress application password
  };
};

// Base API handler for WooCommerce requests
export const woocommerceApi = async <T = any>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null, 
  params: Record<string, any> = {}
): Promise<WooCommerceResponse<T>> => {
  const config = getWooCommerceConfig();
  
  if (!config.url) {
    toast.error('WooCommerce store URL not configured. Please check settings.');
    throw new Error('WooCommerce API not configured');
  }

  // Clean the URL to ensure proper format
  const cleanUrl = config.url.trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    toast.error('WooCommerce URL must start with http:// or https://');
    throw new Error('Invalid WooCommerce URL format');
  }

  // Check if this is a custom endpoint and modify the URL accordingly
  let apiUrl = `${cleanUrl}/wp-json/wc/v3/${endpoint}`;
  
  // Special handling for product_brand taxonomy if it's used
  if (endpoint.includes('products/brands')) {
    // For WooCommerce brands plugins - try the common endpoint patterns
    apiUrl = `${cleanUrl}/wp-json/wc/v3/${endpoint}`;
    console.log("Using WooCommerce Brands endpoint:", apiUrl);
  } else if (endpoint.includes('product_brand')) {
    // For custom brand taxonomies
    apiUrl = `${cleanUrl}/wp-json/wc/v3/${endpoint}`;
    console.log("Using custom product_brand taxonomy endpoint:", apiUrl);
  }
  
  const url = new URL(apiUrl);
  
  // Add authentication based on the selected method
  const authMethod = config.authMethod || 'app_password';
  
  // Headers to use for the request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Authentication handling
  if (authMethod === 'consumer_keys' || authMethod === 'oauth') {
    if (!config.consumerKey || !config.consumerSecret) {
      toast.error('WooCommerce API keys not configured. Please check settings.');
      throw new Error('WooCommerce API keys not configured');
    }
    // Using consumer key/secret as URL parameters
    url.searchParams.append('consumer_key', config.consumerKey);
    url.searchParams.append('consumer_secret', config.consumerSecret);
  } else if (authMethod === 'app_password') {
    if (!config.wpUsername || !config.wpAppPassword) {
      toast.error('Application username and password not configured. Please check settings.');
      throw new Error('Application credentials not configured');
    }
    // Using Basic Auth with application password
    const auth = btoa(`${config.wpUsername}:${config.wpAppPassword}`);
    headers['Authorization'] = `Basic ${auth}`;
  }

  // Add any additional query parameters
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for large catalogs
    
    console.log(`Making API request to: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Special handling for 404 errors on brand endpoints
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Log more detailed API error information
      console.error(`API Error ${response.status}:`, {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // Special handling for specific taxonomy endpoints
      if (response.status === 404 && endpoint.includes('brands')) {
        throw new Error('404: Brands endpoint not found. The store may use a different endpoint for brands.');
      }
      
      // Enhanced error handling for specific WooCommerce errors
      if (errorData.code === 'woocommerce_rest_cannot_view' || 
          errorData.message?.includes('cannot list resources') ||
          response.status === 401) {
        
        if (authMethod === 'app_password') {
          toast.error('Authentication error: Your WordPress username or password may be incorrect', {
            description: 'Make sure you\'ve created an Application Password in WordPress → Users → Profile',
            duration: 6000,
            action: {
              label: 'Learn More',
              onClick: () => window.open('https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/', '_blank')
            }
          });
        } else {
          toast.error('Authentication error: Your WooCommerce API credentials don\'t have sufficient permissions', {
            description: 'Make sure your credentials have read/write access and are properly configured.',
            duration: 6000,
            action: {
              label: 'Learn More',
              onClick: () => window.open('https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication', '_blank')
            }
          });
        }
        
        console.error('WooCommerce API Permission Error:', errorData);
        throw new Error('WooCommerce authentication failed: Insufficient permissions');
      }
      
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    // Extract the response body
    const responseData = await response.json();
    
    // Extract headers into an object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    // Parse pagination information if available
    const totalItems = parseInt(responseHeaders['x-wp-total'] || '0');
    const totalPages = parseInt(responseHeaders['x-wp-totalpages'] || '0');
    
    console.log(`API response for ${endpoint}:`, {
      totalItems,
      totalPages,
      dataLength: Array.isArray(responseData) ? responseData.length : 'Not an array'
    });
    
    return {
      data: responseData as T,
      headers: responseHeaders,
      totalItems,
      totalPages
    };
  } catch (error) {
    console.error('WooCommerce API error:', error);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      toast.error('Connection timed out. Please check your store URL and try again.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      toast.error('Network error. Make sure your store URL is accessible and has proper CORS settings.');
    } else if (!error.message.includes('authentication failed')) {
      // Don't show duplicate error messages for authentication errors (already handled above)
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
