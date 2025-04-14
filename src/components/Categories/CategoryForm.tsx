import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { categoriesApi, mediaApi, extractData } from '@/utils/api';
import { toast } from 'sonner';
import { Category, CategoryFormData } from '@/types/category';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from '@/components/Products/ImageUploader';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';

interface CategoryFormProps {
  category?: Category | null;
  onSaved: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    category?.image?.src || null
  );

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      const response = await categoriesApi.getAll({ per_page: 100 });
      return extractData(response);
    },
  });
  
  const categories = categoriesResponse as Category[] || [];

  const getMetaValue = (key: string) => {
    if (!category?.meta_data) return '';
    const meta = category.meta_data.find(m => m.key === key);
    return meta ? meta.value : '';
  };

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      parent: category?.parent || 0,
      description: category?.description || '',
      extra_description: category?.extra_description || '',
      image: category?.image || null,
      meta_data: [
        { key: 'rank_math_focus_keyword', value: getMetaValue('rank_math_focus_keyword') },
        { key: 'rank_math_title', value: getMetaValue('rank_math_title') },
        { key: 'rank_math_description', value: getMetaValue('rank_math_description') }
      ]
    }
  });

  const handleImagesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setUploadingImage(true);
    
    try {
      const metadata = {
        title: form.getValues('name'),
        alt_text: form.getValues('name'),
        caption: '',
        description: ''
      };
      
      const uploadedImage = await mediaApi.upload(file, metadata);
      
      form.setValue('image', {
        id: uploadedImage.id,
        src: uploadedImage.source_url,
        alt: uploadedImage.alt_text,
        title: uploadedImage.title.rendered,
        caption: uploadedImage.caption.rendered,
        description: uploadedImage.description.rendered
      });
      
      setPreviewImage(uploadedImage.source_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    form.setValue('image', null);
    setPreviewImage(null);
  };

  const updateImageMetadata = (field: 'alt' | 'title' | 'caption' | 'description', value: string) => {
    const currentImage = form.getValues('image');
    if (currentImage) {
      form.setValue('image', {
        ...currentImage,
        [field]: value
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    
    try {
      const formattedMetaData = data.meta_data?.filter(m => m.value).map(m => ({
        key: m.key,
        value: m.value
      }));
      
      const payload = {
        ...data,
        meta_data: formattedMetaData
      };
      
      if (category?.id) {
        await categoriesApi.update(category.id, payload);
        toast.success(`"${data.name}" updated successfully`);
      } else {
        await categoriesApi.create(payload);
        toast.success(`"${data.name}" created successfully`);
      }
      
      onSaved();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter category name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (Permalink)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="category-slug" />
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select 
                          value={field.value.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">None (Top Level)</SelectItem>
                            {categories
                              .filter(c => c.id !== category?.id)
                              .map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Categories can be nested hierarchically
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter category description" 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="extra_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter additional description" 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="meta_data.0.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Focus Keyword</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Primary keyword for this category" />
                        </FormControl>
                        <FormDescription>
                          The main keyword you want this category to rank for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="meta_data.1.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SEO title for this category" />
                        </FormControl>
                        <FormDescription>
                          Title that appears in search engine results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="meta_data.2.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief description for search engines" 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Short description that appears in search engine results (max 160 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Category Thumbnail</h3>
                
                {previewImage ? (
                  <div className="mb-4">
                    <div className="relative rounded-md overflow-hidden border">
                      <img 
                        src={previewImage} 
                        alt="Category thumbnail" 
                        className="w-full h-auto object-cover aspect-square"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        type="button"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Tabs defaultValue="alt" className="mt-4">
                      <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="alt">Alt</TabsTrigger>
                        <TabsTrigger value="title">Title</TabsTrigger>
                        <TabsTrigger value="caption">Caption</TabsTrigger>
                        <TabsTrigger value="description">Description</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="alt">
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input 
                              value={form.getValues('image.alt') || ''} 
                              onChange={(e) => updateImageMetadata('alt', e.target.value)}
                              placeholder="Alternative text for accessibility"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the image for screen readers and SEO
                          </FormDescription>
                        </FormItem>
                      </TabsContent>
                      
                      <TabsContent value="title">
                        <FormItem>
                          <FormLabel>Image Title</FormLabel>
                          <FormControl>
                            <Input 
                              value={form.getValues('image.title') || ''} 
                              onChange={(e) => updateImageMetadata('title', e.target.value)}
                              placeholder="Title for the image"
                            />
                          </FormControl>
                        </FormItem>
                      </TabsContent>
                      
                      <TabsContent value="caption">
                        <FormItem>
                          <FormLabel>Caption</FormLabel>
                          <FormControl>
                            <Textarea 
                              value={form.getValues('image.caption') || ''} 
                              onChange={(e) => updateImageMetadata('caption', e.target.value)}
                              placeholder="Short caption for the image"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                        </FormItem>
                      </TabsContent>
                      
                      <TabsContent value="description">
                        <FormItem>
                          <FormLabel>Image Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              value={form.getValues('image.description') || ''} 
                              onChange={(e) => updateImageMetadata('description', e.target.value)}
                              placeholder="Detailed description of the image"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                        </FormItem>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="mb-4">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center p-8 border border-dashed rounded-md">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground">Uploading image...</p>
                        </div>
                      </div>
                    ) : (
                      <ImageUploader onImagesSelected={handleImagesSelected} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
