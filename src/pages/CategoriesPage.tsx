
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, extractData } from '@/utils/api';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoriesList from '@/components/Categories/CategoriesList';
import CategoryForm from '@/components/Categories/CategoryForm';
import { Category } from '@/types/category';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CategoriesPage = () => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categoriesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll({ per_page: "100" });
      return extractData(response);
    },
    meta: {
      totalCount: true // This will help us get the total count from headers
    }
  });
  
  const categories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const totalCategories = categoriesResponse?.headers?.['x-wp-total'] 
    ? parseInt(categoriesResponse.headers['x-wp-total']) 
    : categories.length;

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
          <h1 className="text-3xl font-bold">
            Categories Manager 
            <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {isLoading ? 'Loading...' : `${totalCategories} categories`}
            </span>
          </h1>
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Unable to fetch categories. Your WooCommerce API keys may not have sufficient permissions.
            <ul className="list-disc ml-6 mt-2">
              <li>Ensure your API keys have read/write access to the WooCommerce REST API</li>
              <li>Verify the API credentials in Settings are correct</li>
              <li>Check that your WooCommerce site has REST API enabled</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

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

