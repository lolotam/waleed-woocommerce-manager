
import { toast } from "sonner";

// Exported types for AI configuration and response
export interface AiConfig {
  openaiApiKey?: string;
  claudeApiKey?: string;
  geminiApiKey?: string;
  defaultModel?: string;
}

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface LogEntry {
  timestamp: string;
  prompt: string;
  result: string;
  model: string;
}

// Get all logs from localStorage
export const getAllLogs = (): LogEntry[] => {
  try {
    const logs = localStorage.getItem("ai_generation_logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Error getting AI logs:", error);
    return [];
  }
};

// Log AI generation to localStorage
const logGeneration = (prompt: string, result: string, model: string) => {
  try {
    const logs = getAllLogs();
    logs.unshift({
      timestamp: new Date().toISOString(),
      prompt,
      result,
      model
    });
    
    // Limit logs to 100 entries to prevent localStorage overflow
    const trimmedLogs = logs.slice(0, 100);
    localStorage.setItem("ai_generation_logs", JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error("Error logging AI generation:", error);
  }
};

// Export logs to Excel
export const exportLogsToExcel = async () => {
  try {
    const XLSX = await import('xlsx');
    const logs = getAllLogs();
    
    // Format logs for Excel
    const formattedLogs = logs.map(log => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      Model: log.model,
      Prompt: log.prompt,
      Result: log.result
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI Generations");
    
    // Generate Excel file
    XLSX.writeFile(workbook, `ai_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Logs exported successfully");
  } catch (error) {
    console.error("Error exporting logs:", error);
    toast.error("Failed to export logs");
  }
};

// Get available AI models
export const getAvailableModels = (): AiModel[] => {
  const config = getAiConfig();
  const models: AiModel[] = [];
  
  if (config.openaiApiKey) {
    models.push(
      { id: "gpt3", name: "GPT-3.5 Turbo", provider: "openai", description: "GPT-3.5 Turbo" },
      { id: "gpt4", name: "GPT-4", provider: "openai", description: "GPT-4" },
      { id: "gpt4o", name: "GPT-4o", provider: "openai", description: "GPT-4o" }
    );
  }
  
  if (config.claudeApiKey) {
    models.push(
      { id: "claude2", name: "Claude 2", provider: "anthropic", description: "Claude 2" },
      { id: "claude3_haiku", name: "Claude 3 Haiku", provider: "anthropic", description: "Claude 3 Haiku" },
      { id: "claude35_sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", description: "Claude 3.5 Sonnet" },
      { id: "claude3_opus", name: "Claude 3 Opus", provider: "anthropic", description: "Claude 3 Opus" }
    );
  }
  
  if (config.geminiApiKey) {
    models.push(
      { id: "gemini_pro", name: "Gemini Pro", provider: "google", description: "Gemini Pro" },
      { id: "gemini_flash", name: "Gemini Flash", provider: "google", description: "Gemini Flash" }
    );
  }
  
  return models;
};

// Get AI configuration from localStorage
export const getAiConfig = (): AiConfig => {
  try {
    const configStr = localStorage.getItem("ai_config");
    return configStr ? JSON.parse(configStr) : {};
  } catch (error) {
    console.error("Error getting AI config:", error);
    return {};
  }
};

// Test OpenAI connection
export const testOpenAIConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }
  
  try {
    // Simulate API test for now
    // In a real implementation, you would make an actual API call to OpenAI
    console.log("Testing OpenAI connection with key:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3));
    return { success: true, message: "Connection successful" };
  } catch (error: any) {
    console.error("OpenAI connection test failed:", error);
    return { success: false, message: error.message || "Connection failed" };
  }
};

// Test Claude connection
export const testClaudeConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }
  
  try {
    // Simulate API test for now
    console.log("Testing Claude connection with key:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3));
    return { success: true, message: "Connection successful" };
  } catch (error: any) {
    console.error("Claude connection test failed:", error);
    return { success: false, message: error.message || "Connection failed" };
  }
};

// Test Gemini connection
export const testGeminiConnection = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }
  
  try {
    // Simulate API test for now
    console.log("Testing Gemini connection with key:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3));
    return { success: true, message: "Connection successful" };
  } catch (error: any) {
    console.error("Gemini connection test failed:", error);
    return { success: false, message: error.message || "Connection failed" };
  }
};

// Generate content with AI
export const generateContent = async (prompt: string, model: string): Promise<string> => {
  const config = getAiConfig();
  
  // Determine which provider to use based on the model
  let provider = "";
  let apiKey = "";
  
  if (model.startsWith("gpt")) {
    provider = "openai";
    apiKey = config.openaiApiKey || "";
  } else if (model.startsWith("claude")) {
    provider = "anthropic";
    apiKey = config.claudeApiKey || "";
  } else if (model.startsWith("gemini")) {
    provider = "google";
    apiKey = config.geminiApiKey || "";
  }
  
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}`);
  }
  
  try {
    // Simulate AI generation for now
    // In a real implementation, you would make actual API calls to the respective AI services
    console.log(`Generating content with ${model}`);
    console.log(`Prompt: ${prompt.substring(0, 50)}...`);
    
    // Generate a mock response for development
    const result = `This is a simulated AI response for the prompt: "${prompt.substring(0, 20)}..."\nGenerated with ${model}`;
    
    // Log the generation
    logGeneration(prompt, result, model);
    
    return result;
  } catch (error: any) {
    console.error(`Error generating content with ${model}:`, error);
    throw new Error(error.message || "Failed to generate content");
  }
};
