
/**
 * Claude API Core Operations
 */
import { toast } from "sonner";
import { AIModel } from '../../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../../config';
import { saveLogEntry } from '../../logs';

// Claude API call
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
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      mode: 'cors' // Explicitly request CORS mode
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
      throw new Error('Network error when connecting to Claude API. Please check your internet connection and ensure that your firewall/network allows access to api.anthropic.com. If you\'re behind a corporate network, you may need to use a VPN or ask your IT department to whitelist this domain.');
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
