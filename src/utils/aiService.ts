
/**
 * AI Service for generating content using different AI models (OpenAI, Claude, Gemini)
 */
import { toast } from "sonner";

type AIModel = 'gpt4o' | 'claude3' | 'gemini';

interface AIConfig {
  openaiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
  defaultModel: AIModel;
}

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
    model
  });
  localStorage.setItem('ai_logs', JSON.stringify(logs));
};

// OpenAI API call
const generateWithOpenAI = async (prompt: string): Promise<string> => {
  const config = getAiConfig();
  
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
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
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
const generateWithClaude = async (prompt: string): Promise<string> => {
  const config = getAiConfig();
  
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
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
const generateWithGemini = async (prompt: string): Promise<string> => {
  const config = getAiConfig();
  
  if (!config.geminiApiKey) {
    toast.error('Gemini API key not configured');
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
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
  
  toast.loading(`Generating content with ${selectedModel}...`);
  
  try {
    let result: string;
    
    switch (selectedModel) {
      case 'gpt4o':
        result = await generateWithOpenAI(prompt);
        break;
      case 'claude3':
        result = await generateWithClaude(prompt);
        break;
      case 'gemini':
        result = await generateWithGemini(prompt);
        break;
      default:
        throw new Error(`Unknown model: ${selectedModel}`);
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
  getAllLogs,
  exportLogsToExcel
};
