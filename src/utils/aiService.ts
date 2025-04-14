
/**
 * AI Service for generating content using different AI models
 */
import { toast } from "sonner";

// Updated model types to include all available options
type AIModel = 
  // OpenAI models
  | 'gpt4o' | 'gpt4o_mini' | 'gpt45' | 'o1' | 'o1_mini' | 'o1_mini_high'
  // Claude models
  | 'claude37' | 'claude35_sonnet' | 'claude35_haiku' | 'claude3_opus'
  // Gemini models
  | 'gemini_flash' | 'gemini_flash_thinking' | 'gemini_pro' | 'gemini_research';

interface AIConfig {
  openaiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
  defaultModel: AIModel;
}

// Model configuration for API calls
interface ModelConfig {
  apiModel: string;
  provider: 'openai' | 'anthropic' | 'google';
  maxTokens: number;
  temperature: number;
  description: string;
}

// Configuration mapping for all supported models
const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
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
    apiModel: 'claude-3-7-sonnet-20240620',
    provider: 'anthropic',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Claude 3.7 Sonnet - Most intelligent'
  },
  claude35_sonnet: { 
    apiModel: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Claude 3.5 Sonnet - Oct 2024'
  },
  claude35_haiku: { 
    apiModel: 'claude-3-5-haiku-20240307',
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
const getAiConfig = (): AIConfig => {
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

// Save log entry to localStorage
const saveLogEntry = (prompt: string, result: string, model: AIModel) => {
  const logs = JSON.parse(localStorage.getItem('ai_logs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    prompt,
    result,
    model,
    modelDescription: MODEL_CONFIGS[model]?.description || model
  });
  localStorage.setItem('ai_logs', JSON.stringify(logs));
};

// OpenAI API call
const generateWithOpenAI = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.openaiApiKey) {
    toast.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
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
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    toast.error(`OpenAI API error: ${error.message}`);
    throw error;
  }
};

// Claude API call
const generateWithClaude = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.claudeApiKey) {
    toast.error('Claude API key not configured');
    throw new Error('Claude API key not configured');
  }

  try {
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
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    toast.error(`Claude API error: ${error.message}`);
    throw error;
  }
};

// Gemini API call
const generateWithGemini = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.geminiApiKey) {
    toast.error('Gemini API key not configured');
    throw new Error('Gemini API key not configured');
  }

  try {
    // Use the correct endpoint for the model
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
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    toast.error(`Gemini API error: ${error.message}`);
    throw error;
  }
};

// Main function to generate content with any model
export const generateContent = async (prompt: string, model?: AIModel): Promise<string> => {
  const config = getAiConfig();
  const selectedModel = model || config.defaultModel;
  const modelConfig = MODEL_CONFIGS[selectedModel];
  
  if (!modelConfig) {
    toast.error(`Unknown model: ${selectedModel}`);
    throw new Error(`Unknown model: ${selectedModel}`);
  }
  
  toast.loading(`Generating content with ${modelConfig.description}...`);
  
  try {
    let result: string;
    
    switch (modelConfig.provider) {
      case 'openai':
        result = await generateWithOpenAI(prompt, selectedModel);
        break;
      case 'anthropic':
        result = await generateWithClaude(prompt, selectedModel);
        break;
      case 'google':
        result = await generateWithGemini(prompt, selectedModel);
        break;
      default:
        throw new Error(`Unknown provider for model: ${selectedModel}`);
    }
    
    // Save to logs
    saveLogEntry(prompt, result, selectedModel);
    
    toast.success('Content generated successfully!');
    return result;
  } catch (error) {
    toast.error(`Failed to generate content: ${error.message}`);
    throw error;
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

export const getAllLogs = () => {
  return JSON.parse(localStorage.getItem('ai_logs') || '[]');
};

export const exportLogsToExcel = () => {
  const logs = getAllLogs();
  // In a real app, we'd use a library like xlsx to export to Excel
  // For this demo, we'll just download a JSON file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "ai_generation_logs.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export default {
  generateContent,
  getAvailableModels,
  getAllLogs,
  exportLogsToExcel
};
