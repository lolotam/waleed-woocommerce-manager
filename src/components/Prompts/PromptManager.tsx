import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, Pencil, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModel } from "@/utils/ai/types";

const PROMPT_CATEGORIES = [
  { id: 'product_long_description', name: 'Product Long Description', group: 'product' },
  { id: 'product_short_description', name: 'Product Short Description', group: 'product' },
  { id: 'product_focus_keywords', name: 'Product Focus Keywords', group: 'product' },
  { id: 'product_meta_title', name: 'Product Meta Title', group: 'product' },
  { id: 'product_meta_description', name: 'Product Meta Description', group: 'product' },
  { id: 'product_permalink', name: 'Product Permalink (Slug)', group: 'product' },
  { id: 'product_image_alt_text', name: 'Product Image Alt Text', group: 'product' },
  { id: 'product_image_title', name: 'Product Image Title', group: 'product' },
  { id: 'product_image_caption', name: 'Product Image Caption', group: 'product' },
  { id: 'product_image_description', name: 'Product Image Description', group: 'product' },
  { id: 'product_full_prompt', name: 'Product Full Prompt', group: 'product' },
  
  { id: 'category_description', name: 'Category Description', group: 'category' },
  { id: 'category_extra_description', name: 'Category Extra Description', group: 'category' },
  { id: 'category_focus_keyword', name: 'Category Focus Keyword', group: 'category' },
  { id: 'category_meta_title', name: 'Category Meta Title', group: 'category' },
  { id: 'category_meta_description', name: 'Category Meta Description', group: 'category' },
  { id: 'category_permalink', name: 'Category Permalink (Slug)', group: 'category' },
  
  { id: 'brand_description', name: 'Brand Description', group: 'brand' },
  { id: 'brand_focus_keyword', name: 'Brand Focus Keyword', group: 'brand' },
  { id: 'brand_meta_title', name: 'Brand Meta Title', group: 'brand' },
  { id: 'brand_meta_description', name: 'Brand Meta Description', group: 'brand' },
  { id: 'brand_permalink', name: 'Brand Permalink (Slug)', group: 'brand' },
];

const PRODUCT_TYPES = [
  { id: 'general', name: 'General Products' },
  { id: 'fragrance', name: 'Fragrances & Perfumes' },
  { id: 'makeup', name: 'Makeup' },
  { id: 'skincare', name: 'Skincare' },
  { id: 'haircare', name: 'Haircare' },
  { id: 'bodycare', name: 'Body Care' },
  { id: 'clothing', name: 'Clothing & Fashion' },
  { id: 'footwear', name: 'Footwear' },
  { id: 'fashion_accessories', name: 'Fashion Accessories' },
  { id: 'luxury_goods', name: 'Luxury Goods' },
  { id: 'gift_sets', name: 'Gift Sets & Seasonal' },
  { id: 'home_lifestyle', name: 'Home & Lifestyle' },
  { id: 'mens_grooming', name: 'Men\'s Grooming' },
  { id: 'baby_kids', name: 'Baby & Kids' },
  { id: 'health_wellness', name: 'Health & Wellness' },
  { id: 'electronics', name: 'Electronics & Beauty Tools' }
];

const AI_ROLES = [
  { id: 'copywriter', name: 'Copywriter' },
  { id: 'seo_specialist', name: 'SEO Specialist' },
  { id: 'marketing_expert', name: 'Marketing Expert' },
  { id: 'product_specialist', name: 'Product Specialist' },
  { id: 'technical_writer', name: 'Technical Writer' },
  { id: 'creative_writer', name: 'Creative Writer' },
  { id: 'conversational', name: 'Conversational' },
  { id: 'analytical', name: 'Analytical' },
];

const DEFAULT_PROMPTS = {
  product_long_description: "Write a detailed product description for {product_name}. Include key features, benefits, and specifications. Make it engaging and SEO-friendly with a focus on the keyword {keyword}.",
  product_short_description: "Create a concise product description (max 50 words) for {product_name} that highlights the key selling points.",
  product_meta_title: "Create an SEO-friendly title (max 60 characters) for {product_name} that includes the main keyword {keyword}.",
  category_description: "Write a comprehensive category description for {category_name} products. Include what types of products are in this category, who they're for, and why customers should explore this category.",
  brand_description: "Create a compelling brand description for {brand_name}. Include their history, product range, unique selling points, and brand values."
};

interface Prompt {
  id: string;
  name: string;
  category: string;
  prompt: string;
  model: string;
  productType?: string;
  aiRole?: string;
  isDefault: boolean;
}

