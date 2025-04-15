
import { toast } from "sonner";
import { getWooCommerceConfig } from "./woocommerceCore";
import axios from 'axios';

/**
 * Test API permissions specifically for media upload capabilities
 */
export const testMediaPermissions = async (): Promise<{
  success: boolean;
  message: string;
  details?: string;
  canUploadMedia?: boolean;
}> => {
  const config = getWooCommerceConfig();
  
  if (!config.url) {
    return {
      success: false,
      message: 'Store URL not configured',
      details: 'Please configure your WooCommerce store URL in settings'
    };
  }
  
  try {
    const url = new URL(`${config.url}/wp-json/wp/v2/media`);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    // Set up authentication based on the selected method
    const authMethod = config.authMethod || 'app_password';
    
    if (authMethod === 'consumer_keys') {
      if (!config.consumerKey || !config.consumerSecret) {
        return {
          success: false,
          message: 'API keys not configured',
          details: 'Please enter your Consumer Key and Consumer Secret'
        };
      }
      url.searchParams.append('consumer_key', config.consumerKey);
      url.searchParams.append('consumer_secret', config.consumerSecret);
    } else if (authMethod === 'app_password') {
      if (!config.wpUsername || !config.wpAppPassword) {
        return {
          success: false,
          message: 'Application password not configured',
          details: 'Please enter your WordPress username and application password'
        };
      }
      const auth = btoa(`${config.wpUsername}:${config.wpAppPassword}`);
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    // Test if user can access the media endpoint (read permission)
    const response = await axios.get(url.toString(), { headers });
    
    if (response.status === 200) {
      console.log('Media API read access successful');
      
      // Now test for media creation permission using a OPTIONS preflight request
      // This is a non-destructive way to check permissions without actually uploading
      try {
        const optionsResponse = await axios({
          method: 'OPTIONS',
          url: url.toString(),
          headers
        });
        
        const allowHeader = optionsResponse.headers['allow'] || 
                           optionsResponse.headers['Access-Control-Allow-Methods'] || '';
        
        // If POST is in the allowed methods, then the user likely has upload permission
        const canPost = allowHeader.includes('POST');
        
        return {
          success: true,
          message: canPost ? 
            'Media upload permission verified' : 
            'Media read access confirmed, but upload permission could not be verified',
          canUploadMedia: canPost,
          details: canPost ? 
            'Your credentials have the necessary permissions to upload media files' :
            'You may need admin privileges or Read/Write API permissions'
        };
      } catch (error) {
        console.log('OPTIONS request failed but GET succeeded:', error);
        // Even if OPTIONS fails, the user may still have permissions
        // We'll assume they might have permission since they can read media
        return {
          success: true,
          message: 'Media read access confirmed',
          details: 'API upload permission could not be verified, but may still work',
          canUploadMedia: undefined
        };
      }
    }
    
    return {
      success: false,
      message: 'Media API access failed',
      details: 'Your credentials may not have sufficient permissions'
    };
  } catch (error) {
    console.error('Media permission test error:', error);
    
    let details = 'Unknown error occurred';
    let messageTitle = 'Media permission test failed';
    
    if (error.response) {
      // Request was made and server responded with error status
      if (error.response.status === 401) {
        messageTitle = 'Authentication failed';
        details = 'Your username/password or API keys are incorrect';
      } else if (error.response.status === 403) {
        messageTitle = 'Permission denied';
        details = 'Your account does not have permission to access media';
      } else {
        details = `Server returned status ${error.response.status}`;
      }
      
      // Extract more detailed error message if available
      if (error.response.data && error.response.data.message) {
        details = error.response.data.message;
      }
    } else if (error.request) {
      // Request was made but no response received
      messageTitle = 'Connection error';
      details = 'Could not connect to your WordPress site';
    }
    
    return {
      success: false,
      message: messageTitle,
      details: details,
      canUploadMedia: false
    };
  }
};

/**
 * Test connection and permissions, then show appropriate toast message
 */
export const testPermissionsWithFeedback = async (): Promise<boolean> => {
  toast.loading('Testing API permissions...');
  
  try {
    const result = await testMediaPermissions();
    
    if (result.success) {
      if (result.canUploadMedia === true) {
        toast.success('API Permission Test Successful', {
          description: 'Your credentials have media upload permissions.'
        });
        return true;
      } else {
        toast.warning('Limited API Permissions', {
          description: result.details || 'You may need to update your credentials to upload media.'
        });
        return false;
      }
    } else {
      toast.error(result.message, {
        description: result.details
      });
      return false;
    }
  } catch (error) {
    toast.error('Permission Test Failed', {
      description: error.message || 'An unexpected error occurred'
    });
    return false;
  }
};
