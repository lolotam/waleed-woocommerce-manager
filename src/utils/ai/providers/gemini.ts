
/**
 * Gemini (Google) API Integration
 */
import { toast } from "sonner";
import { AIModel } from '../types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from '../config';

// Gemini API call
export const generateWithGemini = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.geminiApiKey) {
    toast.error('Gemini API key not configured. Please check settings.');
    throw new Error('Gemini API key not configured');
  }

  if (!isValidAPIKey(config.geminiApiKey, 'google')) {
    toast.error('Gemini API key format is invalid. Please check your API key.');
    throw new Error('Invalid Gemini API key format');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
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
      const error = await response.json();
      if (response.status === 400 && error.error?.message?.includes('API key')) {
        toast.error('Invalid Gemini API key. Please check your API key in settings.');
        throw new Error('Invalid Gemini API key');
      }
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (error.name === 'AbortError') {
      toast.error('Gemini API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Network error connecting to Gemini. Please check your internet connection.');
    } else {
      toast.error(`Gemini API error: ${error.message || 'Unknown error'}`);
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
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
      const error = await response.json();
      return { 
        success: false, 
        message: error.error?.message || `Gemini API error: ${response.status}` 
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
