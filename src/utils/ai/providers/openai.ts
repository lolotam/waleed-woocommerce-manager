
// Update the testOpenAIConnection function's error message
if (!apiKey || !isValidAPIKey(apiKey, 'openai')) {
  return { 
    success: false, 
    message: 'Invalid OpenAI API key format. Keys should start with "sk-proj-" and be 51 characters long.' 
  };
}
