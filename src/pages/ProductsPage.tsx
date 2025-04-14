
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsList from '@/components/Products/ProductsList';
import ProductForm from '@/components/Products/ProductForm';
import { productsApi } from '@/utils/woocommerceApi';
import { Product } from '@/types/product';
import { toast } from 'sonner';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const data = await productsApi.getAll({ per_page: 100 });
        return data || [];
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Failed to load products. Please check your WooCommerce connection.');
        return [];
      }
    }
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('edit');
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setActiveTab('edit');
  };

  const handleSaveComplete = () => {
    setActiveTab('list');
    refetch();
    setSelectedProduct(null);
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <p>Failed to load products. Please check your WooCommerce connection settings.</p>
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={handleCreateProduct}>
          <Plus className="h-4 w-4 mr-2" /> 
          New Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list">Product List</TabsTrigger>
          <TabsTrigger value="edit">
            {selectedProduct ? 'Edit Product' : 'New Product'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ProductsList 
            products={products || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <ProductForm 
            product={selectedProduct}
            onSaveComplete={handleSaveComplete}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsPage;
