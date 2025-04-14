
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/utils/api';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoriesList from '@/components/Categories/CategoriesList';
import CategoryForm from '@/components/Categories/CategoryForm';
import { Category } from '@/types/category';
import { WooCommerceResponse } from '@/utils/api/woocommerceCore';

const CategoriesPage = () => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categoriesResponse, isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll({ per_page: 100 }),
  });
  
  // Extract the categories array from the response
  const categories: Category[] = categoriesResponse?.data || [];

  const handleCloseForm = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddingCategory(false);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Categories refreshed');
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories Manager</h1>
          <p className="text-muted-foreground mt-1">Manage your WooCommerce product categories</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh categories"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddingCategory(true)} disabled={isAddingCategory || editingCategory !== null}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {(isAddingCategory || editingCategory) ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
            </h2>
            <Button variant="ghost" onClick={handleCloseForm}>Cancel</Button>
          </div>
          <CategoryForm 
            category={editingCategory} 
            onSaved={() => {
              handleCloseForm();
              refetch();
            }} 
          />
        </div>
      ) : null}

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Categories List</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <CategoriesList 
            categories={categories} 
            isLoading={isLoading} 
            onEdit={handleEditCategory} 
            onRefresh={handleRefresh} 
          />
        </TabsContent>
        <TabsContent value="hierarchy">
          <div className="p-8 text-center text-muted-foreground">
            Hierarchy view coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriesPage;
