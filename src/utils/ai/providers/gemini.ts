
/**
 * Gemini (Google) API Integration
 */
import { AIModel } from '../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../config';

// Gemini API call
export const generateWithGemini = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.geminiApiKey) {
    throw new Error('Gemini API key not configured. Please check settings.');
  }

  if (!isValidAPIKey(config.geminiApiKey, 'google')) {
    throw new Error('Invalid Gemini API key format');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout to 30 seconds
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.apiModel}:generateContent?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxTokens,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Gemini API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorMessage;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorData) {
          errorMessage = `Gemini API error: ${errorData}`;
        }
      }
      
      if (response.status === 400 && errorMessage.includes('API key')) {
        throw new Error('Invalid Gemini API key');
      } else if (response.status === 429) {
        throw new Error('Gemini rate limit exceeded. Please try again later.');
      } else if (response.status === 404) {
        throw new Error(`Model '${modelConfig.apiModel}' not found or not available.`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates.length || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts.length) {
      throw new Error('Unexpected response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Gemini API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error connecting to Gemini. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Test connections to Gemini
export const testGeminiConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey || !isValidAPIKey(apiKey, 'google')) {
    return { 
      success: false, 
      message: 'API key format is invalid. Gemini keys should start with "AIza"' 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to Gemini API' 
      };
    } else {
      const errorData = await response.text();
      let errorMessage = `Gemini API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorMessage;
        }
      } catch (e) {
        // If parsing fails, use the raw error message
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  } catch (error) {
    console.error('Gemini connection test error:', error);
    
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
