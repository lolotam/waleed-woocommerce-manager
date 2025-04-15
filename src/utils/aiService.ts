
/**
 * AI Service for generating content using different AI models
 * This file re-exports all functionality from the modularized AI service
 */

// Re-export types
import { AIModel, BatchPrompt, ApiTestResponse } from './ai/types';
export type { AIModel, BatchPrompt, ApiTestResponse };

// Re-export core functionality
import { generateContent, generateContentBatch } from './ai/generator';
export { generateContent, generateContentBatch };

// Re-export configuration utilities
import { getAvailableModels, isValidAPIKey } from './ai/config';
export { getAvailableModels, isValidAPIKey };

// Re-export logging utilities
import { getAllLogs, exportLogsToExcel } from './ai/logs';
export { getAllLogs, exportLogsToExcel };

// Re-export connection testing utilities
import { testOpenAIConnection } from './ai/providers/openai';
import { testClaudeConnection } from './ai/providers/claude';
import { testGeminiConnection } from './ai/providers/gemini';
export { testOpenAIConnection, testClaudeConnection, testGeminiConnection };

// Export default object for backward compatibility
export default {
  generateContent,
  generateContentBatch,
  getAvailableModels,
  getAllLogs,
  exportLogsToExcel,
  testOpenAIConnection,
  testClaudeConnection,
  testGeminiConnection,
  isValidAPIKey
};
