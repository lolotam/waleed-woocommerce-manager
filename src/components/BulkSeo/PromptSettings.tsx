
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AIModel, getAvailableModels } from "@/utils/aiService";
import { Play, Wand2, BookOpen, Upload, X, Plus, Link } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getAiConfig } from "@/utils/ai/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

const fragrancePrompt = `You are an expert eCommerce SEO product description writer specializing in fragrance content optimization. Your task is to write a high-converting, SEO-optimized product description for this fragrance. Follow these instructions precisely.

📌 Product Information
Fragrance Name: {{title}}
Product Link: {{url}}
Product ID: {{id}}
Competitor Websites for Research:
{{competitor_websites}}

✅ Instructions:

1. Keyword Optimization
- Research and identify high-search-volume keywords relevant to this fragrance.
- Use these keywords naturally throughout the content in <strong> tags.

2. Long Product Description (300+ words)
Create a compelling, HTML-formatted product description that includes:
- The Focus Keyword at the beginning of the content
- The Focus Keyword used multiple times throughout
- The Focus Keyword in H2, H3, or H4 subheadings
- A properly formatted HTML table for Product Info (Size, Gender, Product Type, Concentration, Brand)
- A properly formatted HTML table for Fragrance Notes (Top, Heart, Base)
- A list of Key Features (bulleted or paragraph style)
- A short history/background about this perfume or brand
- One frequently searched question with a detailed answer
- Emotional language with appropriate emojis (🌸, 💫, 🌿, 🔥, 💎, ✨)
- Six hyperlinked words 
 -(3 external links refers to perfume databases from this website only "https://www.wikiparfum.com/") 
 -(3 internal links chosen randomly from this list):
{{hyperlinks}}

IMPORTANT: You MUST format your response with EXACTLY these section headings:

🔹 Product Description (HTML Format):
[Your HTML-formatted product description as specified above]

🔹 Short Description (Max 50 words):
[A punchy, enticing summary that captures the fragrance's essence and highlights main notes]

🔹 SEO Title (Max 60 characters):
[Title with Focus Keyword, under 60 characters, with a power word, sentiment, and number]

🔹 Meta Description (Max 155 characters):
[Active voice description with Focus Keyword and clear call to action]

🔹 Alt Text for Product Images:
[Descriptive, keyword-rich alt text using the product title]

🔹 Image Title:
[Full product title]

🔹 Image Caption:
[Short, elegant caption fitting the tone of luxury fragrances]

🔹 Image Description:
[Brief 1-2 sentence description using product title and main keywords]

🔹 SEO Tags (6 High-Search Keywords):
[EXACTLY 6 high-volume keywords separated by commas]

🔹 Focus Keywords:
[4 high-search-volume keywords relevant to the fragrance, separated by commas]

DO NOT skip any of these sections. DO NOT add any explanations or additional sections`;

const electronics = `You are an expert eCommerce SEO content writer and digital marketing specialist for electronics products. Your task is to create high-converting, SEO-optimized product content for this electronic device. Follow these instructions precisely.

📌 Product Information
Product Name: {{title}}
Product Link: {{url}}
Product ID: {{id}}
Competitor Websites for Research:
{{competitor_websites}}

✅ Instructions:

1. Keyword Optimization
- Research and identify high-search-volume keywords relevant to this electronic device
- Use these keywords naturally throughout the content in <strong> tags

2. Long Product Description (300+ words)
Create a compelling, HTML-formatted product description that includes:
- Technical specifications in a properly formatted HTML table
- Key features in a bulleted list
- Benefits section explaining how these features improve the user experience
- Comparison with similar products (when applicable)
- One FAQ with a detailed answer addressing a common concern
- Use of technical but accessible language to build credibility
- Include hyperlinks to relevant pages:
{{hyperlinks}}

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

const clothing = `You are a professional fashion copywriter and SEO specialist. Your task is to create compelling, SEO-optimized content for this clothing item that converts browsers into buyers. Follow these instructions precisely.

📌 Product Information
Product Name: {{title}}
Product Link: {{url}}
Product ID: {{id}}
Competitor Websites for Research:
{{competitor_websites}}

✅ Instructions:

1. Keyword Optimization
- Research and identify high-search-volume keywords relevant to this fashion item
- Use these keywords naturally throughout the content

