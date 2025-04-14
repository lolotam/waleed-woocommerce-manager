import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, Pencil, Plus, Image, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateContent, getAvailableModels } from "@/utils/aiService";

// Mock brands data
const MOCK_BRANDS = [
  { 
    id: 1, 
    name: 'Nike', 
    slug: 'nike', 
    description: 'Athletic footwear and apparel brand.', 
    image_url: 'https://placehold.co/100x100?text=Nike',
    meta_title: 'Nike - Just Do It',
    meta_description: "Shop Nike's innovative collection of athletic footwear, apparel, and accessories.",
    focus_keyword: 'nike athletic sportswear'
  },
  { 
    id: 2, 
    name: 'Adidas', 
    slug: 'adidas', 
    description: 'Sports and athletic wear brand from Germany.', 
    image_url: 'https://placehold.co/100x100?text=Adidas',
    meta_title: 'Adidas - Impossible Is Nothing',
    meta_description: 'Discover adidas shoes, clothing and accessories. Shop the official adidas online store.',
    focus_keyword: 'adidas sports clothing shoes'
  },
  { 
    id: 3, 
    name: 'Puma', 
    slug: 'puma', 
    description: 'Global athletic and casual footwear brand.', 
    image_url: 'https://placehold.co/100x100?text=Puma',
    meta_title: 'PUMA - Forever Faster',
    meta_description: 'Shop PUMA for Sports and Lifestyle Shoes, Clothing, and more. Forever Faster.',
    focus_keyword: 'puma sportswear lifestyle shoes'
  },
];

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
}

// AI Prompt suggestions
const DEFAULT_PROMPTS = {
  description: "Create a concise, compelling brand description for {brand_name}. Include their unique selling points, product range, and brand values.",
  meta_title: "Create an SEO-friendly meta title (under 60 characters) for {brand_name}'s product category page.",
  meta_description: "Write an engaging meta description (under 160 characters) for {brand_name} that includes key products and encourages clicks."
};

