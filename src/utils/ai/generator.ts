
/**
 * AI Content Generation Main Service
 */
import { toast } from "sonner";
import { AIModel, BatchPrompt } from './types';
import { MODEL_CONFIGS, getAiConfig, isValidAPIKey } from './config';
import { saveLogEntry } from './logs';

// Import provider-specific functions
import { generateWithOpenAI } from './providers/openai';
import { generateWithClaude, processBatchWithClaude } from './providers/claude';
import { generateWithGemini } from './providers/gemini';

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
    
    // Try the selected model first
    try {
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
      // If Claude fails and it's not an API key error, try OpenAI as fallback
      if (modelConfig.provider === 'anthropic' && 
          !error.message.includes('API key') && 
          config.openaiApiKey && 
          isValidAPIKey(config.openaiApiKey, 'openai')) {
        toast.warning(`Claude API error. Trying OpenAI as fallback...`);
        
        try {
          result = await generateWithOpenAI(prompt, 'gpt4o');
          saveLogEntry(prompt, result, 'gpt4o');
          toast.success('Content generated successfully with fallback model!');
          return result;
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          throw error; // Throw the original error
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    toast.error(`Failed to generate content: ${error.message}`);
    throw error;
  } finally {
    toast.dismiss();
  }
};

// Batch generation with different AI providers
export const generateContentBatch = async (prompts: BatchPrompt[]): Promise<Record<string, string>> => {
  const config = getAiConfig();
  
  if (!config.claudeApiKey && !config.openaiApiKey && !config.geminiApiKey) {
    toast.error('No API keys configured. Please check settings.');
    throw new Error('No API keys configured');
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
    if (claudePrompts.length > 0 && config.claudeApiKey && isValidAPIKey(config.claudeApiKey, 'anthropic')) {
      try {
        await processBatchWithClaude(claudePrompts, config, (id, result) => {
          results[id] = result;
          completedPrompts++;
          toast.loading(`Generated ${completedPrompts}/${totalPrompts} content items...`);
        });
      } catch (error) {
        // If batch API fails, fall back to individual processing
        console.error('Batch processing failed, falling back to individual requests:', error);
        
        // Process Claude prompts individually as fallback
        await Promise.all(claudePrompts.map(async (prompt) => {
          try {
            const result = await generateWithClaude(prompt.prompt, prompt.model);
            results[prompt.id] = result;
            saveLogEntry(prompt.prompt, result, prompt.model);
          } catch (error) {
            results[prompt.id] = `Error: ${error.message || 'Unknown error'}`;
          }
          completedPrompts++;
          toast.loading(`Generated ${completedPrompts}/${totalPrompts} content items...`);
        }));
      }
    }
    
    // Process OpenAI prompts individually
    if (openaiPrompts.length > 0 && config.openaiApiKey && isValidAPIKey(config.openaiApiKey, 'openai')) {
      await Promise.all(openaiPrompts.map(async (prompt) => {
        try {
          const result = await generateWithOpenAI(prompt.prompt, prompt.model);
          results[prompt.id] = result;
          saveLogEntry(prompt.prompt, result, prompt.model);
        } catch (error) {
          results[prompt.id] = `Error: ${error.message || 'Unknown error'}`;
        }
        completedPrompts++;
        toast.loading(`Generated ${completedPrompts}/${totalPrompts} content items...`);
      }));
    }
    
    // Process Gemini prompts individually
    if (geminiPrompts.length > 0 && config.geminiApiKey && isValidAPIKey(config.geminiApiKey, 'google')) {
      await Promise.all(geminiPrompts.map(async (prompt) => {
        try {
          const result = await generateWithGemini(prompt.prompt, prompt.model);
          results[prompt.id] = result;
          saveLogEntry(prompt.prompt, result, prompt.model);
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
