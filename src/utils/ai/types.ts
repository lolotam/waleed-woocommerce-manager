
/**
 * AI Service Types
 */

// Updated model types to include all available options
export type AIModel = 
  // OpenAI models
  | 'gpt4o' | 'gpt4o_mini' | 'gpt45' | 'o1' | 'o1_mini' | 'o1_mini_high'
  // Claude models
  | 'claude37' | 'claude35_sonnet' | 'claude35_haiku' | 'claude3_opus'
  // Gemini models
  | 'gemini_flash' | 'gemini_flash_thinking' | 'gemini_pro' | 'gemini_research';

export interface AIConfig {
  openaiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
  defaultModel: AIModel;
}

// Model configuration for API calls
export interface ModelConfig {
  apiModel: string;
  provider: 'openai' | 'anthropic' | 'google';
  maxTokens: number;
  temperature: number;
  description: string;
}

// Model information for UI displays
export interface ModelInfo {
  id: AIModel;
  description: string;
  provider: 'openai' | 'anthropic' | 'google';
}

// Batch processing interface
export interface BatchPrompt {
  id: string;
  prompt: string;
  model: AIModel;
}

// API testing response interface
export interface ApiTestResponse {
  success: boolean;
  message: string;
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  prompt: string;
  result: string;
  model: AIModel;
  modelDescription: string;
}
