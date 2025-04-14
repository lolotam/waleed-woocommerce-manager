import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, Pencil, Plus, Image, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateContent, getAvailableModels } from "@/utils/aiService";
import { brandsApi, mediaApi, extractData } from "@/utils/api";
import { Brand, BrandFormData } from "@/types/brand";
import { WooCommerceResponse } from "@/utils/api/woocommerceCore";

const DEFAULT_PROMPTS: {[key: string]: string} = {
  description: "Create a concise, compelling brand description for {brand_name}. Include their unique selling points, product range, and brand values.",
  meta_title: "Create an SEO-friendly meta title (under 60 characters) for {brand_name}'s product category page.",
  meta_description: "Write an engaging meta description (under 160 characters) for {brand_name} that includes key products and encourages clicks."
};

const BrandsManager = () => {
  const queryClient = useQueryClient();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiFieldToGenerate, setAiFieldToGenerate] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState('gpt4o');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<BrandFormData | null>(null);
  const [availableModels, setAvailableModels] = useState<{id: string, description: string, provider: string}[]>([]);

  const { 
    data: brandsResponse = { data: [] }, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        const response = await brandsApi.getAll();
        return extractData(response);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        return [];
      }
    }
  });
  
  const brands = brandsResponse as Brand[] || [];

  const createBrandMutation = useMutation({
    mutationFn: (brandData: BrandFormData) => brandsApi.create(brandData),
    onSuccess: () => {
      toast.success('Brand created successfully');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    }
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BrandFormData }) => 
      brandsApi.update(id, data),
    onSuccess: () => {
      toast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    }
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: number) => brandsApi.delete(id),
    onSuccess: () => {
      toast.success('Brand deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async ({ file, metadata }: { file: File, metadata: any }) => {
      return await mediaApi.upload(file, metadata);
    },
    onError: (error) => {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload image');
    }
  });

  useEffect(() => {
    setAvailableModels(getAvailableModels());
  }, []);

  const createBrand = () => {
    const newBrand: BrandFormData = {
      name: '',
      slug: '',
      description: '',
      image: null,
      meta_data: [
        { key: 'rank_math_title', value: '' },
        { key: 'rank_math_description', value: '' },
        { key: 'rank_math_focus_keyword', value: '' }
      ]
    };
    setSelectedBrand(newBrand);
    setImagePreview('');
    setEditDialogOpen(true);
  };

  const editBrand = (brand: Brand) => {
    const formData: BrandFormData = {
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      image: brand.image,
      meta_data: brand.meta_data || [
        { key: 'rank_math_title', value: '' },
        { key: 'rank_math_description', value: '' },
        { key: 'rank_math_focus_keyword', value: '' }
      ]
    };
    
    setSelectedBrand(formData);
    setImagePreview(brand.image?.src || '');
    setEditDialogOpen(true);
  };

  const deleteBrand = (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      deleteBrandMutation.mutate(id);
    }
  };

  const saveBrand = async () => {
    if (!selectedBrand) return;
    
    if (!selectedBrand.name) {
      toast.error('Brand name is required');
      return;
    }

    if (!selectedBrand.slug) {
      selectedBrand.slug = selectedBrand.name.toLowerCase().replace(/\s+/g, '-');
    }

    if (uploadedImage) {
      try {
        const imageMetadata = {
          title: selectedBrand.name,
          alt_text: `${selectedBrand.name} logo`,
          caption: '',
          description: ''
        };
        
        const uploadResult = await uploadMediaMutation.mutateAsync({ 
          file: uploadedImage, 
          metadata: imageMetadata 
        });
        
        selectedBrand.image = {
          id: uploadResult.id,
          src: uploadResult.source_url,
          alt: uploadResult.alt_text,
          title: uploadResult.title?.rendered,
          caption: uploadResult.caption?.rendered,
          description: uploadResult.description?.rendered
        };
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    if (selectedBrand.meta_data?.length === 0) {
      selectedBrand.meta_data = [
        { key: 'rank_math_title', value: '' },
        { key: 'rank_math_description', value: '' },
        { key: 'rank_math_focus_keyword', value: '' }
      ];
    }

    if (!selectedBrand.id) {
      createBrandMutation.mutate(selectedBrand);
    } else {
      updateBrandMutation.mutate({ 
        id: selectedBrand.id, 
        data: selectedBrand 
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  const getMetaValue = (key: string): string => {
    if (!selectedBrand?.meta_data) return '';
    const meta = selectedBrand.meta_data.find(m => m.key === key);
    return meta ? meta.value : '';
  };

  const setMetaValue = (key: string, value: string) => {
    if (!selectedBrand) return;
    
    const meta_data = [...(selectedBrand.meta_data || [])];
    const index = meta_data.findIndex(m => m.key === key);
    
    if (index >= 0) {
      meta_data[index] = { ...meta_data[index], value };
    } else {
      meta_data.push({ key, value });
    }
    
    setSelectedBrand({ ...selectedBrand, meta_data });
  };

  const openAiDialog = (field: string) => {
    if (!selectedBrand) return;
    
    let defaultPrompt = DEFAULT_PROMPTS[field] || '';
    
    defaultPrompt = defaultPrompt.replace('{brand_name}', selectedBrand.name);
    
    setAiFieldToGenerate(field);
    setAiPrompt(defaultPrompt);
    setAiResult('');
    setAiDialogOpen(true);
  };

  const generateAiContent = async () => {
    if (!selectedBrand || !aiPrompt) return;
    
    setIsGenerating(true);
    
    try {
      const result = await generateContent(aiPrompt, aiModel as any);
      setAiResult(result);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAiContent = () => {
    if (!selectedBrand || !aiResult) return;
    
    if (aiFieldToGenerate === 'description') {
      setSelectedBrand({ ...selectedBrand, description: aiResult });
    } else if (aiFieldToGenerate === 'meta_title') {
      setMetaValue('rank_math_title', aiResult);
    } else if (aiFieldToGenerate === 'meta_description') {
      setMetaValue('rank_math_description', aiResult);
    }
    
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

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Manager</h1>
            <p className="text-muted-foreground">Create and manage product brands</p>
          </div>
        </div>
        
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <p>Failed to load brands. {error?.message || 'Please check your WooCommerce connection settings.'}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Manager</h1>
          <p className="text-muted-foreground">Create and manage product brands</p>
        </div>
        <Button onClick={createBrand} disabled={createBrandMutation.isPending}>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading brands...
                    </div>
                  </TableCell>
                </TableRow>
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No brands found. Add your first brand to get started.
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand: Brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      {brand.image ? (
                        <img 
                          src={brand.image.src} 
                          alt={brand.image.alt} 
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => editBrand(brand)}
                          disabled={updateBrandMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteBrand(brand.id)}
                          disabled={deleteBrandMutation.isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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
                  
                  {imagePreview && (
                    <div className="grid gap-4 pt-4 border-t">
                      <Label>Image Metadata</Label>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="image-alt">Alt Text</Label>
                        <Input 
                          id="image-alt" 
                          value={selectedBrand.image?.alt || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            image: { ...selectedBrand.image, alt: e.target.value }
                          })}
                          placeholder="Alt text for accessibility"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="image-title">Title</Label>
                        <Input 
                          id="image-title" 
                          value={selectedBrand.image?.title || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            image: { ...selectedBrand.image, title: e.target.value }
                          })}
                          placeholder="Image title"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="image-caption">Caption</Label>
                        <Input 
                          id="image-caption" 
                          value={selectedBrand.image?.caption || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            image: { ...selectedBrand.image, caption: e.target.value }
                          })}
                          placeholder="Image caption"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="image-description">Description</Label>
                        <Textarea 
                          id="image-description" 
                          value={selectedBrand.image?.description || ''}
                          onChange={(e) => setSelectedBrand({
                            ...selectedBrand,
                            image: { ...selectedBrand.image, description: e.target.value }
                          })}
                          placeholder="Image description"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
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
                      value={getMetaValue('rank_math_title')} 
                      onChange={(e) => setMetaValue('rank_math_title', e.target.value)}
                      placeholder="Enter meta title (max 60 characters)"
                      maxLength={60}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {getMetaValue('rank_math_title').length}/60 characters
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
                      value={getMetaValue('rank_math_description')} 
                      onChange={(e) => setMetaValue('rank_math_description', e.target.value)}
                      placeholder="Enter meta description (max 160 characters)"
                      maxLength={160}
                      rows={3}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {getMetaValue('rank_math_description').length}/160 characters
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="focus_keyword">Focus Keyword</Label>
                    <Input 
                      id="focus_keyword" 
                      value={getMetaValue('rank_math_focus_keyword')} 
                      onChange={(e) => setMetaValue('rank_math_focus_keyword', e.target.value)}
                      placeholder="Enter focus keyword(s), comma separated"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                  disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveBrand}
                  disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                >
                  {(createBrandMutation.isPending || updateBrandMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Brand'
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Content with AI</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ai_model">AI Model</Label>
              <Tabs defaultValue="openai" className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="openai">OpenAI</TabsTrigger>
                  <TabsTrigger value="anthropic">Claude</TabsTrigger>
                  <TabsTrigger value="google">Gemini</TabsTrigger>
                </TabsList>
                
                <TabsContent value="openai" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    {groupedModels.openai.map(model => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={model.id}
                          name="ai-model"
                          value={model.id}
                          checked={aiModel === model.id}
                          onChange={() => setAiModel(model.id)}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={model.id} className="text-sm font-medium leading-none cursor-pointer">
                          {model.description}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="anthropic" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    {groupedModels.anthropic.map(model => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={model.id}
                          name="ai-model"
                          value={model.id}
                          checked={aiModel === model.id}
                          onChange={() => setAiModel(model.id)}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={model.id} className="text-sm font-medium leading-none cursor-pointer">
                          {model.description}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="google" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    {groupedModels.google.map(model => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={model.id}
                          name="ai-model"
                          value={model.id}
                          checked={aiModel === model.id}
                          onChange={() => setAiModel(model.id)}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={model.id} className="text-sm font-medium leading-none cursor-pointer">
                          {model.description}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
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
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
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
