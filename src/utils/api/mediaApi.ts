/**
 * WordPress Media API
 */
import { toast } from "sonner";
import { getWooCommerceConfig } from "./woocommerceCore";
import brandsApi from "./brandsApi";
import { fuzzyMatch } from "@/utils/brandMatchingUtils";
import { detectPermissionError, formatApiError } from "@/utils/errorUtils";

// Define proper error response type
interface WPErrorResponse {
  code?: string;
  message?: string;
  data?: any;
}

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
      console.log('Authentication method:', authMethod);
      
      // Enhanced logging for debugging
      if (authMethod === 'app_password') {
        console.log('Using username:', config.wpUsername);
        console.log('App password first 4 chars:', config.wpAppPassword ? config.wpAppPassword.substring(0, 4) : 'none');
        console.log('App password length:', config.wpAppPassword ? config.wpAppPassword.length : 0);
      } else {
        console.log('Using consumer key/secret authentication');
        console.log('Consumer key first 4 chars:', config.consumerKey ? config.consumerKey.substring(0, 4) : 'none');
      }
      
      // Add more headers for debugging
      headers['X-Debug-Info'] = 'Brand-Logo-Uploader-App';
      
      // Attempt the upload
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: formData,
      });

      // Log the full response for debugging
      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: WPErrorResponse = {};
        
        try {
          errorData = JSON.parse(errorText) as WPErrorResponse;
          console.error('Media upload error response:', errorData);
        } catch (e) {
          console.error('Media upload error response (raw):', errorText);
          errorData = { message: errorText };
        }
        
        // Enhanced error handling with more detailed messaging
        if (detectPermissionError(errorData.message || '')) {
          console.error('Permission error details:', errorData);
          
          // More specific error message based on response
          let errorMessage = 'Permission denied: Your WordPress user lacks media upload permissions.';
          
          // Check for specific WordPress error codes
          if (errorData.code === 'rest_cannot_create') {
            errorMessage += ' (Error: rest_cannot_create)';
          } else if (errorData.code === 'rest_forbidden') {
            errorMessage += ' (Error: rest_forbidden)';
          }
          
          // Improved detailed toast message with specific information about the error
          toast.error('WordPress Media Permission Error', {
            description: 'Your credentials don\'t have permission to create posts in WordPress media library. Error code: ' + 
                        (errorData.code || 'unknown'),
            duration: 10000
          });
          
          throw new Error(errorMessage);
        }
        
        // Check for authentication errors
        if (response.status === 401) {
          toast.error('WordPress Authentication Failed', {
            description: 'Your username or application password is incorrect.',
            duration: 8000
          });
          throw new Error('Authentication failed. Check your username and password.');
        }
        
        // Check for other common errors
        if (response.status === 404) {
          toast.error('WordPress REST API Endpoint Not Found', {
            description: 'The media upload endpoint could not be found. Your WordPress might not have REST API enabled.',
            duration: 8000
          });
          throw new Error('WordPress REST API endpoint not found. Check if REST API is enabled.');
        }
        
        // Improved general error details
        throw new Error(errorData.message || `Media upload error (HTTP ${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Media upload error:', error);
      
      // Enhanced permission error detection and guidance
      if (detectPermissionError(error.message || '')) {
        toast.error('WordPress Permission Error', {
          description: 'Check the troubleshooting guide for step-by-step instructions to fix this.',
          duration: 10000,
          action: {
            label: 'View Guide',
            onClick: () => {
              // Navigate to troubleshooting tab
              window.location.href = '/brand-logo-uploader?tab=troubleshooting';
            }
          }
        });
      } else if (error.message?.includes('fetch failed') || error.message?.includes('Network Error')) {
        toast.error('Network Error', {
          description: 'Could not connect to your WordPress site. Check your site URL and network connection.',
          duration: 8000
        });
      } else {
        toast.error(`Media upload error: ${formatApiError(error)}`);
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
  
  uploadAndAssignLogo: async (file: File, targetName: string, targetType: "brands" | "categories", options = { addToDescription: false, fuzzyMatching: true }) => {
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
        let matchedName = targetName;
        
        if (targetType === 'brands') {
          const brandsResponse = await brandsApi.getAll({per_page: '100'});
          if (brandsResponse && brandsResponse.data) {
            // First try exact match
            let brand = brandsResponse.data.find(b => 
              b.name.toLowerCase() === targetName.toLowerCase()
            );
            
            // If no exact match and fuzzy matching is enabled, try fuzzy matching
            if (!brand && options.fuzzyMatching) {
              console.log(`No exact match found for "${targetName}", trying fuzzy matching...`);
              
              // Find the best fuzzy match
              let bestMatch = null;
              let bestSimilarity = 0;
              
              for (const b of brandsResponse.data) {
                if (fuzzyMatch(b.name, targetName)) {
                  // Found a fuzzy match
                  brand = b;
                  matchedName = b.name; // Store the matched brand name
                  console.log(`Found fuzzy match: "${targetName}" → "${b.name}"`);
                  break;
                }
              }
            }
            
            if (brand) {
              targetId = brand.id;
              targetData = brand;
            }
          }
        } else {
          const categoriesResponse = await categoriesApi.getAll({per_page: '100'});
          if (categoriesResponse && categoriesResponse.data) {
            // First try exact match
            let category = categoriesResponse.data.find(c => 
              c.name.toLowerCase() === targetName.toLowerCase()
            );
            
            // If no exact match and fuzzy matching is enabled, try fuzzy matching
            if (!category && options.fuzzyMatching) {
              console.log(`No exact match found for "${targetName}", trying fuzzy matching...`);
              
              for (const c of categoriesResponse.data) {
                if (fuzzyMatch(c.name, targetName)) {
                  // Found a fuzzy match
                  category = c;
                  matchedName = c.name; // Store the matched category name
                  console.log(`Found fuzzy match: "${targetName}" → "${c.name}"`);
                  break;
                }
              }
            }
            
            if (category) {
              targetId = category.id;
              targetData = category;
            }
          }
        }
        
        if (!targetId) {
          if (options.fuzzyMatching) {
            throw new Error(`${targetType === 'brands' ? 'Brand' : 'Category'} "${targetName}" not found, even with fuzzy matching`);
          } else {
            throw new Error(`${targetType === 'brands' ? 'Brand' : 'Category'} "${targetName}" not found`);
          }
        }
        
        const updateData: any = {
          image: {
            id: uploadResult.id
          }
        };
        
        if (options.addToDescription) {
          const existingDescription = targetData?.description || '';
          const imageHtml = `<p><img src="${uploadResult.source_url}" alt="${matchedName} Logo" class="brand-logo" /></p>`;
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
          message: `Logo successfully assigned to ${matchedName}${matchedName !== targetName ? ` (matched from "${targetName}")` : ''}`
        };
      } catch (error: any) {
        if (error.message?.includes('permission denied') || 
            error.message?.includes('not allowed to create') ||
            error.message?.includes('rest_cannot_create')) {
          // Convert the error to a more user-friendly message with detailed guidance
          throw new Error(`Permission Error: Your WooCommerce API keys don't have sufficient permissions to upload media files. Go to the Troubleshooting tab for detailed instructions.`);
        }
        throw error;
      }
    } catch (error) {
      console.error('Logo assignment error:', error);
      throw error;
    }
  },
  
  testRestApiEndpoint: async (endpoint = 'wp/v2/media') => {
    const config = getWooCommerceConfig();
    
    if (!config.url) {
      toast.error('WooCommerce store URL not configured. Please check settings.');
      throw new Error('WooCommerce API not configured');
    }

    const url = new URL(`${config.url}/wp-json/${endpoint}`);
    
    try {
      console.log(`Testing REST API endpoint: ${url.toString()}`);
      
      // Try a simple GET request without authentication first
      const response = await fetch(url.toString());
      
      // Log the result
      console.log('API test response status:', response.status);
      
      // Return detailed information about the result
      return {
        accessible: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        isJsonResponse: response.headers.get('content-type')?.includes('application/json') || false
      };
    } catch (error: any) {
      console.error('REST API test error:', error);
      return {
        accessible: false,
        status: 0,
        statusText: 'Network Error',
        error: error.message || 'Unknown error',
        networkError: true
      };
    }
  }
};

export default mediaApi;
