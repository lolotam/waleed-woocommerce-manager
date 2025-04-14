
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
    toast.error('Claude API key not configured. Please check settings.');
    throw new Error('Claude API key not configured');
  }

  if (!isValidAPIKey(config.claudeApiKey, 'anthropic')) {
    toast.error('Claude API key format is invalid. Please check your API key.');
    throw new Error('Invalid Claude API key format');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout to 20 seconds
    
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
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Claude API error: ${response.status}`;
      
      try {
        const error = JSON.parse(errorText);
        errorMsg = error.error?.message || errorMsg;
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMsg = `Claude API error: ${errorText}`;
        }
      }
      
      if (response.status === 401) {
        toast.error('Invalid Claude API key. Please check your API key in settings.');
        throw new Error('Invalid Claude API key');
      }
      
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error.name === 'AbortError') {
      toast.error('Claude API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Network error connecting to Claude. Check your internet connection or try a different model.');
    } else {
      toast.error(`Claude API error: ${error.message || 'Unknown error'}`);
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to Claude API' 
      };
    } else {
      const error = await response.json();
      if (response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid API key. Please check your Claude API key.' 
        };
      }
      return { 
        success: false, 
        message: error.error?.message || `Claude API error: ${response.status}` 
      };
    }
  } catch (error) {
    console.error('Claude connection test error:', error);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        message: 'Connection timed out. Please try again later.' 
      };
    } else if (error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        message: 'Network error. Please check your internet connection.' 
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
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout to 30 seconds
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'message-batches-2024-09-24'
      },
      body: JSON.stringify({ requests }),
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Claude batch API error: ${response.status}`;
      
      try {
        const error = JSON.parse(errorText);
        errorMsg = error.error?.message || errorMsg;
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMsg = `Claude batch API error: ${errorText}`;
        }
      }
      
      // Fall back to individual processing
      toast.warning(`Batch processing failed: ${errorMsg}. Trying individual requests...`);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Process batch results
    data.responses.forEach((response: any) => {
      if (response.status === 'success') {
        const result = response.content[0].text;
        onProgress(response.custom_id, result);
        
        // Save to logs
        const prompt = claudePrompts.find(p => p.id === response.custom_id);
        if (prompt) {
          saveLogEntry(prompt.prompt, result, prompt.model);
        }
      } else {
        onProgress(response.custom_id, `Error: ${response.error?.message || 'Unknown error'}`);
      }
    });
  } catch (error) {
    // If batch API fails, throw the error to be handled by the caller
    console.error('Batch processing failed:', error);
    throw error;
  }
};
