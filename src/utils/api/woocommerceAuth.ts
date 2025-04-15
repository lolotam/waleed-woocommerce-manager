
/**
 * WooCommerce OAuth Authentication
 */
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
  callbackUrl = window.location.origin + '/api/woocommerce-callback',
  scope = 'read_write',
  userId = uuidv4()
}: AuthUrlParams): string => {
  // Clean the store URL
  const cleanUrl = storeUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('Store URL must start with http:// or https://');
  }

  // Build base URL
  const endpoint = '/wc-auth/v1/authorize';
  const baseUrl = `${cleanUrl}${endpoint}`;
  
  // Build params
  const params = new URLSearchParams();
  params.append('app_name', appName);
  params.append('scope', scope);
  params.append('user_id', userId);
  params.append('return_url', returnUrl);
  params.append('callback_url', callbackUrl);

  // Save state for tracking the auth flow
  localStorage.setItem('wc_auth_in_progress', 'true');
  localStorage.setItem('wc_auth_timestamp', Date.now().toString());

  return `${baseUrl}?${params.toString()}`;
};

// Function to handle OAuth initiation
export const initiateWooCommerceOAuth = (storeUrl: string) => {
  try {
    if (!storeUrl) {
      toast.error('Please enter your store URL first');
      return;
    }
    
    // Store URL validation
    let cleanUrl = storeUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    try {
      new URL(cleanUrl);
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Save the current page to return to after auth
    localStorage.setItem('wc_auth_return_page', window.location.pathname);
    localStorage.setItem('wc_temp_store_url', cleanUrl);
    
    // Generate auth URL
    const authUrl = buildWooCommerceAuthUrl({
      storeUrl: cleanUrl,
      appName: 'Brand Logo Uploader',
      returnUrl: `${window.location.origin}/brand-logo-uploader?tab=config`,
    });
    
    // Show a loading toast
    toast.info('Redirecting to WooCommerce for authentication...', {
      duration: 3000,
    });
    
    // Redirect after a short delay to ensure the toast is shown
    setTimeout(() => {
      console.log('Redirecting to WooCommerce auth URL:', authUrl);
      window.location.href = authUrl;
    }, 500);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    toast.error(`Authentication error: ${error.message}`);
  }
};

// Function to save OAuth credentials received from the callback
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

// Function to check if OAuth flow timed out
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
