
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { productsApi } from '@/utils/api';
import { toast } from 'sonner';
import { Product, ProductTag } from '@/types/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, AlertCircle, Check, Save, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkEditFormProps {
  productIds: number[];
  products: Product[];
  onComplete: () => void;
  onCancel: () => void;
}

interface BulkEditFields {
  regular_price?: string;
  sale_price?: string;
  categories?: { id: number, name: string, slug: string }[];
  tags?: ProductTag[];
  type?: 'simple' | 'grouped' | 'external' | 'variable';
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
}

export const BulkEditForm: React.FC<BulkEditFormProps> = ({
  productIds,
  products,
  onComplete,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateFields, setUpdateFields] = useState<Record<string, boolean>>({
    regular_price: false,
    sale_price: false,
    categories: false,
    tags: false,
    type: false,
    stock_status: false,
    meta_title: false,
    meta_description: false,
    focus_keyword: false
  });
  
  const [formData, setFormData] = useState<BulkEditFields>({
    regular_price: '',
    sale_price: '',
    categories: [],
    tags: [],
    type: 'simple',
    stock_status: 'instock',
    meta_title: '',
    meta_description: '',
    focus_keyword: ''
  });
  
  const updateField = (field: keyof BulkEditFields, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const toggleField = (field: string) => {
    setUpdateFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build update data from selected fields
      const updateData: any = {};
      
      if (updateFields.regular_price) {
        updateData.regular_price = formData.regular_price;
      }
      
      if (updateFields.sale_price) {
        updateData.sale_price = formData.sale_price;
      }
      
      if (updateFields.categories) {
        updateData.categories = formData.categories;
      }
      
      if (updateFields.tags) {
        updateData.tags = formData.tags;
      }
      
      if (updateFields.type) {
        updateData.type = formData.type;
      }
      
      if (updateFields.stock_status) {
        updateData.stock_status = formData.stock_status;
      }
      
      // Handle SEO fields - these need to be nested in meta_data
      let hasMetaChanges = false;
      const seoData: any = {};
      
      if (updateFields.meta_title) {
        seoData.meta_title = formData.meta_title;
        hasMetaChanges = true;
      }
      
      if (updateFields.meta_description) {
        seoData.meta_description = formData.meta_description;
        hasMetaChanges = true;
      }
      
      if (updateFields.focus_keyword) {
        seoData.focus_keyword = formData.focus_keyword;
        hasMetaChanges = true;
      }
      
      if (hasMetaChanges) {
        updateData.meta_data = [
          {
            key: 'rankmath_seo',
            value: seoData
          }
        ];
      }
      
      if (Object.keys(updateData).length === 0) {
        toast.warning('Please select at least one field to update');
        setIsLoading(false);
        return;
      }
      
      // Batch update products
      const updatePromises = productIds.map(id => 
        productsApi.update(id, updateData)
      );
      
      await Promise.all(updatePromises);
      
      toast.success(`Updated ${productIds.length} products successfully`);
      onComplete();
      
    } catch (err: any) {
      console.error('Error updating products:', err);
      setError(err.message || 'Failed to update products. Please try again.');
      toast.error('Error updating products');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Edit {productIds.length} Products</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Select fields to update and enter new values. Only the selected fields will be changed.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="pricing" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory & Type</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-regular-price"
                      checked={updateFields.regular_price} 
                      onCheckedChange={() => toggleField('regular_price')}
                    />
                    <Label htmlFor="update-regular-price">Update Regular Price</Label>
                  </div>
                  <Input
                    type="text"
                    value={formData.regular_price}
                    onChange={(e) => updateField('regular_price', e.target.value)}
                    placeholder="Enter regular price"
                    disabled={!updateFields.regular_price}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-sale-price"
                      checked={updateFields.sale_price} 
                      onCheckedChange={() => toggleField('sale_price')}
                    />
                    <Label htmlFor="update-sale-price">Update Sale Price</Label>
                  </div>
                  <Input
                    type="text"
                    value={formData.sale_price}
                    onChange={(e) => updateField('sale_price', e.target.value)}
                    placeholder="Enter sale price"
                    disabled={!updateFields.sale_price}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-type"
                      checked={updateFields.type} 
                      onCheckedChange={() => toggleField('type')}
                    />
                    <Label htmlFor="update-type">Update Product Type</Label>
                  </div>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'simple' | 'grouped' | 'external' | 'variable') => updateField('type', value)}
                    disabled={!updateFields.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="grouped">Grouped</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-stock"
                      checked={updateFields.stock_status} 
                      onCheckedChange={() => toggleField('stock_status')}
                    />
                    <Label htmlFor="update-stock">Update Stock Status</Label>
                  </div>
                  <Select
                    value={formData.stock_status}
                    onValueChange={(value: 'instock' | 'outofstock' | 'onbackorder') => updateField('stock_status', value)}
                    disabled={!updateFields.stock_status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="outofstock">Out of Stock</SelectItem>
                      <SelectItem value="onbackorder">On Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-meta-title"
                      checked={updateFields.meta_title} 
                      onCheckedChange={() => toggleField('meta_title')}
                    />
                    <Label htmlFor="update-meta-title">Update Meta Title</Label>
                  </div>
                  <Input
                    value={formData.meta_title || ''}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="Enter meta title"
                    disabled={!updateFields.meta_title}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-meta-description"
                      checked={updateFields.meta_description} 
                      onCheckedChange={() => toggleField('meta_description')}
                    />
                    <Label htmlFor="update-meta-description">Update Meta Description</Label>
                  </div>
                  <Textarea
                    value={formData.meta_description || ''}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="Enter meta description"
                    disabled={!updateFields.meta_description}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update-focus-keyword"
                      checked={updateFields.focus_keyword} 
                      onCheckedChange={() => toggleField('focus_keyword')}
                    />
                    <Label htmlFor="update-focus-keyword">Update Focus Keyword</Label>
                  </div>
                  <Input
                    value={formData.focus_keyword || ''}
                    onChange={(e) => updateField('focus_keyword', e.target.value)}
                    placeholder="Enter focus keyword"
                    disabled={!updateFields.focus_keyword}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update {productIds.length} Products
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BulkEditForm;