const BrandsManager = () => {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiFieldToGenerate, setAiFieldToGenerate] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState<string>('gpt4o');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<{id: string, description: string, provider: string}[]>([]);

  useEffect(() => {
    setAvailableModels(getAvailableModels());
  }, []);

  // Create a new brand
  const createBrand = () => {
    const newBrand: Brand = {
      id: Math.max(0, ...brands.map(b => b.id)) + 1,
      name: '',
      slug: '',
      description: '',
      image_url: '',
      meta_title: '',
      meta_description: '',
      focus_keyword: ''
    };
    setSelectedBrand(newBrand);
    setEditDialogOpen(true);
  };

  // Edit existing brand
  const editBrand = (brand: Brand) => {
    setSelectedBrand({...brand});
    setImagePreview(brand.image_url);
    setEditDialogOpen(true);
  };

  // Delete brand
  const deleteBrand = (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      setBrands(brands.filter(brand => brand.id !== id));
      toast.success('Brand deleted successfully');
    }
  };

  // Save brand
  const saveBrand = () => {
    if (!selectedBrand) return;
    
    if (!selectedBrand.name) {
      toast.error('Brand name is required');
      return;
    }

    if (!selectedBrand.slug) {
      selectedBrand.slug = selectedBrand.name.toLowerCase().replace(/\s+/g, '-');
    }

    if (!brands.some(brand => brand.id === selectedBrand.id)) {
      setBrands([...brands, selectedBrand]);
      toast.success('Brand created successfully');
    } else {
      setBrands(brands.map(brand => 
        brand.id === selectedBrand.id ? selectedBrand : brand
      ));
      toast.success('Brand updated successfully');
    }
    
    setEditDialogOpen(false);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      if (selectedBrand) {
        setSelectedBrand({
          ...selectedBrand,
          image_url: reader.result as string
        });
      }
    };
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  // Open AI dialog for generating content
  const openAiDialog = (field: string) => {
    if (!selectedBrand) return;
    
    let defaultPrompt = DEFAULT_PROMPTS[field] || '';
    
    defaultPrompt = defaultPrompt.replace('{brand_name}', selectedBrand.name);
    
    setAiFieldToGenerate(field);
    setAiPrompt(defaultPrompt);
    setAiResult('');
    setAiDialogOpen(true);
  };

  // Generate content using AI
  const generateAiContent = async () => {
    if (!selectedBrand || !aiPrompt) return;
    
    setIsGenerating(true);
    
    try {
      const result = await generateContent(aiPrompt, aiModel as any);
      setAiResult(result);
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply generated AI content to the selected field
  const applyAiContent = () => {
    if (!selectedBrand || !aiResult) return;
    
    setSelectedBrand({
      ...selectedBrand,
      [aiFieldToGenerate]: aiResult
    });
    
    setAiDialogOpen(false);
    toast.success(`${aiFieldToGenerate.charAt(0).toUpperCase() + aiFieldToGenerate.slice(1)} updated with AI content`);
  };

  const getGroupedModels = () => {
    const grouped = {
      openai: availableModels.filter(m => m.provider === 'openai'),
      anthropic: availableModels.filter(m => m.provider === 'anthropic'),
      google: availableModels.filter(m => m.provider === 'google')
    };
    return grouped;
  };

  const groupedModels = getGroupedModels();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Manager</h1>
          <p className="text-muted-foreground">Create and manage product brands</p>
        </div>
        <Button onClick={createBrand}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.image_url ? (
                      <img 
                        src={brand.image_url} 
                        alt={brand.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Image className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{brand.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => editBrand(brand)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteBrand(brand.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {brands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No brands found. Add your first brand to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Brand Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBrand?.id ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
          </DialogHeader>
          
          {selectedBrand && (
            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Brand Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="name" 
                        value={selectedBrand.name} 
                        onChange={(e) => setSelectedBrand({...selectedBrand, name: e.target.value})}
                        placeholder="Enter brand name"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="flex-shrink-0"
                        onClick={() => openAiDialog('name')}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input 
                      id="slug" 
                      value={selectedBrand.slug} 
                      onChange={(e) => setSelectedBrand({...selectedBrand, slug: e.target.value})}
                      placeholder="brand-slug"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openAiDialog('description')}
                        className="h-8 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea 
                      id="description" 
                      value={selectedBrand.description} 
                      onChange={(e) => setSelectedBrand({...selectedBrand, description: e.target.value})}
                      placeholder="Enter brand description"
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Brand Image</Label>
                    <div className="flex flex-col items-center gap-4">
                      <div className="border border-gray-200 dark:border-gray-800 rounded-lg w-40 h-40 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Brand Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Image className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="grid w-full gap-2">
                        <Label htmlFor="image" className="sr-only">Upload Image</Label>
                        <Input 
                          id="image" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512px. Max file size: 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openAiDialog('meta_title')}
                        className="h-8 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate with AI
                      </Button>
                    </div>
                    <Input 
                      id="meta_title" 
                      value={selectedBrand.meta_title} 
                      onChange={(e) => setSelectedBrand({...selectedBrand, meta_title: e.target.value})}
                      placeholder="Enter meta title (max 60 characters)"
                      maxLength={60}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {selectedBrand.meta_title.length}/60 characters
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openAiDialog('meta_description')}
                        className="h-8 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea 
                      id="meta_description" 
                      value={selectedBrand.meta_description} 
                      onChange={(e) => setSelectedBrand({...selectedBrand, meta_description: e.target.value})}
                      placeholder="Enter meta description (max 160 characters)"
                      maxLength={160}
                      rows={3}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {selectedBrand.meta_description.length}/160 characters
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="focus_keyword">Focus Keyword</Label>
                    <Input 
                      id="focus_keyword" 
                      value={selectedBrand.focus_keyword} 
                      onChange={(e) => setSelectedBrand({...selectedBrand, focus_keyword: e.target.value})}
                      placeholder="Enter focus keyword(s), comma separated"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveBrand}>
                  Save Brand
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Content with AI</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ai_model">AI Model</Label>
              <Select value={aiModel} onValueChange={(value) => setAiModel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>OpenAI Models</SelectLabel>
                    {groupedModels.openai.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Claude Models</SelectLabel>
                    {groupedModels.anthropic.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Gemini Models</SelectLabel>
                    {groupedModels.google.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ai_prompt">Prompt</Label>
              <Textarea 
                id="ai_prompt" 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter your prompt for the AI"
                rows={4}
              />
            </div>
            
            <Button 
              onClick={generateAiContent} 
              disabled={isGenerating || !aiPrompt}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
            
            {aiResult && (
              <div className="grid gap-2 pt-4 border-t">
                <Label htmlFor="ai_result">Generated Result</Label>
                <Textarea 
                  id="ai_result" 
                  value={aiResult} 
                  onChange={(e) => setAiResult(e.target.value)}
                  rows={6}
                  className="font-medium"
                />
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={applyAiContent}>
                    Apply Content
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManager;
