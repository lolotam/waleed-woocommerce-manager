
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
    const fetchUrl = proxyUrl ? `${proxyUrl}/${targetUrl}` : targetUrl;
    
    console.log('Using endpoint:', fetchUrl, proxyUrl ? '(via CORS proxy)' : '(direct connection)');
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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
    const responseText = await response.text();
    console.log('Claude API response status:', response.status);
    console.log('Claude API response text:', responseText);

    if (response.ok) {
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
        proxyMessage = '\n\nTry setting a CORS proxy in your browser console:\n' +
          'window.CORS_PROXY = "https://your-cors-proxy-url"\n' +
          'Then test the connection again.';
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
          '\n- Try opening https://api.anthropic.com in your browser to test direct access' +
          '\n- Check if your browser console shows CORS errors' +
          '\n- Try accessing through a proxy if available' +
          '\n- If using a VPN, try connecting without it' +
          '\n- Some corporate networks require additional configuration to access external APIs' +
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
          '\n- Use a CORS proxy service to bypass restrictions' +
          '\n- Try from an environment without strict CSP settings' +
          '\n- Contact your IT department to whitelist api.anthropic.com domain' +
          '\n- Consider using a server-side integration if browser restrictions persist'
      };
    }
    
    return { 
      success: false, 
      message: `Unexpected connection error: ${error.message || 'Unknown network issue'}` 
    };
  }
};
