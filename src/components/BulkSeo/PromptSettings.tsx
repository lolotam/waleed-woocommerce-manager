
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AIModel, getAvailableModels } from "@/utils/aiService";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAiConfig } from "@/utils/ai/config";

interface PromptSettingsProps {
  provider: string;
  onProviderChange: (provider: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onStartProcessing: () => void;
  productsCount: number;
}

const defaultPrompt = `Generate SEO content for this product:
- Create a compelling product description of at least 300 words
- Write a short description of 50-100 words
- Suggest 5-10 relevant keywords separated by commas
- Create an SEO-optimized meta title (max 60 chars)
- Write a meta description (max 160 chars)
- Provide 4 relevant tags for this product

Product ID: {{id}}
Product Title: {{title}}
Product URL: {{url}}

Format the response in JSON using this exact structure:
{
  "long_description": "Detailed product description here...",
  "short_description": "Brief product description here...",
  "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "meta_title": "SEO-Optimized Title Here",
  "meta_description": "Compelling meta description that encourages clicks...",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "image_seo": {
    "alt_text": "Descriptive alt text for product image",
    "title": "Image title for SEO",
    "description": "Brief description of the image",
    "caption": "Optional caption for the image"
  }
}`;

const PromptSettings = ({
  provider,
  onProviderChange,
  model,
  onModelChange,
  prompt,
  onPromptChange,
  onStartProcessing,
  productsCount
}: PromptSettingsProps) => {
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [hasApiKeys, setHasApiKeys] = useState<{[key: string]: boolean}>({
    openai: false,
    anthropic: false,
    google: false
  });
  
  useEffect(() => {
    // Get available models and check API keys
    const models = getAvailableModels();
    const config = getAiConfig();
    
    setHasApiKeys({
      openai: !!config.openaiApiKey,
      anthropic: !!config.claudeApiKey,
      google: !!config.geminiApiKey
    });
    
    // Filter models by provider
    let filteredModels;
    if (provider === 'openai') {
      filteredModels = models.filter(m => m.provider === 'openai');
    } else if (provider === 'anthropic') {
      filteredModels = models.filter(m => m.provider === 'anthropic');
    } else if (provider === 'google') {
      filteredModels = models.filter(m => m.provider === 'google');
    } else {
      filteredModels = models;
    }
    
    setAvailableModels(filteredModels);
    
    // Set default model for provider if current model doesn't match provider
    if (filteredModels.length > 0 && !filteredModels.some(m => m.id === model)) {
      onModelChange(filteredModels[0].id);
    }
  }, [provider, model, onModelChange]);
  
  // Set default prompt if empty
  useEffect(() => {
    if (!prompt) {
      onPromptChange(defaultPrompt);
    }
  }, [prompt, onPromptChange]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select
            value={provider}
            onValueChange={onProviderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai" disabled={!hasApiKeys.openai}>OpenAI {!hasApiKeys.openai && "(API key required)"}</SelectItem>
              <SelectItem value="anthropic" disabled={!hasApiKeys.anthropic}>Claude (Anthropic) {!hasApiKeys.anthropic && "(API key required)"}</SelectItem>
              <SelectItem value="google" disabled={!hasApiKeys.google}>Gemini (Google) {!hasApiKeys.google && "(API key required)"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">AI Model</Label>
          <Select
            value={model}
            onValueChange={onModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.description}
                </SelectItem>
              ))}
              {availableModels.length === 0 && (
                <SelectItem value="none" disabled>No models available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(!hasApiKeys.openai && !hasApiKeys.anthropic && !hasApiKeys.google) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <p className="text-amber-800">
                You need to configure at least one AI provider in the settings to use this feature.
              </p>
              <Link 
                to="/settings" 
                className="text-blue-600 hover:underline flex items-center"
              >
                Go to Settings to configure AI providers
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt Template</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter your prompt here..."
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">
          Use placeholders like &#123;&#123;id&#125;&#125;, &#123;&#123;title&#125;&#125;, and &#123;&#123;url&#125;&#125; which will be replaced with actual product data.
        </p>
      </div>
      
      <Card className="bg-muted/40">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to process {productsCount} products</h3>
              <p className="text-sm text-muted-foreground">
                This will generate SEO content for all products using {provider} {model}.
              </p>
            </div>
            <Button 
              onClick={onStartProcessing}
              disabled={
                !prompt || 
                prompt.trim() === "" || 
                productsCount === 0 || 
                (!hasApiKeys.openai && !hasApiKeys.anthropic && !hasApiKeys.google)
              }
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start Processing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptSettings;