2. Long Product Description (300+ words)
Create a stylish, HTML-formatted product description that includes:
- Material and fabric details in a properly formatted HTML table
- Styling suggestions (what to pair it with)
- Occasion recommendations (where to wear it)
- Sizing and fit information
- Care instructions
- Seasonal relevance
- Use aspirational and emotional language that helps customers envision themselves wearing the item
- Include these hyperlinks where appropriate:
{{hyperlinks}}

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
  const [productType, setProductType] = useState("general");
  const [aiRole, setAiRole] = useState("seo_expert");
  const [activeTab, setActiveTab] = useState<string>("template");
  
  // New states for competitor websites
  const [competitorWebsites, setCompetitorWebsites] = useState<string[]>([
    "https://www.fragrantica.com",
    "https://klinq.com",
    "https://www.brandatt.com"
  ]);
  const [newWebsite, setNewWebsite] = useState("");
  
  // New state for hyperlinks from file
  const [hyperlinks, setHyperlinks] = useState<string[]>([
    "https://xsellpoint.com/product-category/new-arrival/",
    "https://xsellpoint.com/product-category/best-sellers/",
    "https://xsellpoint.com/product-category/shop-by-brand/brand-international/cartier/"
  ]);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle product type change
  const handleProductTypeChange = (type: string) => {
    setProductType(type);
    
    // Update prompt based on product type
    let updatedPrompt = "";
    if (type === "fragrance") {
      updatedPrompt = fragrancePrompt;
    } else if (type === "electronics") {
      updatedPrompt = electronics;
    } else if (type === "clothing") {
      updatedPrompt = clothing;
    } else {
      updatedPrompt = defaultPrompt;
    }
    
    // Add competitor websites and hyperlinks placeholders to the prompt
    updatedPrompt = updatedPrompt
      .replace("{{competitor_websites}}", competitorWebsites.map(w => `- ${w}`).join("\n"))
      .replace("{{hyperlinks}}", hyperlinks.map(link => `  -${link}`).join("\n"));
    
    onPromptChange(updatedPrompt);
  };

  // Handle AI role change
  const handleAiRoleChange = (role: string) => {
    setAiRole(role);
    
    // Create a modified prompt based on the selected role
    let currentPrompt = prompt;
    
    // Replace or add the role at the beginning of the prompt
    const roleIntros: {[key: string]: string} = {
      seo_expert: "You are an expert eCommerce SEO content writer. ",
      marketer: "You are a professional digital marketer specializing in eCommerce conversion optimization. ",
      copywriter: "You are a creative copywriter with expertise in crafting persuasive product descriptions. ",
      developer: "You are a technical writer with SEO expertise who can explain complex products clearly. ",
      brand_specialist: "You are a luxury brand specialist who understands premium product positioning and storytelling. "
    };
    
    // Remove any existing role intro
    Object.values(roleIntros).forEach(intro => {
      currentPrompt = currentPrompt.replace(intro, "");
    });
    
    // Add the new role intro at the beginning
    if (roleIntros[role]) {
      currentPrompt = roleIntros[role] + currentPrompt;
    }
    
    onPromptChange(currentPrompt);
  };
  
  // Handle competitor website input
  const handleAddCompetitorWebsite = () => {
    if (newWebsite.trim() && !competitorWebsites.includes(newWebsite.trim())) {
      const updatedWebsites = [...competitorWebsites, newWebsite.trim()];
      setCompetitorWebsites(updatedWebsites);
      setNewWebsite("");
      
      // Update the prompt with new competitor websites
      let updatedPrompt = prompt.replace(
        /{{competitor_websites}}/g, 
        updatedWebsites.map(w => `- ${w}`).join("\n")
      );
      
      onPromptChange(updatedPrompt);
    }
  };
  
  // Handle competitor website removal
  const handleRemoveCompetitorWebsite = (websiteToRemove: string) => {
    const updatedWebsites = competitorWebsites.filter(website => website !== websiteToRemove);
    setCompetitorWebsites(updatedWebsites);
    
    // Update the prompt with updated competitor websites
    let updatedPrompt = prompt.replace(
      /{{competitor_websites}}/g, 
      updatedWebsites.map(w => `- ${w}`).join("\n")
    );
    
    onPromptChange(updatedPrompt);
  };
  
  // Handle hyperlinks file upload
  const handleHyperlinksFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        // Process file content (assuming each line is a hyperlink)
        const links = content.split('\n')
          .map(line => line.trim())
          .filter(line => line && (line.startsWith('http://') || line.startsWith('https://')));
        
        if (links.length > 0) {
          setHyperlinks(links);
          
          // Update the prompt with new hyperlinks
          let updatedPrompt = prompt.replace(
            /{{hyperlinks}}/g, 
            links.map(link => `  -${link}`).join("\n")
          );
          
          onPromptChange(updatedPrompt);
          toast.success(`Loaded ${links.length} hyperlinks from file`);
        } else {
          toast.error("No valid hyperlinks found in the file");
        }
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="template">Templates & Options</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Prompt Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-type">Product Type</Label>
              <Select
                value={productType}
                onValueChange={handleProductTypeChange}
              >
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Products</SelectItem>
                  <SelectItem value="fragrance">Fragrances & Perfumes</SelectItem>
                  <SelectItem value="electronics">Electronics & Gadgets</SelectItem>
                  <SelectItem value="clothing">Clothing & Fashion</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will load a specialized template for the selected product type
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ai-role">AI Role</Label>
              <Select
                value={aiRole}
                onValueChange={handleAiRoleChange}
              >
                <SelectTrigger id="ai-role">
                  <SelectValue placeholder="Select AI Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seo_expert">SEO Expert</SelectItem>
                  <SelectItem value="marketer">Digital Marketer</SelectItem>
                  <SelectItem value="copywriter">Copywriter</SelectItem>
                  <SelectItem value="developer">Technical Writer</SelectItem>
                  <SelectItem value="brand_specialist">Luxury Brand Specialist</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines the writing style and expertise of the AI
              </p>
            </div>
          </div>
          
          {/* Competitor Websites Section */}
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Competitor Websites for Research</h3>
            <p className="text-sm text-muted-foreground">
              Add websites the AI can reference for research (3-5 recommended)
            </p>
            
            <div className="space-y-2">
              {competitorWebsites.map((website, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-muted p-2 rounded flex-1 text-sm flex items-center">
                    <Link className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{website}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveCompetitorWebsite(website)}
                    aria-label="Remove website"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddCompetitorWebsite} type="button" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          {/* Hyperlinks File Upload */}
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Hyperlinks for Product Descriptions</h3>
            <p className="text-sm text-muted-foreground">
              Upload a text file with hyperlinks (one URL per line) to include in product descriptions
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".txt"
                  onChange={handleHyperlinksFileUpload}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              
              {hyperlinks.length > 0 && (
                <div className="border p-2 rounded-md bg-muted/30">
                  <p className="text-sm font-medium mb-2">Loaded {hyperlinks.length} hyperlinks:</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {hyperlinks.slice(0, 3).map((link, index) => (
                      <div key={index} className="text-xs truncate">{link}</div>
                    ))}
                    {hyperlinks.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ...and {hyperlinks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={provider}
                onValueChange={onProviderChange}
              >
                <SelectTrigger id="provider">
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
                <SelectTrigger id="model">
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
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt-preview">Template Preview</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  window.location.href = '/prompts';
                }}
                className="h-8 gap-1"
              >
                <BookOpen className="h-4 w-4" />
                <span>Manage Prompts</span>
              </Button>
            </div>
            <Textarea
              id="prompt-preview"
              value={prompt}
              readOnly
              className="min-h-[200px] font-mono text-sm bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              This is a preview of the template that will be used. Switch to Advanced tab to edit directly.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-2">
          <Label htmlFor="prompt">Prompt Template</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Enter your prompt here..."
            className="min-h-[400px] font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            Use placeholders like &#123;&#123;id&#125;&#125;, &#123;&#123;title&#125;&#125;, 
            &#123;&#123;url&#125;&#125;, &#123;&#123;competitor_websites&#125;&#125;, and 
            &#123;&#123;hyperlinks&#125;&#125; which will be replaced with actual data.
          </p>
        </TabsContent>
      </Tabs>
      
      {(!hasApiKeys.openai && !hasApiKeys.anthropic && !hasApiKeys.google) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <p className="text-amber-800">
                You need to configure at least one AI provider in the settings to use this feature.
              </p>
              <RouterLink 
                to="/settings" 
                className="text-blue-600 hover:underline flex items-center"
              >
                Go to Settings to configure AI providers
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      )}
      
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
