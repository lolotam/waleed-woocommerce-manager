
/**
 * OpenAI API Core Operations
 */
import { toast } from "sonner";
import { ApiTestResponse, AIModel } from '../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../config';

// Test OpenAI connection with improved key validation
export const testOpenAIConnection = async (apiKey: string): Promise<ApiTestResponse> => {
  // Update the testOpenAIConnection function's error message
  if (!apiKey || !isValidAPIKey(apiKey, 'openai')) {
    return { 
      success: false, 
      message: 'Invalid OpenAI API key format. Keys should start with "sk-proj-" and be 51 characters long.' 
    };
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid API key or organization ID. Please check your OpenAI API credentials.'
        };
      } else {
        return {
          success: false,
          message: errorData.error?.message || `API error: ${response.status} ${response.statusText}`
        };
      }
    }
    
    return {
      success: true,
      message: 'Successfully connected to OpenAI API!'
    };
  } catch (error) {
    console.error('OpenAI API test error:', error);
    return {
      success: false,
      message: `Network error when connecting to OpenAI API: ${error.message}`
    };
  }
};

// Generate content with OpenAI models
export const generateWithOpenAI = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured. Please check settings.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelConfig.apiModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: modelConfig.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};
