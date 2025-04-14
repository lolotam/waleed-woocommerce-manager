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

// Validate API key format
const isValidAPIKey = (key: string, provider: string): boolean => {
  if (!key || key.trim() === '') return false;
  
  // Basic format checks for different providers
  switch (provider) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20;
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20;
    case 'google':
      return key.startsWith('AIza') && key.length > 20;
    default:
      return key.length > 20;
  }
};

// OpenAI API call
const generateWithOpenAI = async (prompt: string, modelKey: AIModel): Promise<string> => {
  const config = getAiConfig();
  const modelConfig = MODEL_CONFIGS[modelKey];
  
  if (!config.openaiApiKey) {
    toast.error('OpenAI API key not configured. Please check settings.');
    throw new Error('OpenAI API key not configured');
  }

  if (!isValidAPIKey(config.openaiApiKey, 'openai')) {
    toast.error('OpenAI API key format is invalid. Please check your API key.');
    throw new Error('Invalid OpenAI API key format');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        toast.error('Invalid OpenAI API key. Please check your API key in settings.');
        throw new Error('Invalid OpenAI API key');
      }
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error.name === 'AbortError') {
      toast.error('OpenAI API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Network error connecting to OpenAI. Please check your internet connection.');
    } else {
      toast.error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
    
    throw error;
  }
};

// Claude API call
const generateWithClaude = async (prompt: string, modelKey: AIModel): Promise<string> => {
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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
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
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        toast.error('Invalid Claude API key. Please check your API key in settings.');
        throw new Error('Invalid Claude API key');
      }
      throw new Error(error.error?.message || `Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error.name === 'AbortError') {
      toast.error('Claude API request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      toast.error('Network error connecting to Claude. Please check your internet connection.');
    } else {
      toast.error(`Claude API error: ${error.message || 'Unknown error'}`);
    }
    
    throw error;
  }
};

// Gemini API call
const generateWithGemini = async (prompt: string, modelKey: AIModel): Promise<string> => {
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

// Batch generation with Claude API
interface BatchPrompt {
  id: string;
  prompt: string;
  model: AIModel;
}

export const generateContentBatch = async (prompts: BatchPrompt[]): Promise<Record<string, string>> => {
  const config = getAiConfig();
  
  if (!config.claudeApiKey) {
    toast.error('Claude API key not configured. Please check settings.');
    throw new Error('Claude API key not configured');
  }

  if (!isValidAPIKey(config.claudeApiKey, 'anthropic')) {
    toast.error('Claude API key format is invalid. Please check your API key.');
    throw new Error('Invalid Claude API key format');
  }
  
  // Filter prompts by provider
  const claudePrompts = prompts.filter(p => MODEL_CONFIGS[p.model]?.provider === 'anthropic');
  const openaiPrompts = prompts.filter(p => MODEL_CONFIGS[p.model]?.provider === 'openai');
  const geminiPrompts = prompts.filter(p => MODEL_CONFIGS[p.model]?.provider === 'google');
  
  const results: Record<string, string> = {};
  const totalPrompts = prompts.length;
  let completedPrompts = 0;
  
  toast.loading(`Generating ${totalPrompts} content items...`);
  
  try {
    // Process Claude prompts in batch if there are any
    if (claudePrompts.length > 0) {
      const requests = claudePrompts.map(p => ({
        custom_id: p.id,
        params: {
          model: MODEL_CONFIGS[p.model].apiModel,
          max_tokens: MODEL_CONFIGS[p.model].maxTokens,
          messages: [{ role: 'user', content: p.prompt }]
        }
      }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout for batch
      
      const response = await fetch('https://api.anthropic.com/v1/messages/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'message-batches-2024-09-24'
        },
        body: JSON.stringify({ requests }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Claude batch API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process batch results
      data.responses.forEach((response: any) => {
        if (response.status === 'success') {
          const result = response.content[0].text;
          results[response.custom_id] = result;
          
          // Save to logs
          const prompt = claudePrompts.find(p => p.id === response.custom_id);
          if (prompt) {
            saveLogEntry(prompt.prompt, result, prompt.model);
          }
        } else {
          results[response.custom_id] = `Error: ${response.error?.message || 'Unknown error'}`;
        }
        completedPrompts++;
      });
    }
    
    // Process OpenAI prompts individually (if needed)
    if (openaiPrompts.length > 0) {
      await Promise.all(openaiPrompts.map(async (prompt) => {
        try {
          const result = await generateWithOpenAI(prompt.prompt, prompt.model);
          results[prompt.id] = result;
        } catch (error) {
          results[prompt.id] = `Error: ${error.message || 'Unknown error'}`;
        }
        completedPrompts++;
        toast.loading(`Generated ${completedPrompts}/${totalPrompts} content items...`);
      }));
    }
    
    // Process Gemini prompts individually (if needed)
    if (geminiPrompts.length > 0) {
      await Promise.all(geminiPrompts.map(async (prompt) => {
        try {
          const result = await generateWithGemini(prompt.prompt, prompt.model);
          results[prompt.id] = result;
        } catch (error) {
          results[prompt.id] = `Error: ${error.message || 'Unknown error'}`;
        }
        completedPrompts++;
        toast.loading(`Generated ${completedPrompts}/${totalPrompts} content items...`);
      }));
    }
    
    toast.success(`Generated ${completedPrompts}/${totalPrompts} content items successfully!`);
    return results;
  } catch (error) {
    console.error('Batch generation error:', error);
    toast.error(`Failed to generate content batch: ${error.message}`);
    throw error;
  } finally {
    toast.dismiss();
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
  } finally {
    toast.dismiss();
  }
};

// Test connections to AI providers
export const testOpenAIConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey || !isValidAPIKey(apiKey, 'openai')) {
    return { 
      success: false, 
      message: 'API key format is invalid. OpenAI keys should start with "sk-"' 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to OpenAI API' 
      };
    } else {
      const error = await response.json();
      if (response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid API key. Please check your OpenAI API key.' 
        };
      }
      return { 
        success: false, 
        message: error.error?.message || `OpenAI API error: ${response.status}` 
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
  generateContentBatch,
  getAvailableModels,
  getAllLogs,
  exportLogsToExcel,
  testOpenAIConnection,
  testClaudeConnection,
  testGeminiConnection
};
