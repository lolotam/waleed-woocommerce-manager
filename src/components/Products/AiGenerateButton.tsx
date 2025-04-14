import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Book, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateContent, getAvailableModels } from '@/utils/aiService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AiGenerateButtonProps {
  onGenerate: (text: string) => void;
  productName?: string;
  category?: string;
  brand?: string;
  defaultPrompt?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  fieldType: 'description' | 'short_description' | 'tags' | 'focus_keyword' | 'meta_title' | 'meta_description' | 'alt_text' | 'image_title' | 'caption' | 'image_description';
}

interface SavedPrompt {
  id: string;
  name: string;
  category: string;
  prompt: string;
  model: 'gpt4o' | 'claude3' | 'gemini';
  isDefault: boolean;
}

const fieldTypePrompts = {
  description: "Write a detailed product description for",
  short_description: "Write a concise product summary for",
  tags: "Generate relevant tags for",
  focus_keyword: "Generate SEO focus keywords for",
  meta_title: "Generate SEO meta title for",
  meta_description: "Generate SEO meta description for",
  alt_text: "Generate image alt text for",
  image_title: "Generate image title for",
  caption: "Generate image caption for",
  image_description: "Generate image description for"
};

const AiGenerateButton: React.FC<AiGenerateButtonProps> = ({ 
  onGenerate, 
  productName = '', 
  category = '', 
  brand = '',
  defaultPrompt,
  size = 'icon',
  fieldType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt || '');
  const [model, setModel] = useState('');
  const [activeTab, setActiveTab] = useState<'custom' | 'saved'>('custom');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const availableModels = getAvailableModels();

  useEffect(() => {
    const prompts = localStorage.getItem('saved_prompts');
    if (prompts) {
      try {
        const parsedPrompts = JSON.parse(prompts);
        setSavedPrompts(parsedPrompts);
      } catch (error) {
        console.error('Error parsing saved prompts:', error);
      }
    }
    
    const aiConfig = localStorage.getItem('ai_config');
    if (aiConfig) {
      try {
        const config = JSON.parse(aiConfig);
        if (!config.openaiApiKey && !config.claudeApiKey && !config.geminiApiKey) {
          setApiWarning('No AI API keys configured. Please set up API keys in Settings.');
        } else {
          setApiWarning(null);
        }
      } catch (error) {
        console.error('Error parsing AI config:', error);
      }
    } else {
      setApiWarning('No AI configuration found. Please set up API keys in Settings.');
    }
  }, []);

  const filteredPrompts = savedPrompts.filter(prompt => {
    if (fieldType === 'description' || fieldType === 'short_description') {
      return prompt.category.includes('product_description');
    } else if (fieldType === 'tags') {
      return prompt.category.includes('tag');
    } else if (fieldType === 'focus_keyword' || fieldType === 'meta_title' || fieldType === 'meta_description') {
      return prompt.category.includes('seo');
    } else if (fieldType === 'alt_text' || fieldType === 'image_title' || fieldType === 'caption' || fieldType === 'image_description') {
      return prompt.category.includes('image');
    }
    return true;
  });

  const handleOpen = () => {
    let defaultFieldPrompt = `${fieldTypePrompts[fieldType]} ${productName}`;
    
    if (brand) defaultFieldPrompt += ` by ${brand}`;
    if (category) defaultFieldPrompt += ` in the ${category} category`;
    
    switch (fieldType) {
      case 'description':
        defaultFieldPrompt += ". Include features, benefits, and use cases. Make it engaging and detailed.";
        break;
      case 'short_description':
        defaultFieldPrompt += ". Keep it under 2 sentences and highlight the key value proposition.";
        break;
      case 'tags':
        defaultFieldPrompt += ". Generate 5-7 tags separated by commas.";
        break;
      case 'focus_keyword':
        defaultFieldPrompt += ". Generate 1-3 highly relevant SEO keywords.";
        break;
      case 'meta_title':
        defaultFieldPrompt += ". Generate an SEO-optimized title under 60 characters.";
        break;
      case 'meta_description':
        defaultFieldPrompt += ". Generate an SEO-optimized meta description under 155 characters that encourages clicks.";
        break;
      case 'alt_text':
        defaultFieldPrompt += ". Generate concise image alt text that describes the product.";
        break;
      case 'image_title':
        defaultFieldPrompt += ". Generate a descriptive image title.";
        break;
      case 'caption':
        defaultFieldPrompt += ". Generate a short image caption that adds context.";
        break;
      case 'image_description':
        defaultFieldPrompt += ". Generate a detailed description of what might be in a product image.";
        break;
    }
    
    setPrompt(defaultFieldPrompt);
    
    const aiConfig = localStorage.getItem('ai_config');
    if (aiConfig) {
      try {
        const config = JSON.parse(aiConfig);
        if (config.defaultModel) {
          setModel(config.defaultModel);
        } else if (config.openaiApiKey) {
          setModel('gpt4o');
        } else if (config.claudeApiKey) {
          setModel('claude35_sonnet');
        } else if (config.geminiApiKey) {
          setModel('gemini_pro');
        } else {
          setModel(availableModels[0]?.id || '');
        }
      } catch (error) {
        console.error('Error parsing AI config:', error);
        setModel(availableModels[0]?.id || '');
      }
    } else {
      setModel(availableModels[0]?.id || '');
    }
    
    setIsOpen(true);
    setSelectedPrompt(null);
    setActiveTab('custom');
  };

  const handleSelectPrompt = (prompt: SavedPrompt) => {
    setSelectedPrompt(prompt);
    
    let processedPrompt = prompt.prompt
      .replace(/{product_name}/g, productName || 'this product')
      .replace(/{brand_name}/g, brand || 'this brand')
      .replace(/{category_name}/g, category || 'this category')
      .replace(/{keyword}/g, '');
    
    setPrompt(processedPrompt);
    setModel(prompt.model);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!model) {
      toast.error('Please select an AI model');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await generateContent(prompt, model as any);
      onGenerate(generatedContent);
      setIsOpen(false);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Generation error:', error);
      
      if (error.message?.includes('API key')) {
        toast.error('Invalid or missing API key. Please check AI settings.');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        toast.error('Network error. Please check your internet connection or try a different model.');
      } else {
        toast.error(`Failed to generate content: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size={size} 
        onClick={handleOpen}
        type="button"
        title="Generate with AI"
        className="flex-shrink-0"
      >
        <Wand2 className="h-4 w-4" />
        {size !== 'icon' && <span className="ml-2">Generate</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Content with AI</DialogTitle>
            <DialogDescription>
              Create content based on the product details. Choose from saved prompts or customize your own.
            </DialogDescription>
          </DialogHeader>

          {apiWarning && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {apiWarning}{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => window.location.href = '/settings'}
                >
                  Go to Settings
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'custom' | 'saved')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
              <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    AI Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="col-span-3">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="prompt" className="text-right pt-2">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                
                {productName && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-muted-foreground text-sm">
                      Product
                    </Label>
                    <div className="col-span-3 text-sm">
                      <Input value={productName} disabled className="bg-muted" />
                    </div>
                  </div>
                )}
                
                {brand && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-muted-foreground text-sm">
                      Brand
                    </Label>
                    <div className="col-span-3 text-sm">
                      <Input value={brand} disabled className="bg-muted" />
                    </div>
                  </div>
                )}
                
                {category && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-muted-foreground text-sm">
                      Category
                    </Label>
                    <div className="col-span-3 text-sm">
                      <Input value={category} disabled className="bg-muted" />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-4">
              {filteredPrompts.length > 0 ? (
                <div className="space-y-4">
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-3">
                      {filteredPrompts.map((savedPrompt) => (
                        <div 
                          key={savedPrompt.id} 
                          className={`p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors ${selectedPrompt?.id === savedPrompt.id ? 'border-primary bg-muted/50' : ''}`}
                          onClick={() => handleSelectPrompt(savedPrompt)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium">{savedPrompt.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{savedPrompt.prompt}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {savedPrompt.model === 'gpt4o' ? 'GPT-4o' : 
                                 savedPrompt.model === 'claude3' ? 'Claude 3' : 'Gemini'}
                              </Badge>
                              {savedPrompt.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {selectedPrompt && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="selected-prompt" className="text-right pt-2">
                          Selected Prompt
                        </Label>
                        <Textarea
                          id="selected-prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="col-span-3 min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredPrompts.length} prompts for {fieldType.replace('_', ' ')}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/prompts'}
                      type="button"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Prompts
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Book className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No prompts found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No prompts found for {fieldType.replace('_', ' ')}. 
                    Visit the Prompt Manager to create new prompts.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/prompts'}
                    className="mt-4"
                    type="button"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Go to Prompt Manager
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiGenerateButton;
