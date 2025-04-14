
/**
 * Claude API Batch Processing
 */
import { BatchPrompt } from '../../types';
import { MODEL_CONFIGS } from '../../config';
import { saveLogEntry } from '../../logs';

// Process Claude prompts in batch
export const processBatchWithClaude = async (
  claudePrompts: BatchPrompt[], 
  config: { claudeApiKey: string },
  onProgress: (id: string, result: string) => void
): Promise<void> => {
  const requests = claudePrompts.map(p => ({
    custom_id: p.id,
    params: {
      model: MODEL_CONFIGS[p.model].apiModel,
      max_tokens: MODEL_CONFIGS[p.model].maxTokens,
      messages: [{ role: 'user', content: p.prompt }]
    }
  }));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'message-batches-2024-09-24'
      },
      body: JSON.stringify({ 
        requests,
        system: "You are Claude, a helpful AI assistant."
      }),
      signal: controller.signal,
      mode: 'cors' // Explicitly request CORS mode
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Claude batch API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMsg = errorJson.error.message || errorMsg;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw error text
        if (errorText) {
          errorMsg = `Claude batch API error: ${errorText}`;
        }
      }
      
      // Fall back to individual processing
      console.error('Batch processing failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Process batch results
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach((response: any) => {
        if (response.status === 'success' && response.content && response.content.length > 0) {
          const result = response.content[0].text;
          onProgress(response.custom_id, result);
          
          // Save to logs
          const prompt = claudePrompts.find(p => p.id === response.custom_id);
          if (prompt) {
            saveLogEntry(prompt.prompt, result, prompt.model);
          }
        } else {
          let errorMsg = 'Unknown error in batch processing';
          if (response.error && response.error.message) {
            errorMsg = response.error.message;
          }
          onProgress(response.custom_id, `Error: ${errorMsg}`);
        }
      });
    } else {
      throw new Error('Unexpected response format from Claude batch API');
    }
  } catch (error) {
    console.error('Batch processing failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Batch processing request timed out. Please try again later.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error when connecting to Claude API. Please check your internet connection and ensure that your firewall/network allows access to api.anthropic.com. If you\'re behind a corporate network, you may need to use a VPN or ask your IT department to whitelist this domain.');
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
