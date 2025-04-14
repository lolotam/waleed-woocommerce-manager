/**
 * Claude (Anthropic) API Integration
 */
import { toast } from "sonner";
import { AIModel, BatchPrompt } from '../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../config';
import { saveLogEntry } from '../logs';

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

// Test connections to Claude
export const testClaudeConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey || !isValidAPIKey(apiKey, 'anthropic')) {
    return { 
      success: false, 
      message: 'API key format is invalid. Claude keys should start with "sk-ant-"' 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    // Detailed logging for debugging
    console.log('Testing Claude connection with API key:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      mode: 'cors', // Explicitly request CORS mode
      credentials: 'omit' // Prevent sending credentials
    });

    clearTimeout(timeoutId);

    // Detailed response logging
    const responseText = await response.text();
    console.log('Claude API response status:', response.status);
    console.log('Claude API response text:', responseText);

    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to Claude API' 
      };
    } else {
      let errorMsg = `Claude API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.error) {
          errorMsg = errorJson.error.message || errorMsg;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (responseText) {
          errorMsg = `Claude API error: ${responseText}`;
        }
      }
      
      if (response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid API key. Please check your Claude API key.' 
        };
      }
      
      return { 
        success: false, 
        message: errorMsg 
      };
    }
  } catch (error) {
    console.error('Claude connection test error:', error);
    
    // More detailed error handling
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        message: 'Connection timed out. Please try again later.' 
      };
    } else if (error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        message: 'Network error when connecting to Claude API. This could be due to:' +
          '\n1. No internet connection' +
          '\n2. Firewall or security software blocking the request' +
          '\n3. Corporate network restrictions' +
          '\n4. DNS resolution issues' 
      };
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      return { 
        success: false, 
        message: 'Network error detected. Possible causes:' +
          '\n1. CORS restrictions' +
          '\n2. Firewall settings blocking api.anthropic.com' +
          '\n3. Proxy or VPN interference'
      };
    }
    
    return { 
      success: false, 
      message: `Connection error: ${error.message || 'Unknown error'}` 
    };
  }
};

// Process Claude prompts in batch
export const processBatchWithClaude = async (
  claudePrompts: BatchPrompt[], 
  config: { claudeApiKey: string },
  onProgress: (id: string, result: string) => void
): Promise<void> => {
  const requests = claudePrompts.map(p => ({
    custom_id: p.id,
    params: {
      model: MODEL_CONFIGS[p.model].apiModel,
      max_tokens: MODEL_CONFIGS[p.model].maxTokens,
      messages: [{ role: 'user', content: p.prompt }]
    }
  }));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'message-batches-2024-09-24'
      },
      body: JSON.stringify({ 
        requests,
        system: "You are Claude, a helpful AI assistant."
      }),
      signal: controller.signal,
      mode: 'cors' // Explicitly request CORS mode
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Claude batch API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMsg = errorJson.error.message || errorMsg;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMsg = `Claude batch API error: ${errorText}`;
        }
      }
      
      // Fall back to individual processing
      console.error('Batch processing failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Process batch results
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach((response: any) => {
        if (response.status === 'success' && response.content && response.content.length > 0) {
          const result = response.content[0].text;
          onProgress(response.custom_id, result);
          
          // Save to logs
          const prompt = claudePrompts.find(p => p.id === response.custom_id);
          if (prompt) {
            saveLogEntry(prompt.prompt, result, prompt.model);
          }
        } else {
          let errorMsg = 'Unknown error in batch processing';
          if (response.error && response.error.message) {
            errorMsg = response.error.message;
          }
          onProgress(response.custom_id, `Error: ${errorMsg}`);
        }
      });
    } else {
      throw new Error('Unexpected response format from Claude batch API');
    }
  } catch (error) {
    console.error('Batch processing failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Batch processing request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error when connecting to Claude API. Please check your internet connection and ensure that your firewall/network allows access to api.anthropic.com. If you\'re behind a corporate network, you may need to use a VPN or ask your IT department to whitelist this domain.');
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
