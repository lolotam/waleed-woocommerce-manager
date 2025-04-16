
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

// Expanded prompt categories to include all AI-generated fields
const PROMPT_CATEGORIES = [
  // Product categories
  { id: 'product_description', name: 'Product Description' },
  { id: 'product_short_description', name: 'Product Short Description' },
  { id: 'product_seo_title', name: 'Product SEO Title' },
  { id: 'product_seo_description', name: 'Product SEO Description' },
  { id: 'product_tags', name: 'Product Tags' },
  { id: 'product_focus_keyword', name: 'Product Focus Keyword' },
  { id: 'product_alt_text', name: 'Product Image Alt Text' },
  { id: 'product_image_title', name: 'Product Image Title' },
  { id: 'product_image_caption', name: 'Product Image Caption' },
  { id: 'product_image_description', name: 'Product Image Description' },
  { id: 'product_fragrance_description', name: 'Product Fragrance Description' },
  
  // Brand categories
  { id: 'brand_description', name: 'Brand Description' },
  { id: 'brand_seo_title', name: 'Brand SEO Title' },
  { id: 'brand_seo_description', name: 'Brand SEO Description' },
  { id: 'brand_story', name: 'Brand Story' },
  { id: 'brand_values', name: 'Brand Values' },
  { id: 'brand_unique_selling_points', name: 'Brand Unique Selling Points' },
  
  // Category categories
  { id: 'category_description', name: 'Category Description' },
  { id: 'category_seo_title', name: 'Category SEO Title' },
  { id: 'category_seo_description', name: 'Category SEO Description' },
  { id: 'category_buying_guide', name: 'Category Buying Guide' },
  { id: 'category_faq', name: 'Category FAQ' },
];

// Example default prompts
const DEFAULT_PROMPTS = {
  product_description: "Write a compelling product description for {product_name}. Include key features, benefits, and use cases. Keep it persuasive and engaging. Aim for 150-200 words.",
  product_seo_title: "Create an SEO-friendly title (max 60 characters) for {product_name} that includes the main keyword {keyword}.",
  product_seo_description: "Write a meta description (max 160 characters) for {product_name} that highlights key features and includes the keyword {keyword}.",
  brand_description: "Create a concise, compelling brand description for {brand_name}. Include their unique selling points, product range, and brand values.",
  brand_seo_title: "Create an SEO-friendly meta title (under 60 characters) for {brand_name}'s product category page.",
  brand_seo_description: "Write an engaging meta description (under 160 characters) for {brand_name} that includes key products and encourages clicks.",
  category_description: "Write a category description for {category_name} products. Include what types of products are in this category, who they're for, and why customers should explore this category.",
  category_seo_title: "Create an SEO-friendly title (max 60 characters) for the {category_name} category page.",
  category_seo_description: "Write a meta description (max 160 characters) for the {category_name} category that encourages clicks and includes relevant keywords."
};

interface Prompt {
  id: string;
  name: string;
  category: string;
  prompt: string;
  model: string;
  isDefault: boolean;
}

