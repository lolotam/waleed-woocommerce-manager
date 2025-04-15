
/**
 * AI Configuration and Model Settings
 */
import { AIModel, ModelConfig, AIConfig } from './types';

// Configuration mapping for all supported models
export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  // OpenAI models
  gpt4o: { 
    apiModel: 'gpt-4o',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'GPT-4o - Balanced for most tasks'
  },
  gpt4o_mini: { 
    apiModel: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'GPT-4o Mini - Fast responses'
  },
  gpt45: { 
    apiModel: 'gpt-4.5-preview',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'GPT-4.5 - Advanced reasoning'
  },
  o1: { 
    apiModel: 'o1',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'o1 - Strongest reasoning abilities'
  },
  o1_mini: { 
    apiModel: 'o1-mini',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'o1-mini - Fast advanced reasoning'
  },
  o1_mini_high: { 
    apiModel: 'o1-mini-high',
    provider: 'openai',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'o1-mini-high - Great at coding'
  },
  
  // Claude models
  claude37: { 
    apiModel: 'claude-3-opus-20240229',
    provider: 'anthropic',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Claude 3.7 Sonnet - Most intelligent'
  },
  claude35_sonnet: { 
    apiModel: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Claude 3.5 Sonnet - Oct 2024'
  },
  claude35_haiku: { 
    apiModel: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    maxTokens: 1000,
    temperature: 0.7,
    description: 'Claude 3.5 Haiku - Fast daily tasks'
  },
  claude3_opus: { 
    apiModel: 'claude-3-opus-20240229',
    provider: 'anthropic',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Claude 3 Opus - Complex reasoning'
  },
  
  // Gemini models
  gemini_flash: { 
    apiModel: 'gemini-2.0-flash',
    provider: 'google',
    maxTokens: 2048,
    temperature: 0.7,
    description: 'Gemini 2.0 Flash - Everyday help'
  },
  gemini_flash_thinking: { 
    apiModel: 'gemini-2.0-flash-thinking',
    provider: 'google',
    maxTokens: 2048,
    temperature: 0.7,
    description: 'Gemini 2.0 Flash Thinking - Advanced reasoning'
  },
  gemini_pro: { 
    apiModel: 'gemini-2.5-pro',
    provider: 'google',
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Gemini 2.5 Pro - Complex tasks'
  },
  gemini_research: { 
    apiModel: 'gemini-deep-research',
    provider: 'google',
    maxTokens: 8192,
    temperature: 0.7,
    description: 'Gemini Deep Research - In-depth reports'
  }
};

// Get AI config from localStorage or use default empty values
export const getAiConfig = (): AIConfig => {
  const config = localStorage.getItem('ai_config');
  if (config) {
    return JSON.parse(config);
  }
  return {
    openaiApiKey: '',
    claudeApiKey: '',
    geminiApiKey: '',
    defaultModel: 'gpt4o'
  };
};

// Validate API key format
export const isValidAPIKey = (key: string, provider: string): boolean => {
  if (!key || key.trim() === '') return false;
  
  // More strict OpenAI key validation
  switch (provider) {
    case 'openai':
      // OpenAI API keys typically start with 'sk-' and are 51 characters long
      // But we'll do more thorough checks
      return key.startsWith('sk-') && 
             key.length === 51 && 
             /^sk-[a-zA-Z0-9]{48}$/.test(key);
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20;
    case 'google':
      return key.startsWith('AIza') && key.length > 20;
    default:
      return key.length > 20;
  }
};

// Get all available models with their descriptions
export const getAvailableModels = (): { id: AIModel, name: string, description: string, provider: string }[] => {
  return Object.entries(MODEL_CONFIGS).map(([key, config]) => ({
    id: key as AIModel,
    name: config.apiModel,
    description: config.description,
    provider: config.provider
  }));
};
