import { toast } from "sonner";
import { AIModel } from '../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../config';

export const generateWithOpenAI = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.openaiApiKey) {
    toast.error('OpenAI API key not configured. Please set up in Settings.');
    throw new Error('OpenAI API key not configured');
  }

  if (!isValidAPIKey(config.openaiApiKey, 'openai')) {
    toast.error('Invalid OpenAI API key format. Please check your key.');
    throw new Error('Invalid OpenAI API key format');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        toast.error('Invalid API key. Please regenerate your OpenAI key.');
        throw new Error('Invalid OpenAI API key');
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later or upgrade your plan.');
        throw new Error('OpenAI rate limit exceeded');
      }
      
      toast.error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Request failed'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    toast.error(`Connection error: ${error.message}`);
    throw error;
  }
};

// Test connections to OpenAI
export const testOpenAIConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey || !isValidAPIKey(apiKey, 'openai')) {
    return { 
      success: false, 
      message: 'API key format is invalid. OpenAI keys should start with "sk-"' 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    console.log('Testing OpenAI connection with API key:', apiKey.substring(0, 5) + '...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('OpenAI test connection response status:', response.status);

    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to OpenAI API' 
      };
    } else {
      const errorData = await response.text();
      console.error('OpenAI test connection error response:', errorData);
      
      let errorMessage = `OpenAI API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorMessage;
        }
      } catch (e) {
        // If parsing fails, use the raw error message
      }
      
      if (response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid API key. Please check your OpenAI API key.' 
        };
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  } catch (error) {
    console.error('OpenAI connection test error:', error);
    
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
