
/**
 * Claude API Connection Testing
 */
import { isValidAPIKey } from '../../config';

// Test connections to Claude
export const testClaudeConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  // Basic API key validation
  if (!apiKey || !isValidAPIKey(apiKey, 'anthropic')) {
    return { 
      success: false, 
      message: 'API key format is invalid. Claude keys should start with "sk-ant-"' 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    // Enhanced logging for network debugging
    console.log('Testing Claude connection with API key:', apiKey.substring(0, 10) + '...');
    
    // Add a proxy endpoint if available in the environment
    const proxyUrl = window.CORS_PROXY || '';
    const targetUrl = 'https://api.anthropic.com/v1/models';
    
    // Properly format the URL based on proxy type
    let fetchUrl;
    if (proxyUrl.includes('cors-anywhere.herokuapp.com')) {
      // For cors-anywhere, just concatenate the URLs
      fetchUrl = `${proxyUrl}${targetUrl}`;
    } else if (proxyUrl) {
      // For other proxies that expect the target URL to be URL-encoded (like corsproxy.io)
      fetchUrl = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    } else {
      // Direct connection (will likely fail due to CORS)
      fetchUrl = targetUrl;
    }
    
    console.log('Using endpoint:', fetchUrl, proxyUrl ? `(via CORS proxy: ${proxyUrl})` : '(direct connection)');
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'enabled', // Add required header for browser requests
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal,
      mode: 'cors',     // Allow cross-origin requests
      credentials: 'omit',  // Prevent sending browser credentials
      redirect: 'follow'    // Follow any redirects
    });

    clearTimeout(timeoutId);

    // Log full response details for debugging
    console.log('Claude API response status:', response.status);
    
    const responseText = await response.text();
    console.log('Claude API response text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

    if (response.ok) {
      try {
        // Parse response JSON to validate it's a proper response
        const responseJson = JSON.parse(responseText);
        if (responseJson.models && Array.isArray(responseJson.models)) {
          console.log(`Successfully retrieved ${responseJson.models.length} Claude models`);
        }
      } catch (e) {
        console.warn('Response was not valid JSON, but status was OK:', e);
      }
      
      return { 
        success: true, 
        message: 'Successfully connected to Claude API' + (proxyUrl ? ' via CORS proxy' : '')
      };
    } else {
      let errorMsg = `Claude API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.error) {
          errorMsg = errorJson.error.message || errorMsg;
        }
      } catch (e) {
        if (responseText) {
          errorMsg = `Claude API error: ${responseText}`;
        }
      }
      
      // Enhanced error handling
      if (response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid API key. Please verify your Claude API credentials.' 
        };
      }
      
      return { 
        success: false, 
        message: errorMsg 
      };
    }
  } catch (error) {
    console.error('Claude connection test error:', error);
    
    // Comprehensive network error diagnostics
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        message: 'Connection timed out. Please try again later.' 
      };
    } else if (error.message.includes('Failed to fetch')) {
      // Check if we've already tried with a proxy
      const proxyUrl = window.CORS_PROXY;
      let proxyMessage = '';
      
      if (!proxyUrl) {
        proxyMessage = '\n\nTry these CORS proxies in Settings → AI Configuration → CORS Proxy URL:' +
          '\n• https://cors-anywhere.herokuapp.com/ (requires activation - which you\'ve already done!)' +
          '\n• https://corsproxy.io/?' + 
          '\n• https://thingproxy.freeboard.io/fetch/';
      } else if (proxyUrl.includes('cors-anywhere.herokuapp.com')) {
        proxyMessage = '\n\nFor cors-anywhere.herokuapp.com to work, make sure:' +
          '\n1. You\'ve requested temporary access at cors-anywhere.herokuapp.com/corsdemo' +
          '\n2. The URL is correctly formatted as "https://cors-anywhere.herokuapp.com/"';
      } else {
        proxyMessage = '\n\nThe current CORS proxy may not be working properly. Try cors-anywhere.herokuapp.com instead.';
      }
      
      return { 
        success: false, 
        message: 'Network connection issue detected. Possible causes:' +
          '\n1. No active internet connection' +
          '\n2. Firewall blocking API access' +
          '\n3. Corporate network/proxy restrictions' +
          '\n4. DNS resolution problems with api.anthropic.com' +
          '\n5. CORS policy restrictions in browser' +
          '\n\nAdvanced troubleshooting:' +
          '\n• Try opening https://api.anthropic.com in your browser to test direct access' +
          '\n• Check your browser console for CORS errors' +
          '\n• Try accessing through a proxy service' +
          '\n• If using a VPN, try connecting without it' +
          '\n• Some corporate networks require additional configuration' +
          proxyMessage
      };
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      return { 
        success: false, 
        message: 'Detailed network error:' +
          '\n1. Potential CORS (Cross-Origin) restrictions' +
          '\n2. Blocked by content security policy' +
          '\n3. Proxy server interference' +
          '\n4. SSL/TLS connection issues' +
          '\n\nTechnical solutions:' +
          '\n• Use a CORS proxy service in Settings → AI Configuration' +
          '\n• Try from a network without strict security policies' +
          '\n• Contact your IT department to whitelist api.anthropic.com domain' +
          '\n• Consider trying another browser'
      };
    }
    
    return { 
      success: false, 
      message: `Unexpected connection error: ${error.message || 'Unknown network issue'}` 
    };
  }
};
