
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
    // Check for CORS proxy configuration
    const proxyUrl = window.CORS_PROXY || '';
    const targetUrl = 'https://api.anthropic.com/v1/messages/batches';
    const fetchUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
    
    console.log('Connecting to Claude Batch API via:', proxyUrl ? `CORS proxy (${proxyUrl})` : 'Direct connection');
    console.log('Batch API URL being used:', fetchUrl);
    
    const response = await fetch(fetchUrl, {
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
      mode: 'cors', // Explicitly request CORS mode
      credentials: 'omit' // Prevent sending browser credentials
    });

    clearTimeout(timeoutId);
    
    // Log response status for debugging
    console.log('Claude Batch API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude Batch API error response:', errorText);
      
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
    console.log('Claude Batch API response data:', JSON.stringify(data).substring(0, 200) + '...');
    
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
      // Enhanced error message for network issues
      const proxyUrl = window.CORS_PROXY || '';
      
      throw new Error(
        'Network error when connecting to Claude Batch API. ' +
        'This is likely due to CORS restrictions in your browser. ' +
        (proxyUrl ? 'The current CORS proxy may not be working. ' : 'No CORS proxy is currently configured. ') +
        'Please try setting a different CORS proxy in the Settings page or use individual processing instead.'
      );
    } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      throw new Error('Network error detected. This might be due to CORS restrictions or firewall settings blocking access to api.anthropic.com.');
    }
    
    throw error;
  }
};
