import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronLeft, Loader2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import ProductsList from '@/components/Products/ProductsList';
import ProductForm from '@/components/Products/ProductForm';
import { productsApi } from '@/utils/api';
import { Product } from '@/types/product';
import { toast } from 'sonner';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [customPerPage, setCustomPerPage] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', currentPage, perPage],
    queryFn: async () => {
      try {
        const params = {
          per_page: perPage.toString(),
          page: currentPage.toString()
        };
        
        const response = await productsApi.getAll(params);
        
        // Get total from headers if available or fallback to array length
        const total = response.length || 0;
        setTotalProducts(total);
        
        // Calculate total pages
        setTotalPages(Math.max(1, Math.ceil(total / perPage)));
        
        return response || [];
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

  const handlePerPageChange = (value: number[]) => {
    setPerPage(value[0]);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleCustomPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPerPage(e.target.value);
  };

  const applyCustomPerPage = () => {
    const value = parseInt(customPerPage);
    if (!isNaN(value) && value >= 1) {
      setPerPage(value);
      setCurrentPage(1);
      setCustomPerPage('');
    } else {
      toast.error('Please enter a valid number greater than 0');
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLoadAll = async () => {
    setIsLoadingAll(true);
    toast.info('Loading all products. This may take a while...');
    
    try {
      let page = 1;
      let hasMoreProducts = true;
      const allProductsArray: Product[] = [];
      
      // First, get the first page with a large per_page value to get approximate total
      const params = {
        per_page: '100',
        page: '1'
      };
      
      const firstPageResponse = await productsApi.getAll(params);
      allProductsArray.push(...firstPageResponse);
      
      // If there are potentially more products, keep fetching
      while (hasMoreProducts && page < 100) { // Safety limit of 100 pages
        page++;
        const nextParams = {
          per_page: '100', // Fetch in chunks of 100
          page: page.toString()
        };
        
        const response = await productsApi.getAll(nextParams);
        
        if (response && response.length > 0) {
          allProductsArray.push(...response);
        } else {
          hasMoreProducts = false;
        }
      }
      
      setAllProducts(allProductsArray);
      setTotalProducts(allProductsArray.length);
      toast.success(`Loaded all ${allProductsArray.length} products successfully`);
    } catch (err) {
      console.error('Error loading all products:', err);
      toast.error('Failed to load all products. Please try a smaller batch.');
    } finally {
      setIsLoadingAll(false);
    }
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

  // Determine which products to display
  const displayProducts = allProducts.length > 0 ? allProducts : (products || []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Products 
          <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {isLoading || isLoadingAll ? 'Loading...' : `${totalProducts} items`}
          </span>
        </h1>
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
          <div className="mb-6 p-4 bg-card rounded-md border shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Products per page</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">1</span>
                  <Slider
                    className="flex-1 mx-2"
                    defaultValue={[perPage]}
                    max={500}
                    min={1}
                    step={10}
                    value={[perPage]}
                    onValueChange={handlePerPageChange}
                  />
                  <span className="text-sm">500</span>
                  <span className="ml-4 px-2 py-1 bg-primary/10 rounded text-sm font-medium">
                    {perPage}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Custom count"
                  className="w-32"
                  value={customPerPage}
                  onChange={handleCustomPerPageChange}
                  min={1}
                />
                <Button variant="outline" size="sm" onClick={applyCustomPerPage}>
                  Apply
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleLoadAll} 
                  disabled={isLoadingAll}
                  className="ml-2"
                >
                  {isLoadingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading All...
                    </>
                  ) : (
                    <>
                      <ListFilter className="h-4 w-4 mr-2" />
                      Load All ({allProducts.length > 0 ? allProducts.length : '5000+'})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <ProductsList 
            products={displayProducts} 
            isLoading={isLoading || isLoadingAll} 
            onEdit={handleEditProduct}
            onRefresh={refetch}
          />
          
          {!allProducts.length && currentPage < totalPages && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleLoadMore} 
                variant="outline"
                className="w-full max-w-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Load More Products
              </Button>
            </div>
          )}
          
          {!allProducts.length && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  {currentPage === 1 || isLoading ? (
                    <span className="pointer-events-none opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium gap-1 pl-2.5 h-10 px-4 py-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </span>
                  ) : (
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    />
                  )}
                </PaginationItem>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Calculate page numbers to show (centered around current page)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  {currentPage === totalPages || isLoading ? (
                    <span className="pointer-events-none opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium gap-1 pr-2.5 h-10 px-4 py-2">
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
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
