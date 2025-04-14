import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, ProductFormData, emptyProduct, ProductImage, ProductTag } from '@/types/product';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  productsApi, 
  mediaApi 
} from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import ImageUploader from './ImageUploader';
import { WooCommerceResponse } from '@/utils/api/woocommerceCore';
import AiGenerateButton from './AiGenerateButton';

interface ProductFormProps {
  product: Product | null;
  onSaveComplete: () => void;
  onCancel: () => void;
}

const productSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string(),
  short_description: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  regular_price: z.string().refine(val => !isNaN(Number(val)), {
    message: 'Regular price must be a number',
  }),
  sale_price: z.string(),
  manage_stock: z.boolean(),
  stock_quantity: z.number().nullable(),
  stock_status: z.enum(['instock', 'outofstock', 'onbackorder']),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string()
  })),
  images: z.array(z.object({
    id: z.number().optional(),
    src: z.string(),
    alt: z.string(),
    name: z.string(),
    title: z.string().optional(),
    caption: z.string().optional(),
    description: z.string().optional()
  })),
  tags: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    slug: z.string().optional()
  })),
  rankmath_seo: z.object({
    focus_keyword: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional()
  })
});

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSaveComplete, 
  onCancel 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  const { data: tagsResponse } = useQuery({
    queryKey: ['product-tags'],
    queryFn: async () => {
      try {
        return await productsApi.getTags({ per_page: 100 });
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        return { data: [] };
      }
    }
  });
  
  const tags: ProductTag[] = Array.isArray(tagsResponse?.data) ? tagsResponse.data : [];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      short_description: product.short_description || '',
      sku: product.sku || '',
      regular_price: product.regular_price || '',
      sale_price: product.sale_price || '',
      manage_stock: product.manage_stock || false,
      stock_quantity: product.stock_quantity || null,
      stock_status: product.stock_status || 'instock',
      categories: product.categories || [],
      tags: product.tags || [],
      images: product.images || [],
      rankmath_seo: {
        focus_keyword: product.meta_data && Array.isArray(product.meta_data) ? 
          product.meta_data.find((meta) => meta.key === 'rank_math_focus_keyword')?.value || '' : '',
        meta_title: product.meta_data && Array.isArray(product.meta_data) ? 
          product.meta_data.find((meta) => meta.key === 'rank_math_title')?.value || '' : '',
        meta_description: product.meta_data && Array.isArray(product.meta_data) ? 
          product.meta_data.find((meta) => meta.key === 'rank_math_description')?.value || '' : ''
      }
    } : emptyProduct
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name && !form.getValues('slug')) {
        const slug = value.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        form.setValue('slug', slug);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        short_description: data.short_description,
        sku: data.sku,
        regular_price: data.regular_price,
        sale_price: data.sale_price,
        manage_stock: data.manage_stock,
        stock_quantity: data.stock_quantity,
        stock_status: data.stock_status,
        categories: data.categories,
        tags: data.tags,
        images: data.images,
        meta_data: [
          {
            key: 'rank_math_focus_keyword',
            value: data.rankmath_seo.focus_keyword
          },
          {
            key: 'rank_math_title',
            value: data.rankmath_seo.meta_title
          },
          {
            key: 'rank_math_description',
            value: data.rankmath_seo.meta_description
          }
        ]
      };

      let response;
      if (product?.id) {
        response = await productsApi.update(product.id, productData);
        toast.success(`${data.name} updated successfully`);
      } else {
        response = await productsApi.create(productData);
        toast.success(`${data.name} created successfully`);
      }

      onSaveComplete();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPrimaryCategoryName = () => {
    const categories = form.getValues('categories');
    return categories && categories.length > 0 ? categories[0].name : '';
  };

  const getBrandName = () => {
    return form.getValues('brand') || '';
  };

  const handleAddTag = (tagName: string) => {
    const currentTags = form.getValues('tags') || [];
    
    if (currentTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      return;
    }

    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (existingTag) {
      form.setValue('tags', [...currentTags, existingTag]);
    } else {
      const newTag: ProductTag = {
        id: Math.floor(Math.random() * -1000),
        name: tagName,
        slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };
      form.setValue('tags', [...currentTags, newTag]);
    }
    
    setTagInput('');
  };

  const handleRemoveTag = (tagIndex: number) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((_, i) => i !== tagIndex));
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return;
    
    const currentImages = form.getValues('images') || [];
    
    for (const file of files) {
      try {
        toast.loading(`Uploading ${file.name}...`);
        
        const imageMetadata = {
          title: file.name,
          alt_text: file.name,
        };
        
        const uploadedImage = await mediaApi.upload(file, imageMetadata);
        
        const newImage: ProductImage = {
          id: uploadedImage.id,
          src: uploadedImage.source_url,
          alt: uploadedImage.alt_text || file.name,
          name: uploadedImage.title?.rendered || file.name,
          title: uploadedImage.title?.rendered || file.name,
        };
        
        form.setValue('images', [...currentImages, newImage]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    const currentImages = form.getValues('images') || [];
    form.setValue('images', currentImages.filter((_, i) => i !== imageIndex));
  };

  const handleUpdateImageMetadata = (imageIndex: number, metadata: Partial<ProductImage>) => {
    const currentImages = form.getValues('images') || [];
    const updatedImages = [...currentImages];
    updatedImages[imageIndex] = { ...updatedImages[imageIndex], ...metadata };
    form.setValue('images', updatedImages);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Price & Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (Permalink)</FormLabel>
                      <FormControl>
                        <Input placeholder="product-url-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be part of the product URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Long Description</FormLabel>
                        <AiGenerateButton 
                          onGenerate={(text) => form.setValue('description', text)}
                          productName={form.getValues('name')}
                          category={getPrimaryCategoryName()}
                          brand={getBrandName()}
                          fieldType="description"
                        />
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed product description..."
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Short Description</FormLabel>
                        <AiGenerateButton 
                          onGenerate={(text) => form.setValue('short_description', text)}
                          productName={form.getValues('name')}
                          category={getPrimaryCategoryName()}
                          brand={getBrandName()}
                          fieldType="short_description"
                        />
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief summary of the product..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Tags</FormLabel>
                    <AiGenerateButton 
                      onGenerate={(text) => {
                        const tagsList = text.split(',').map(tag => tag.trim()).filter(tag => tag);
                        tagsList.forEach(tag => handleAddTag(tag));
                      }}
                      productName={form.getValues('name')}
                      category={getPrimaryCategoryName()}
                      brand={getBrandName()}
                      fieldType="tags"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch('tags')?.map((tag, index) => (
                      <Badge key={tag.id || index} variant="secondary">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          handleAddTag(tagInput.trim());
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (tagInput.trim()) {
                          handleAddTag(tagInput.trim());
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Stock Keeping Unit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stock status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instock">In stock</SelectItem>
                            <SelectItem value="outofstock">Out of stock</SelectItem>
                            <SelectItem value="onbackorder">On backorder</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="regular_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty if not on sale
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="manage_stock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Manage Stock</FormLabel>
                        <FormDescription>
                          Track inventory levels for this product
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('manage_stock') && (
                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                              field.onChange(value);
                            }}
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <FormLabel>Product Images</FormLabel>
                  <FormDescription>
                    Drag and drop images or click to browse. First image will be the main product image.
                  </FormDescription>
                  
                  <ImageUploader onImagesSelected={handleImageUpload} />
                  
                  {form.watch('images').length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {form.watch('images').map((image, index) => (
                        <div key={index} className="relative border rounded-md p-2">
                          <div className="aspect-square rounded-md overflow-hidden">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-1">
                              <Input 
                                placeholder="Alt text"
                                value={image.alt}
                                onChange={(e) => handleUpdateImageMetadata(index, { alt: e.target.value })}
                                className="text-xs"
                              />
                              <AiGenerateButton
                                onGenerate={(text) => handleUpdateImageMetadata(index, { alt: text })}
                                productName={form.getValues('name')}
                                category={getPrimaryCategoryName()}
                                brand={getBrandName()}
                                fieldType="alt_text"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Input 
                                placeholder="Title"
                                value={image.title || ''}
                                onChange={(e) => handleUpdateImageMetadata(index, { title: e.target.value })}
                                className="text-xs"
                              />
                              <AiGenerateButton
                                onGenerate={(text) => handleUpdateImageMetadata(index, { title: text })}
                                productName={form.getValues('name')}
                                category={getPrimaryCategoryName()}
                                brand={getBrandName()}
                                fieldType="image_title"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Input 
                                placeholder="Caption"
                                value={image.caption || ''}
                                onChange={(e) => handleUpdateImageMetadata(index, { caption: e.target.value })}
                                className="text-xs"
                              />
                              <AiGenerateButton
                                onGenerate={(text) => handleUpdateImageMetadata(index, { caption: text })}
                                productName={form.getValues('name')}
                                category={getPrimaryCategoryName()}
                                brand={getBrandName()}
                                fieldType="caption"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Input 
                                placeholder="Description"
                                value={image.description || ''}
                                onChange={(e) => handleUpdateImageMetadata(index, { description: e.target.value })}
                                className="text-xs"
                              />
                              <AiGenerateButton
                                onGenerate={(text) => handleUpdateImageMetadata(index, { description: text })}
                                productName={form.getValues('name')}
                                category={getPrimaryCategoryName()}
                                brand={getBrandName()}
                                fieldType="image_description"
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2">Main</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p>No images yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="rankmath_seo.focus_keyword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Focus Keyword</FormLabel>
                        <AiGenerateButton 
                          onGenerate={(text) => form.setValue('rankmath_seo.focus_keyword', text)}
                          productName={form.getValues('name')}
                          category={getPrimaryCategoryName()}
                          brand={getBrandName()}
                          fieldType="focus_keyword"
                        />
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="Main keyword for SEO" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The main keyword you want this product to rank for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rankmath_seo.meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Meta Title</FormLabel>
                        <AiGenerateButton 
                          onGenerate={(text) => form.setValue('rankmath_seo.meta_title', text)}
                          productName={form.getValues('name')}
                          category={getPrimaryCategoryName()}
                          brand={getBrandName()}
                          fieldType="meta_title"
                        />
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="SEO Title" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use the product title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rankmath_seo.meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Meta Description</FormLabel>
                        <AiGenerateButton 
                          onGenerate={(text) => form.setValue('rankmath_seo.meta_description', text)}
                          productName={form.getValues('name')}
                          category={getPrimaryCategoryName()}
                          brand={getBrandName()}
                          fieldType="meta_description"
                        />
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="SEO Description" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use the product short description
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
