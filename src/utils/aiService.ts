
import { getAiConfig } from "./ai/config";
import { toast } from "sonner";

// Define available AI models
export type AIModel = 
  | 'gpt3'
  | 'gpt4'
  | 'gpt4o'
  | 'claude2'
  | 'claude3_haiku'
  | 'claude35_sonnet'
  | 'claude3_opus'
  | 'gemini_pro';

// Generate content using AI
export const generateContent = async (
  prompt: string,
  model: AIModel
): Promise<string> => {
  const config = getAiConfig();
  
  try {
    // Determine which AI service to use based on model
    if (model.startsWith('gpt')) {
      return await generateWithOpenAI(prompt, model, config.openaiApiKey);
    } else if (model.startsWith('claude')) {
      return await generateWithClaude(prompt, model, config.claudeApiKey);
    } else if (model.startsWith('gemini')) {
      return await generateWithGemini(prompt, model, config.geminiApiKey);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error(`AI generation error with ${model}:`, error);
    toast.error(`AI generation failed: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

// OpenAI implementation
const generateWithOpenAI = async (
  prompt: string,
  model: string,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  let modelName = 'gpt-4';
  if (model === 'gpt3') modelName = 'gpt-3.5-turbo';
  if (model === 'gpt4o') modelName = 'gpt-4o';
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are a skilled SEO expert who provides output in valid JSON format only. Your responses should always be valid JSON objects without any additional text before or after the JSON object.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API Error');
    }
    
    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim();
    
    console.log('OpenAI response:', result);
    return result;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Claude implementation
const generateWithClaude = async (
  prompt: string,
  model: string,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Claude API key is not configured');
  }
  
  let modelName = 'claude-2';
  if (model === 'claude35_sonnet') modelName = 'claude-3-5-sonnet-20240620';
  if (model === 'claude3_haiku') modelName = 'claude-3-haiku-20240307';
  if (model === 'claude3_opus') modelName = 'claude-3-opus-20240229';
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        system: 'You are a skilled SEO expert who provides output in valid JSON format only. Your responses should always be valid JSON objects without any additional text before or after the JSON object.',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API Error');
    }
    
    const data = await response.json();
    const result = data.content?.[0]?.text?.trim();
    
    console.log('Claude response:', result);
    return result;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};

// Gemini implementation
const generateWithGemini = async (
  prompt: string,
  model: string,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  
  const modelName = 'gemini-pro';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a skilled SEO expert who provides output in valid JSON format only. Your responses should always be valid JSON objects without any additional text before or after the JSON object.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API Error');
    }
    
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    console.log('Gemini response:', result);
    return result;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

// Add additional exports needed by components
export const testOpenAIConnection = async (apiKey: string): Promise<boolean> => {
  try {
    await generateWithOpenAI("Test connection", "gpt3", apiKey);
    return true;
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
};

export const testClaudeConnection = async (apiKey: string): Promise<boolean> => {
  try {
    await generateWithClaude("Test connection", "claude2", apiKey);
    return true;
  } catch (error) {
    console.error("Claude connection test failed:", error);
    return false;
  }
};

export const testGeminiConnection = async (apiKey: string): Promise<boolean> => {
  try {
    await generateWithGemini("Test connection", "gemini_pro", apiKey);
    return true;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
};

export const getAvailableModels = (): { id: string, name: string, provider: string }[] => {
  return [
    { id: 'gpt3', name: 'GPT-3.5 Turbo', provider: 'openai' },
    { id: 'gpt4', name: 'GPT-4', provider: 'openai' },
    { id: 'gpt4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'claude2', name: 'Claude 2', provider: 'anthropic' },
    { id: 'claude3_haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
    { id: 'claude35_sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'claude3_opus', name: 'Claude 3 Opus', provider: 'anthropic' },
    { id: 'gemini_pro', name: 'Gemini Pro', provider: 'google' }
  ];
};

// Placeholder functions for log-related operations
export const getAllLogs = async () => {
  return []; // Return empty array for now
};

export const exportLogsToExcel = async () => {
  toast.info("Export logs functionality not implemented yet");
  return false;
};

export default {
  generateContent,
  testOpenAIConnection,
  testClaudeConnection,
  testGeminiConnection,
  getAvailableModels,
  getAllLogs,
  exportLogsToExcel
};
