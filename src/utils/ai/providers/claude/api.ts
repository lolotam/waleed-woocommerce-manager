
/**
 * Claude API Core Operations
 */
import { toast } from "sonner";
import { AIModel } from '../../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../../config';
import { saveLogEntry } from '../../logs';

// Claude API call with enhanced CORS proxy support
export const generateWithClaude = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.claudeApiKey) {
    throw new Error('Claude API key not configured. Please check settings.');
  }

  if (!isValidAPIKey(config.claudeApiKey, 'anthropic')) {
    throw new Error('Invalid Claude API key format');
  }

  console.log(`Attempting to use Claude model: ${modelConfig.apiModel}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    // Check for CORS proxy configuration
    const proxyUrl = window.CORS_PROXY || '';
    const targetUrl = 'https://api.anthropic.com/v1/messages';
    
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
    
    console.log('Connecting to Claude API via:', proxyUrl ? `CORS proxy (${proxyUrl})` : 'Direct connection');
    console.log('Using URL:', fetchUrl);
    console.log('Using model:', modelConfig.apiModel);
    
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: modelConfig.apiModel,
        max_tokens: modelConfig.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal,
      mode: 'cors', // Explicitly request CORS mode
      credentials: 'omit' // Prevent sending browser credentials
    });

    clearTimeout(timeoutId);

    // Log response status for debugging
    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', errorText);
      
      let errorMsg = `Claude API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMsg = errorJson.error.message || errorMsg;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMsg = `Claude API error: ${errorText}`;
        }
      }
      
      if (response.status === 401) {
        throw new Error('Invalid Claude API key');
      } else if (response.status === 429) {
        throw new Error('Claude rate limit exceeded. Please try again later.');
      } else if (response.status === 404) {
        throw new Error(`Model '${modelConfig.apiModel}' not found or not available to your account.`);
      }
      
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.content || !data.content.length || !data.content[0].text) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    console.log('Claude API response received successfully');
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Claude API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      // Enhanced error message for network issues
      const proxyUrl = window.CORS_PROXY || '';
      
      throw new Error(
        'Network error when connecting to Claude API. ' +
        'This is likely due to CORS restrictions in your browser. ' +
        (proxyUrl ? 'The current CORS proxy may not be working correctly. ' : 'No CORS proxy is currently configured. ') +
        'Please try the following solutions:\n\n' +
        '1. Set a CORS proxy in Settings → AI Configuration → CORS Proxy URL\n' +
        '2. For cors-anywhere.herokuapp.com, make sure you\'ve requested temporary access\n' +
        '3. Try a different proxy like "https://corsproxy.io/?"\n' +
        '4. If behind a corporate network, consider using a VPN or ask IT to whitelist api.anthropic.com'
      );
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
