
export const isValidAPIKey = (key: string, provider: string): boolean => {
  if (!key || key.trim() === '') return false;
  
  switch (provider) {
    case 'openai':
      // More comprehensive OpenAI key validation
      const openaiKeyRegex = /^sk-proj-[a-zA-Z0-9]{48}$/;
      return openaiKeyRegex.test(key);
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20;
    case 'google':
      return key.startsWith('AIza') && key.length > 20;
    default:
      return key.length > 20;
  }
};
