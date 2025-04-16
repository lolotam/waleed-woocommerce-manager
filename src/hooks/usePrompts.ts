
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
          setPrompts(JSON.parse(savedPrompts));
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
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
