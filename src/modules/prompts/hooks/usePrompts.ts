import { useQuery } from "@tanstack/react-query";
import { woocommerceApi, WooCommerceResponse } from "@/utils/api/woocommerceCore";
import { SavedPrompt } from "../types/prompts";

export interface Prompt {
  id: number;
  title: string;
  promptText: string;
  description: string;
  productType: string;
  aiRole: string;
  createdAt: string;
  updatedAt: string;
}

export const usePrompts = () => {
  const { data, isLoading, error } = useQuery<
    WooCommerceResponse<Prompt[]>,
    Error
  >({ 
    queryKey: ['prompts'],
    queryFn: () => woocommerceApi<Prompt[]>('wc/v3/prompts')
  });

  const prompts: SavedPrompt[] = data?.data.map(prompt => ({
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    promptText: prompt.promptText,
    productType: prompt.productType,
    aiRole: prompt.aiRole,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  })) ?? [];

  return {
    prompts,
    isLoading,
    error,
  };
};