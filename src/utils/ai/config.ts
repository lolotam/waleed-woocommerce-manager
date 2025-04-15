
/**
 * AI Service Configuration
 */
import { AIModel, AIProvider, ModelConfig } from './types';

// Define model configurations
export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  // OpenAI Models
  gpt4o: {
    provider: 'openai',
    apiModel: 'gpt-4o',
    description: 'GPT-4o (Balanced)',
    maxTokens: 2048,
    temperature: 0.7
  },
  gpt4o_mini: {
    provider: 'openai',
    apiModel: 'gpt-4o-mini',
    description: 'GPT-4o Mini (Fast)',
    maxTokens: 2048,
    temperature: 0.7
  },
  gpt45: {
    provider: 'openai',
    apiModel: 'gpt-4-0125-preview',
    description: 'GPT-4.5 Turbo (Advanced)',
    maxTokens: 4096,
    temperature: 0.7
  },
  o1: {
    provider: 'openai',
    apiModel: 'o1',
    description: 'o1 (Strongest reasoning)',
    maxTokens: 4096,
    temperature: 0.7
  },
  o1_mini: {
    provider: 'openai',
    apiModel: 'o1-mini',
    description: 'o1-mini (Fast reasoning)',
    maxTokens: 4096,
    temperature: 0.7
  },
  o1_mini_high: {
    provider: 'openai',
    apiModel: 'o1-mini',
    description: 'o1-mini (High capacity)',
    maxTokens: 8192,
    temperature: 0.7
  },
  
  // Claude Models
  claude37: {
    provider: 'anthropic',
    apiModel: 'claude-3-7-sonnet-20240620',
    description: 'Claude 3.7 Sonnet',
    maxTokens: 4096,
    temperature: 0.7
  },
  claude35_sonnet: {
    provider: 'anthropic',
    apiModel: 'claude-3-5-sonnet-20240620',
    description: 'Claude 3.5 Sonnet',
    maxTokens: 4096,
    temperature: 0.7
  },
  claude35_haiku: {
    provider: 'anthropic',
    apiModel: 'claude-3-5-haiku-20240307',
    description: 'Claude 3.5 Haiku (Fast)',
    maxTokens: 2048,
    temperature: 0.7
  },
  claude3_opus: {
    provider: 'anthropic',
    apiModel: 'claude-3-opus-20240229',
    description: 'Claude 3 Opus',
    maxTokens: 4096,
    temperature: 0.7
  },
  
  // Gemini Models
  gemini_flash: {
    provider: 'google',
    apiModel: 'gemini-2.0-flash',
    description: 'Gemini 2.0 Flash',
    maxTokens: 2048,
    temperature: 0.7
  },
  gemini_flash_thinking: {
    provider: 'google',
    apiModel: 'gemini-2.0-flash-thinking',
    description: 'Gemini 2.0 Flash Thinking',
    maxTokens: 2048,
    temperature: 0.7
  },
  gemini_pro: {
    provider: 'google',
    apiModel: 'gemini-2.5-pro',
    description: 'Gemini 2.5 Pro',
    maxTokens: 4096,
    temperature: 0.7
  },
  gemini_research: {
    provider: 'google',
    apiModel: 'gemini-2.5-pro-research',
    description: 'Gemini Research',
    maxTokens: 8192,
    temperature: 0.7
  }
};

export interface AIConfig {
  openaiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
  defaultModel: AIModel;
}

// Get configuration from localStorage
export const getAiConfig = (): AIConfig => {
  const storedConfig = localStorage.getItem('ai_config');
  const defaultConfig: AIConfig = {
    openaiApiKey: '',
    claudeApiKey: '',
    geminiApiKey: '',
    defaultModel: 'gpt4o'
  };
  
  if (!storedConfig) {
    return defaultConfig;
  }
  
  try {
    const parsedConfig = JSON.parse(storedConfig);
    return {
      ...defaultConfig,
      ...parsedConfig
    };
  } catch (e) {
    console.error('Error parsing AI config:', e);
    return defaultConfig;
  }
};

// Get available models based on configured API keys
export const getAvailableModels = (): AIModel[] => {
  const config = getAiConfig();
  const models: AIModel[] = [];
  
  // Add models based on available API keys
  if (config.openaiApiKey && isValidAPIKey(config.openaiApiKey, 'openai')) {
    models.push('gpt4o', 'gpt4o_mini', 'gpt45', 'o1', 'o1_mini', 'o1_mini_high');
  }
  
  if (config.claudeApiKey && isValidAPIKey(config.claudeApiKey, 'anthropic')) {
    models.push('claude37', 'claude35_sonnet', 'claude35_haiku', 'claude3_opus');
  }
  
  if (config.geminiApiKey && isValidAPIKey(config.geminiApiKey, 'google')) {
    models.push('gemini_flash', 'gemini_flash_thinking', 'gemini_pro', 'gemini_research');
  }
  
  return models;
};

// Updated to support various API key formats including sk-proj
export const isValidAPIKey = (key: string, provider: string): boolean => {
  if (!key || key.trim() === '') return false;
  
  switch (provider) {
    case 'openai':
      // Support multiple OpenAI key formats (sk-, sk-proj-, etc.)
      return (
        (key.startsWith('sk-') && key.length >= 40) || 
        (key.startsWith('sk-proj-') && key.length >= 50)
      );
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20;
    case 'google':
      return key.startsWith('AIza') && key.length > 20;
    default:
      return key.length > 20;
  }
};