const PromptManager = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>("product");

  useEffect(() => {
    const savedPrompts = localStorage.getItem('saved_prompts');
    
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    } else {
      const defaultPromptsList = Object.entries(DEFAULT_PROMPTS).map(([category, promptText]) => ({
        id: `default-${category}`,
        name: PROMPT_CATEGORIES.find(c => c.id === category)?.name || category,
        category,
        prompt: promptText,
        model: 'gpt4o' as string,
        isDefault: true
      }));
      
      setPrompts(defaultPromptsList);
      localStorage.setItem('saved_prompts', JSON.stringify(defaultPromptsList));
    }
  }, []);

  const createPrompt = () => {
    const newPrompt: Prompt = {
      id: `custom-${Date.now()}`,
      name: '',
      category: PROMPT_CATEGORIES.find(c => c.group === activeTab)?.id || PROMPT_CATEGORIES[0].id,
      prompt: '',
      model: 'gpt4o',
      productType: '',
      aiRole: '',
      isDefault: false
    };
    setSelectedPrompt(newPrompt);
    setEditDialogOpen(true);
  };

  const editPrompt = (prompt: Prompt) => {
    setSelectedPrompt({...prompt});
    setEditDialogOpen(true);
  };

  const deletePrompt = (id: string) => {
    const promptToDelete = prompts.find(p => p.id === id);
    if (promptToDelete?.isDefault) {
      toast.error("Cannot delete default prompts. You can edit them instead.");
      return;
    }

    if (confirm('Are you sure you want to delete this prompt?')) {
      const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
      setPrompts(updatedPrompts);
      localStorage.setItem('saved_prompts', JSON.stringify(updatedPrompts));
      toast.success('Prompt deleted successfully');
    }
  };

  const savePrompt = () => {
    if (!selectedPrompt) return;
    
    if (!selectedPrompt.name || !selectedPrompt.prompt) {
      toast.error('Name and prompt text are required');
      return;
    }
    
    if (!prompts.some(prompt => prompt.id === selectedPrompt.id)) {
      const updatedPrompts = [...prompts, selectedPrompt];
      setPrompts(updatedPrompts);
      localStorage.setItem('saved_prompts', JSON.stringify(updatedPrompts));
      toast.success('Prompt created successfully');
    } else {
      const updatedPrompts = prompts.map(prompt => 
        prompt.id === selectedPrompt.id ? selectedPrompt : prompt
      );
      setPrompts(updatedPrompts);
      localStorage.setItem('saved_prompts', JSON.stringify(updatedPrompts));
      toast.success('Prompt updated successfully');
    }
    
    setEditDialogOpen(false);
  };

  const copyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard');
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const category = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
    
    if (activeTab !== 'all' && category?.group !== activeTab) {
      return false;
    }
    
    if (filter !== 'all') {
      return prompt.category === filter;
    }
    
    return true;
  });

  const productPromptsCount = prompts.filter(p => 
    PROMPT_CATEGORIES.find(c => c.id === p.category)?.group === 'product'
  ).length;
  
  const categoryPromptsCount = prompts.filter(p => 
    PROMPT_CATEGORIES.find(c => c.id === p.category)?.group === 'category'
  ).length;
  
  const brandPromptsCount = prompts.filter(p => 
    PROMPT_CATEGORIES.find(c => c.id === p.category)?.group === 'brand'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Prompt Manager</h1>
          <p className="text-muted-foreground">Create and manage your AI prompts for generating content</p>
        </div>
        <Button onClick={createPrompt}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prompt
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="product" className="flex-1">
            Product Prompts
            <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {productPromptsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex-1">
            Category Prompts
            <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {categoryPromptsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex-1">
            Brand Prompts
            <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {brandPromptsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All Prompts
            <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {prompts.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {activeTab !== 'all' && (
            <div className="flex justify-between items-center mb-4">
              <Select 
                value={filter} 
                onValueChange={setFilter}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by specific field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {activeTab} prompts</SelectItem>
                  {PROMPT_CATEGORIES.filter(c => c.group === activeTab).map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={createPrompt} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add {activeTab} prompt
              </Button>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'product' && 'Product Prompts'}
                {activeTab === 'category' && 'Category Prompts'}
                {activeTab === 'brand' && 'Brand Prompts'}
                {activeTab === 'all' && 'All Prompts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="hidden md:table-cell">Product Type</TableHead>
                    <TableHead className="hidden md:table-cell">AI Role</TableHead>
                    <TableHead className="hidden md:table-cell">Prompt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => {
                    const category = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
                    const productType = PRODUCT_TYPES.find(t => t.id === prompt.productType);
                    const aiRole = AI_ROLES.find(r => r.id === prompt.aiRole);
                    
                    return (
                      <TableRow key={prompt.id}>
                        <TableCell className="font-medium">{prompt.name}</TableCell>
                        <TableCell>
                          {category?.name || prompt.category}
                        </TableCell>
                        <TableCell>
                          {prompt.model === 'gpt4o' && 'GPT-4o'}
                          {prompt.model === 'gpt4o_mini' && 'GPT-4o Mini'}
                          {prompt.model === 'o1' && 'OpenAI o1'}
                          {prompt.model === 'o1_mini' && 'OpenAI o1 Mini'}
                          {prompt.model === 'claude35_sonnet' && 'Claude 3.5 Sonnet'}
                          {prompt.model === 'claude37' && 'Claude 3.7'}
                          {prompt.model === 'gemini_flash' && 'Gemini Flash'}
                          {prompt.model === 'gemini_pro' && 'Gemini Pro'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {productType?.name || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {aiRole?.name || '-'}
                        </TableCell>
                        <TableCell className="max-w-md truncate hidden md:table-cell">
                          {prompt.prompt}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => copyPrompt(prompt.prompt, prompt.id)}
                            >
                              {copiedId === prompt.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => editPrompt(prompt)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deletePrompt(prompt.id)}
                              disabled={prompt.isDefault}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredPrompts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No prompts found. Add your first prompt to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.isDefault ? 'Edit Default Prompt' : (selectedPrompt?.id ? 'Edit Prompt' : 'Create Prompt')}</DialogTitle>
          </DialogHeader>
          
          {selectedPrompt && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Prompt Name</Label>
                  <Input 
                    id="name" 
                    value={selectedPrompt.name} 
                    onChange={(e) => setSelectedPrompt({...selectedPrompt, name: e.target.value})}
                    placeholder="Enter prompt name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={selectedPrompt.category} 
                    onValueChange={(value) => setSelectedPrompt({...selectedPrompt, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="header_product" disabled>-- Product Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.group === 'product').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="header_category" disabled>-- Category Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.group === 'category').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="header_brand" disabled>-- Brand Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.group === 'brand').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Select 
                    value={selectedPrompt.productType || "any"} 
                    onValueChange={(value) => setSelectedPrompt({...selectedPrompt, productType: value === "any" ? "" : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any product type</SelectItem>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Optional: Specify which type of product this prompt works best for
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="aiRole">AI Role</Label>
                  <Select 
                    value={selectedPrompt.aiRole || "default"} 
                    onValueChange={(value) => setSelectedPrompt({...selectedPrompt, aiRole: value === "default" ? "" : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI role (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default role</SelectItem>
                      {AI_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Optional: Define what role the AI should take when generating content
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select 
                    value={selectedPrompt.model} 
                    onValueChange={(value) => setSelectedPrompt({...selectedPrompt, model: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header_openai" disabled>-- OpenAI Models --</SelectItem>
                      <SelectItem value="gpt4o">OpenAI GPT-4o</SelectItem>
                      <SelectItem value="gpt4o_mini">OpenAI GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt45">OpenAI GPT-4.5</SelectItem>
                      <SelectItem value="o1">OpenAI o1</SelectItem>
                      <SelectItem value="o1_mini">OpenAI o1 Mini</SelectItem>
                      <SelectItem value="o1_mini_high">OpenAI o1 Mini High</SelectItem>
                      
                      <SelectItem value="header_anthropic" disabled>-- Anthropic Models --</SelectItem>
                      <SelectItem value="claude37">Anthropic Claude 3.7</SelectItem>
                      <SelectItem value="claude35_sonnet">Anthropic Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude35_haiku">Anthropic Claude 3.5 Haiku</SelectItem>
                      <SelectItem value="claude3_opus">Anthropic Claude 3 Opus</SelectItem>
                      
                      <SelectItem value="header_gemini" disabled>-- Google Models --</SelectItem>
                      <SelectItem value="gemini_flash">Google Gemini Flash</SelectItem>
                      <SelectItem value="gemini_flash_thinking">Google Gemini Flash Thinking</SelectItem>
                      <SelectItem value="gemini_pro">Google Gemini Pro</SelectItem>
                      <SelectItem value="gemini_research">Google Gemini Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="prompt">Prompt Text</Label>
                  <Textarea 
                    id="prompt" 
                    value={selectedPrompt.prompt} 
                    onChange={(e) => setSelectedPrompt({...selectedPrompt, prompt: e.target.value})}
                    placeholder="Enter prompt text"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders like {"{product_name}"}, {"{brand_name}"}, {"{category_name}"}, 
                    {"{keyword}"}, {"{product_type}"} to make your prompts dynamic.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={savePrompt}>
                  Save Prompt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptManager;
