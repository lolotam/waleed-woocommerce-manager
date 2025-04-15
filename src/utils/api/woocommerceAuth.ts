
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

  return `${baseUrl}?${params.toString()}`;
};

// Function to handle OAuth initiation
export const initiateWooCommerceOAuth = (storeUrl: string) => {
  try {
    // Save the current page to return to after auth
    localStorage.setItem('wc_auth_return_page', window.location.pathname);
    
    // Generate auth URL
    const authUrl = buildWooCommerceAuthUrl({
      storeUrl,
      appName: 'Brand Logo Uploader',
      returnUrl: `${window.location.origin}/brand-logo-uploader?tab=config`,
    });
    
    // Redirect to WooCommerce auth page
    window.location.href = authUrl;
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
    
    toast.success('WooCommerce authentication successful!');
    return true;
  } catch (error) {
    console.error('Error saving OAuth credentials:', error);
    toast.error(`Failed to save authentication: ${error.message}`);
    return false;
  }
};