const PromptManager = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Load prompts from localStorage or use defaults
  useEffect(() => {
    const savedPrompts = localStorage.getItem('saved_prompts');
    
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    } else {
      // Initialize with default prompts
      const defaultPromptsList = Object.entries(DEFAULT_PROMPTS).map(([category, promptText]) => ({
        id: `default-${category}`,
        name: PROMPT_CATEGORIES.find(c => c.id === category)?.name || category,
        category,
        prompt: promptText,
        model: 'gpt4o' as const,
        isDefault: true
      }));
      
      setPrompts(defaultPromptsList);
      localStorage.setItem('saved_prompts', JSON.stringify(defaultPromptsList));
    }
  }, []);

  // Create a new prompt
  const createPrompt = () => {
    const newPrompt: Prompt = {
      id: `custom-${Date.now()}`,
      name: '',
      category: PROMPT_CATEGORIES[0].id,
      prompt: '',
      model: 'gpt4o',
      isDefault: false
    };
    setSelectedPrompt(newPrompt);
    setEditDialogOpen(true);
  };

  // Edit existing prompt
  const editPrompt = (prompt: Prompt) => {
    setSelectedPrompt({...prompt});
    setEditDialogOpen(true);
  };

  // Delete prompt
  const deletePrompt = (id: string) => {
    // Don't allow deleting default prompts
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

  // Save prompt
  const savePrompt = () => {
    if (!selectedPrompt) return;
    
    if (!selectedPrompt.name || !selectedPrompt.prompt) {
      toast.error('Name and prompt text are required');
      return;
    }
    
    // If this is a new prompt (doesn't exist in the array)
    if (!prompts.some(prompt => prompt.id === selectedPrompt.id)) {
      const updatedPrompts = [...prompts, selectedPrompt];
      setPrompts(updatedPrompts);
      localStorage.setItem('saved_prompts', JSON.stringify(updatedPrompts));
      toast.success('Prompt created successfully');
    } else {
      // Update existing prompt
      const updatedPrompts = prompts.map(prompt => 
        prompt.id === selectedPrompt.id ? selectedPrompt : prompt
      );
      setPrompts(updatedPrompts);
      localStorage.setItem('saved_prompts', JSON.stringify(updatedPrompts));
      toast.success('Prompt updated successfully');
    }
    
    setEditDialogOpen(false);
  };

  // Copy prompt to clipboard
  const copyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard');
    
    // Reset the copied status after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter prompts by category
  const filteredPrompts = filter === 'all' 
    ? prompts
    : prompts.filter(prompt => prompt.category.startsWith(filter));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt Manager</h1>
          <p className="text-muted-foreground">Create and manage your AI prompts</p>
        </div>
        <Button onClick={createPrompt}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prompt
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <Select 
          value={filter} 
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prompts</SelectItem>
            <SelectItem value="product">Product Prompts</SelectItem>
            <SelectItem value="brand">Brand Prompts</SelectItem>
            <SelectItem value="category">Category Prompts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="hidden md:table-cell">Prompt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.name}</TableCell>
                  <TableCell>
                    {PROMPT_CATEGORIES.find(c => c.id === prompt.category)?.name || prompt.category}
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
                    {prompt.model === 'claude3' && 'Claude 3'}
                    {prompt.model === 'gemini' && 'Gemini'}
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
              ))}
              {filteredPrompts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No prompts found. Add your first prompt to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Prompt Dialog */}
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
                      <SelectItem value="header_product">-- Product Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.id.startsWith('product_')).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="header_brand">-- Brand Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.id.startsWith('brand_')).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="header_category">-- Category Fields --</SelectItem>
                      {PROMPT_CATEGORIES.filter(c => c.id.startsWith('category_')).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="model">Default AI Model</Label>
                  <Select 
                    value={selectedPrompt.model} 
                    onValueChange={(value) => setSelectedPrompt({...selectedPrompt, model: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header_openai">-- OpenAI Models --</SelectItem>
                      <SelectItem value="gpt4o">OpenAI GPT-4o</SelectItem>
                      <SelectItem value="gpt4o_mini">OpenAI GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt45">OpenAI GPT-4.5</SelectItem>
                      <SelectItem value="o1">OpenAI o1</SelectItem>
                      <SelectItem value="o1_mini">OpenAI o1 Mini</SelectItem>
                      <SelectItem value="o1_mini_high">OpenAI o1 Mini High</SelectItem>
                      
                      <SelectItem value="header_anthropic">-- Anthropic Models --</SelectItem>
                      <SelectItem value="claude37">Anthropic Claude 3.7</SelectItem>
                      <SelectItem value="claude35_sonnet">Anthropic Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude35_haiku">Anthropic Claude 3.5 Haiku</SelectItem>
                      <SelectItem value="claude3_opus">Anthropic Claude 3 Opus</SelectItem>
                      
                      <SelectItem value="header_gemini">-- Google Models --</SelectItem>
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
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders like {"{product_name}"}, {"{brand_name}"}, {"{category_name}"}, 
                    {"{keyword}"} to make your prompts dynamic.
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
