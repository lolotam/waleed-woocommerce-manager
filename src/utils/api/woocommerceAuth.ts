import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface AuthUrlParams {
  storeUrl: string;
  appName: string;
  returnUrl: string;
  callbackUrl?: string;
  scope?: 'read' | 'write' | 'read_write';
  userId?: string;
}

export const buildWooCommerceAuthUrl = ({
  storeUrl,
  appName,
  returnUrl,
  callbackUrl = window.location.origin + '/woocommerce-callback',
  scope = 'read_write',
  userId = uuidv4()
}: AuthUrlParams): string => {
  // Enhanced URL validation with more comprehensive checks
  const cleanUrl = storeUrl.trim().replace(/\/+$/, '');
  
  // More robust URL validation
  try {
    const parsedUrl = new URL(
      cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') 
        ? cleanUrl 
        : `https://${cleanUrl}`
    );
    
    // Ensure it's a valid domain
    if (!parsedUrl.hostname.includes('.')) {
      throw new Error('Invalid store URL');
    }
  } catch (error) {
    console.error('URL Validation Error:', error);
    toast.error('Please enter a valid WooCommerce store URL', {
      description: 'Make sure to use the full domain like mystore.com'
    });
    throw error;
  }

  // Build base URL
  const endpoint = '/wc-auth/v1/authorize';
  const baseUrl = `${cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`}${endpoint}`;
  
  // Build params
  const params = new URLSearchParams();
  params.append('app_name', appName);
  params.append('scope', scope);
  params.append('user_id', userId);
  params.append('return_url', returnUrl);
  params.append('callback_url', callbackUrl);

  // Enhanced logging for debugging
  console.log('WooCommerce Auth URL Generation:', {
    baseUrl,
    params: params.toString(),
    fullUrl: `${baseUrl}?${params.toString()}`
  });

  // Save state for tracking the auth flow with more details
  localStorage.setItem('wc_auth_in_progress', JSON.stringify({
    timestamp: Date.now(),
    storeUrl: cleanUrl,
    appName
  }));

  return `${baseUrl}?${params.toString()}`;
};

export const initiateWooCommerceOAuth = (storeUrl: string) => {
  try {
    if (!storeUrl) {
      toast.error('Please enter your WooCommerce store URL', {
        description: 'The store URL is required to initiate authentication'
      });
      return;
    }
    
    // More comprehensive URL handling
    let cleanUrl = storeUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    try {
      new URL(cleanUrl);
    } catch (e) {
      toast.error('Invalid store URL', {
        description: 'Please enter a valid WooCommerce store domain'
      });
      return;
    }
    
    // Save context for return after authentication
    localStorage.setItem('wc_auth_return_page', window.location.pathname);
    localStorage.setItem('wc_temp_store_url', cleanUrl);
    
    // Generate auth URL with comprehensive error handling
    const authUrl = buildWooCommerceAuthUrl({
      storeUrl: cleanUrl,
      appName: 'Brand Logo Uploader',
      returnUrl: `${window.location.origin}/brand-logo-uploader?tab=config`,
      callbackUrl: `${window.location.origin}/woocommerce-callback`
    });
    
    // Enhanced toast with more context
    toast.info('Redirecting to WooCommerce for authentication', {
      description: `Connecting to ${cleanUrl}`,
      duration: 5000
    });
    
    console.log('OAuth Redirect Details:', {
      storeUrl: cleanUrl,
      authUrl,
      currentPath: window.location.pathname
    });
    
    // Direct navigation to prevent any potential timeout issues
    window.location.href = authUrl;
  } catch (error) {
    console.error('OAuth Initiation Critical Error:', error);
    toast.error('Authentication Setup Failed', {
      description: error.message || 'Unable to start WooCommerce authentication'
    });
  }
};

export const saveOAuthCredentials = (credentials: {
  consumer_key: string;
  consumer_secret: string;
  key_permissions: string;
}) => {
  try {
    const config = {
      url: localStorage.getItem('wc_temp_store_url') || '',
      consumerKey: credentials.consumer_key,
      consumerSecret: credentials.consumer_secret,
      authMethod: 'consumer_keys'
    };
    
    localStorage.setItem('woocommerce_config', JSON.stringify(config));
    localStorage.removeItem('wc_temp_store_url');
    localStorage.removeItem('wc_auth_in_progress');
    localStorage.removeItem('wc_auth_timestamp');
    
    toast.success('WooCommerce authentication successful!');
    return true;
  } catch (error) {
    console.error('Error saving OAuth credentials:', error);
    toast.error(`Failed to save authentication: ${error.message}`);
    return false;
  }
};

export const checkOAuthTimeout = () => {
  const inProgress = localStorage.getItem('wc_auth_in_progress');
  if (inProgress === 'true') {
    const timestamp = parseInt(localStorage.getItem('wc_auth_timestamp') || '0');
    const now = Date.now();
    
    // If more than 5 minutes passed, consider it timed out
    if (now - timestamp > 5 * 60 * 1000) {
      localStorage.removeItem('wc_auth_in_progress');
      localStorage.removeItem('wc_auth_timestamp');
      return true;
    }
  }
  return false;
};
