
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
    appName,
    userId
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
      description: `Connecting to ${cleanUrl}. Please complete the authorization in your browser.`,
      duration: 5000
    });
    
    console.log('OAuth Redirect Details:', {
      storeUrl: cleanUrl,
      authUrl,
      currentPath: window.location.pathname
    });
    
    // Force redirect to the authorization URL in a new tab
    const newWindow = window.open(authUrl, '_blank', 'noopener,noreferrer');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      toast.error('Popup blocked', {
        description: 'Please allow popups for this site and try again. You may need to click "Allow" in your browser.',
        duration: 8000
      });
      
      // Add fallback option with direct link
      toast('Alternative method available', {
        description: 'You can also click the authorization link directly',
        action: {
          label: 'Open Auth URL',
          onClick: () => window.open(authUrl, '_blank')
        },
        duration: 10000
      });
    } else {
      // Add instructions toast for better UX
      toast.info('Complete authentication in new tab', {
        description: 'Login to your WordPress admin if prompted, then click "Approve"',
        duration: 8000
      });
    }
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
    // Validate credentials
    if (!credentials.consumer_key || !credentials.consumer_secret) {
      console.error('Invalid OAuth credentials received:', credentials);
      toast.error('Invalid OAuth credentials received', {
        description: 'The API keys received from WooCommerce are not valid'
      });
      return false;
    }
    
    const storeUrl = localStorage.getItem('wc_temp_store_url') || '';
    if (!storeUrl) {
      console.error('No store URL found in local storage');
      toast.error('Authentication error', {
        description: 'Store URL not found. Please try the authentication process again.'
      });
      return false;
    }
    
    const config = {
      url: storeUrl,
      consumerKey: credentials.consumer_key,
      consumerSecret: credentials.consumer_secret,
      authMethod: 'consumer_keys'
    };
    
    localStorage.setItem('woocommerce_config', JSON.stringify(config));
    localStorage.removeItem('wc_temp_store_url');
    localStorage.removeItem('wc_auth_in_progress');
    
    toast.success('WooCommerce authentication successful!', {
      description: 'Your store has been connected successfully'
    });
    return true;
  } catch (error) {
    console.error('Error saving OAuth credentials:', error);
    toast.error(`Failed to save authentication: ${error.message}`);
    return false;
  }
};

export const checkOAuthTimeout = () => {
  const inProgress = localStorage.getItem('wc_auth_in_progress');
  if (inProgress) {
    try {
      const authData = JSON.parse(inProgress);
      const timestamp = authData.timestamp;
      const now = Date.now();
      
      // If more than 5 minutes passed, consider it timed out
      if (now - timestamp > 5 * 60 * 1000) {
        localStorage.removeItem('wc_auth_in_progress');
        return true;
      }
    } catch (e) {
      // Handle JSON parsing error
      localStorage.removeItem('wc_auth_in_progress');
      return true;
    }
  }
  return false;
};

// Add a new function to detect common authentication problems
export const detectCommonOAuthIssues = () => {
  // Check if the browser might be blocking third-party cookies
  const checkThirdPartyCookies = () => {
    try {
      // This is a naive check - real detection is complex
      const hasLocalStorage = !!window.localStorage;
      const hasSessionStorage = !!window.sessionStorage;
      
      if (!hasLocalStorage || !hasSessionStorage) {
        return true; // Potential cookie/storage issues
      }
    } catch (e) {
      return true; // Access to storage is restricted
    }
    return false;
  };
  
  const issues = [];
  
  // Check for HTTPS - OAuth usually requires secure connections
  if (window.location.protocol !== 'https:') {
    issues.push('Your app is not running on HTTPS, which may cause OAuth issues with some stores');
  }
  
  // Check for potential cookie blocking
  if (checkThirdPartyCookies()) {
    issues.push('Your browser may be blocking third-party cookies, which can prevent authentication');
  }
  
  // Check if we're in an iframe
  if (window !== window.top) {
    issues.push('The app is running in an iframe, which may affect authentication due to browser security policies');
  }
  
  return issues;
};
