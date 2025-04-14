
import React, { useState } from 'react';
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
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateContent, getAvailableModels } from '@/utils/aiService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AiGenerateButtonProps {
  onGenerate: (text: string) => void;
  productName?: string;
  category?: string;
  brand?: string;
  defaultPrompt?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  fieldType: 'description' | 'short_description' | 'tags' | 'focus_keyword' | 'meta_title' | 'meta_description' | 'alt_text' | 'image_title' | 'caption' | 'image_description';
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
  const availableModels = getAvailableModels();

  const handleOpen = () => {
    // Create default prompt based on field type and product data
    let defaultFieldPrompt = `${fieldTypePrompts[fieldType]} ${productName}`;
    
    if (brand) defaultFieldPrompt += ` by ${brand}`;
    if (category) defaultFieldPrompt += ` in the ${category} category`;
    
    // Add specific guidance based on field type
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
    setModel(availableModels[0]?.id || '');
    setIsOpen(true);
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
      toast.error('Failed to generate content. Please check AI settings.');
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
              Create content based on the product details. Edit the prompt to customize.
            </DialogDescription>
          </DialogHeader>

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
              disabled={isGenerating}
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
