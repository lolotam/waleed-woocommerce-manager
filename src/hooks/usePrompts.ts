
import { useEffect, useState } from 'react';

export interface SavedPrompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  productType: string;
  aiRole: string;
  createdAt: string;
  updatedAt: string;
}

// Mock storage - in a real app, this would be replaced with API calls
const STORAGE_KEY = 'saved_prompts';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load prompts from localStorage
  useEffect(() => {
    const loadPrompts = () => {
      try {
        setIsLoading(true);
        const savedPrompts = localStorage.getItem(STORAGE_KEY);
        if (savedPrompts) {
          const parsedPrompts = JSON.parse(savedPrompts);
          // Ensure all prompts have the required fields
          const validPrompts = parsedPrompts.map((prompt: Partial<SavedPrompt>) => ({
            id: prompt.id || crypto.randomUUID(),
            title: prompt.title || 'Untitled Prompt',
            description: prompt.description || '',
            promptText: prompt.promptText || '',
            productType: prompt.productType || 'general',
            aiRole: prompt.aiRole || 'seo_expert',
            createdAt: prompt.createdAt || new Date().toISOString(),
            updatedAt: prompt.updatedAt || new Date().toISOString()
          }));
          setPrompts(validPrompts);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
        setPrompts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, []);

  // Get a specific prompt by ID
  const getPromptById = (id: string): SavedPrompt | undefined => {
    return prompts.find(prompt => prompt.id === id);
  };

  return {
    prompts,
    isLoading,
    getPromptById
  };
};
