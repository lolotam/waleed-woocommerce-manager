
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getAiConfig } from "@/utils/ai/config";
import { AlertCircle, Sparkles, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePrompts } from "@/hooks/usePrompts";

interface PromptSettingsProps {
  provider: string;
  onProviderChange: (provider: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onStartProcessing: () => void;
  productsCount: number;
  productType: string;
  onProductTypeChange: (productType: string) => void;
  aiRole: string;
  onAiRoleChange: (aiRole: string) => void;
}

const PromptSettings = ({
  provider,
  onProviderChange,
  model,
  onModelChange,
  prompt,
  onPromptChange,
  onStartProcessing,
  productsCount,
  productType,
  onProductTypeChange,
  aiRole,
  onAiRoleChange
}: PromptSettingsProps) => {
  const config = getAiConfig();
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);
  const [isClaudeConfigured, setIsClaudeConfigured] = useState(false);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const { prompts } = usePrompts();
  const [promptTitle, setPromptTitle] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptDescription, setPromptDescription] = useState("");

  const savePrompt = (promptData: any) => {
    try {
      const existingPrompts = localStorage.getItem('savedPrompts');
      const prompts = existingPrompts ? JSON.parse(existingPrompts) : [];
      
      prompts.push({
        ...promptData,
        id: Date.now().toString(),
      });
      
      localStorage.setItem('savedPrompts', JSON.stringify(prompts));
      return true;
    } catch (error) {
      console.error('Error saving prompt:', error);
      throw error;
    }
  };

  useEffect(() => {
    setIsOpenAIConfigured(!!config.openaiApiKey);
    setIsClaudeConfigured(!!config.claudeApiKey);
    setIsGeminiConfigured(!!config.geminiApiKey);
    
    if (provider === "" && config.openaiApiKey) {
      onProviderChange("openai");
    } else if (provider === "" && config.claudeApiKey) {
      onProviderChange("anthropic");
    } else if (provider === "" && config.geminiApiKey) {
      onProviderChange("google");
    }
  }, [config, provider, onProviderChange]);

  const getDefaultPrompt = () => {
    return `You are an expert SEO copywriter for ${productType || "general"} products.

As a ${aiRole || "SEO expert"}, analyze the following product data and generate optimized SEO content:

Product ID: {{id}}
Product Title: {{title}}
Product URL: {{url}}

Please provide the following in a valid JSON format:
{
  "meta_title": "SEO optimized title (max 60 characters)",
  "meta_description": "Compelling meta description with keywords (max 160 characters)",
  "focus_keyword": "primary keyword phrase",
  "short_description": "Enhanced product short description with keywords naturally integrated"
}

Make sure your response is ONLY valid JSON. Do not include any other text, explanations, or markdown.`;
  };

  useEffect(() => {
    if (!prompt) {
      onPromptChange(getDefaultPrompt());
    }
  }, [prompt, productType, aiRole, onPromptChange]);

  const handleSavePrompt = () => {
    if (!promptTitle) {
      toast.error("Please enter a title for the prompt");
      return;
    }

    try {
      savePrompt({
        title: promptTitle,
        description: promptDescription || `A prompt for ${productType} products as a ${aiRole}`,
        promptText: prompt,
        productType,
        aiRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success("Prompt saved successfully");
      setShowSavePrompt(false);
      setPromptTitle("");
      setPromptDescription("");
    } catch (error) {
      toast.error(`Failed to save prompt: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {(!isOpenAIConfigured && !isClaudeConfigured && !isGeminiConfigured) ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No AI provider configured</AlertTitle>
          <AlertDescription>
            Please configure at least one AI provider API key in the settings page.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.href = '/settings'}
          >
            Go to Settings
          </Button>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select 
                value={provider} 
                onValueChange={onProviderChange} 
                disabled={!isOpenAIConfigured && !isClaudeConfigured && !isGeminiConfigured}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {isOpenAIConfigured && (
                    <SelectItem value="openai">OpenAI</SelectItem>
                  )}
                  {isClaudeConfigured && (
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  )}
                  {isGeminiConfigured && (
                    <SelectItem value="google">Google Gemini</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select 
                value={model} 
                onValueChange={onModelChange}
                disabled={!provider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {provider === 'openai' && (
                    <>
                      <SelectItem value="gpt3">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt4">GPT-4</SelectItem>
                      <SelectItem value="gpt4o">GPT-4o</SelectItem>
                    </>
                  )}
                  {provider === 'anthropic' && (
                    <>
                      <SelectItem value="claude2">Claude 2</SelectItem>
                      <SelectItem value="claude3_haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude35_sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude3_opus">Claude 3 Opus</SelectItem>
                    </>
                  )}
                  {provider === 'google' && (
                    <SelectItem value="gemini_pro">Gemini Pro</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="product-type">Product Type</Label>
              <div className="text-xs text-muted-foreground">Used to optimize AI responses</div>
            </div>
            <RadioGroup 
              className="flex flex-wrap gap-2" 
              value={productType} 
              onValueChange={onProductTypeChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="cursor-pointer">General</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="electronics" id="electronics" />
                <Label htmlFor="electronics" className="cursor-pointer">Electronics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fashion" id="fashion" />
                <Label htmlFor="fashion" className="cursor-pointer">Fashion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="cursor-pointer">Home Goods</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beauty" id="beauty" />
                <Label htmlFor="beauty" className="cursor-pointer">Beauty</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="food" id="food" />
                <Label htmlFor="food" className="cursor-pointer">Food</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="ai-role">AI Role</Label>
              <div className="text-xs text-muted-foreground">How the AI should approach SEO</div>
            </div>
            <RadioGroup 
              className="flex flex-wrap gap-2" 
              value={aiRole} 
              onValueChange={onAiRoleChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seo_expert" id="seo_expert" />
                <Label htmlFor="seo_expert" className="cursor-pointer">SEO Expert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copywriter" id="copywriter" />
                <Label htmlFor="copywriter" className="cursor-pointer">Copywriter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="marketing_specialist" id="marketing_specialist" />
                <Label htmlFor="marketing_specialist" className="cursor-pointer">Marketing Specialist</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conversion_optimizer" id="conversion_optimizer" />
                <Label htmlFor="conversion_optimizer" className="cursor-pointer">Conversion Optimizer</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt" className="text-base">Prompt Template</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPromptChange(getDefaultPrompt())}
              >
                Reset to Default
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Use &#123;&#123;id&#125;&#125;, &#123;&#123;title&#125;&#125;, and &#123;&#123;url&#125;&#125; as placeholders for product data
            </div>
            <Textarea 
              id="prompt"
              placeholder="Enter your AI prompt here..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-[240px] font-mono text-sm"
            />
          </div>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSavePrompt(!showSavePrompt)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Prompt
              </Button>
            </div>

            <Button 
              onClick={onStartProcessing}
              disabled={!prompt || !provider || !model || productsCount === 0}
              className="w-full sm:w-auto gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Process {productsCount} Products
            </Button>
          </div>
          
          {showSavePrompt && (
            <Card className="p-4 space-y-4">
              <h3 className="text-lg font-medium">Save Prompt Template</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="prompt-title">Prompt Title</Label>
                  <input
                    id="prompt-title"
                    className="w-full px-3 py-2 border rounded-md"
                    value={promptTitle}
                    onChange={(e) => setPromptTitle(e.target.value)}
                    placeholder="E.g., Electronics SEO Template"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prompt-description">Description (Optional)</Label>
                  <Textarea
                    id="prompt-description"
                    value={promptDescription}
                    onChange={(e) => setPromptDescription(e.target.value)}
                    placeholder="Brief description of this prompt template"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowSavePrompt(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePrompt}>
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptSettings;
