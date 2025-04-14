
/**
 * Claude API Core Operations
 */
import { toast } from "sonner";
import { AIModel } from '../../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../../config';
import { saveLogEntry } from '../../logs';

// Claude API call with CORS proxy support
export const generateWithClaude = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.claudeApiKey) {
    throw new Error('Claude API key not configured. Please check settings.');
  }

  if (!isValidAPIKey(config.claudeApiKey, 'anthropic')) {
    throw new Error('Invalid Claude API key format');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    // Check for CORS proxy configuration
    const proxyUrl = window.CORS_PROXY || '';
    const targetUrl = 'https://api.anthropic.com/v1/messages';
    const fetchUrl = proxyUrl ? `${proxyUrl}/${targetUrl}` : targetUrl;
    
    console.log('Connecting to Claude API via:', proxyUrl ? 'CORS proxy' : 'Direct connection');
    
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01'
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

    if (!response.ok) {
      const errorText = await response.text();
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
    
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Claude API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      // Enhanced error message for network issues
      throw new Error(
        'Network error when connecting to Claude API. This may be due to CORS restrictions. ' +
        'Try setting a CORS proxy in your browser console with: window.CORS_PROXY = "https://your-proxy-url". ' +
        'If you\'re behind a corporate network, you may need to use a VPN or ask your IT department to whitelist api.anthropic.com domain.'
      );
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
