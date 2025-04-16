
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ProductForm from '@/components/Products/ProductForm';
import { BulkEditForm } from '@/components/Products/BulkEditForm';
import { productsApi, extractData, extractDataWithPagination } from '@/utils/api';
import { Product, ProductTag } from '@/types/product';
import { toast } from 'sonner';

// Import refactored components
import PageHeader from '@/components/Products/Page/PageHeader';
import ProductPerPageControls from '@/components/Products/Page/ProductPerPageControls';
import GoToPageControl from '@/components/Products/Page/GoToPageControl';
import LoadAllControl from '@/components/Products/Page/LoadAllControl';
import ProductListRefactored from '@/components/Products/List/ProductListRefactored';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [customPerPage, setCustomPerPage] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadAllProgress, setLoadAllProgress] = useState(0);

  const MAX_PER_PAGE = 5000;
  
  // Fetch product tags for filtering options
  const { data: productTags } = useQuery({
    queryKey: ['product-tags'],
    queryFn: async () => {
      try {
        const response = await productsApi.getTags({ per_page: "100" });
        return extractData(response);
      } catch (error) {
        console.error('Error fetching product tags:', error);
        return [];
      }
    }
  });

  const { data: productsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['products', currentPage, perPage],
    queryFn: async () => {
      try {
        const safePerPage = Math.min(perPage, MAX_PER_PAGE);
        
        const params = {
          per_page: safePerPage.toString(),
          page: currentPage.toString()
        };
        
        const response = await productsApi.getAll(params);
        const { data, totalItems, totalPages: responseTotalPages } = extractDataWithPagination(response);
        
        const products = Array.isArray(data) ? data : [];
        const total = totalItems || products.length;
        
        setTotalProducts(total);
        setTotalPages(responseTotalPages || Math.max(1, Math.ceil(total / safePerPage)));
        
        return products;
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

  const handleLoadAll = async () => {
    setIsLoadingAll(true);
    setAllProducts([]);
    setLoadAllProgress(0);
    toast.info('Loading all products. This may take a while for large stores...');
    
    try {
      let page = 1;
      let hasMoreProducts = true;
      const allProductsArray: Product[] = [];
      
      const params = {
        per_page: MAX_PER_PAGE.toString(),
        page: '1'
      };
      
      const firstPageResponse = await productsApi.getAll(params);
      
      if (!Array.isArray(firstPageResponse.data)) {
        throw new Error('Invalid response format from WooCommerce API');
      }
      
      allProductsArray.push(...firstPageResponse.data);
      
      let totalProductCount = firstPageResponse.totalItems || firstPageResponse.data.length;
      
      const estimatedTotalPages = Math.ceil(totalProductCount / MAX_PER_PAGE);
      setLoadAllProgress(Math.round((1 / estimatedTotalPages) * 100));
      
      while (hasMoreProducts && page < 1000) {
        page++;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const nextParams = {
          per_page: MAX_PER_PAGE.toString(),
          page: page.toString()
        };
        
        try {
          const response = await productsApi.getAll(nextParams);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            allProductsArray.push(...response.data);
            setLoadAllProgress(Math.min(95, Math.round((page / estimatedTotalPages) * 100)));
          } else {
            hasMoreProducts = false;
          }
        } catch (err) {
          console.error(`Error fetching page ${page}:`, err);
          if (page < estimatedTotalPages - 1) {
            toast.error(`Failed to load page ${page}. Trying to continue...`);
            continue;
          } else {
            hasMoreProducts = false;
          }
        }
      }
      
      setAllProducts(allProductsArray);
      setTotalProducts(allProductsArray.length);
      setLoadAllProgress(100);
      toast.success(`Loaded all ${allProductsArray.length} products successfully`);
    } catch (err) {
      console.error('Error loading all products:', err);
      toast.error('Failed to load all products. Please try a smaller batch or check your connection.');
      setLoadAllProgress(0);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleCancelLoadAll = () => {
    setIsLoadingAll(false);
    setLoadAllProgress(0);
    toast.info('Cancelled loading all products');
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-destructive/10 border-destructive">
          <div className="p-6">
            <p>Failed to load products. Please check your WooCommerce connection settings.</p>
            <button 
              className="mt-4 px-4 py-2 border rounded hover:bg-muted"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        totalProducts={totalProducts} 
        isLoading={isLoading || isLoadingAll}
        onCreateProduct={handleCreateProduct}
      />

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
              <ProductPerPageControls 
                perPage={perPage}
                setPerPage={setPerPage}
                maxPerPage={MAX_PER_PAGE}
              />
              
              <div className="flex flex-wrap items-center gap-2">
                <GoToPageControl 
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
                
                <LoadAllControl 
                  isLoadingAll={isLoadingAll}
                  loadAllProgress={loadAllProgress}
                  handleLoadAll={handleLoadAll}
                  handleCancelLoadAll={handleCancelLoadAll}
                  allProductsCount={allProducts.length}
                />
              </div>
            </div>
          </div>
          
          <ProductListRefactored 
            products={Array.isArray(productsResponse) ? productsResponse : []} 
            isLoading={isLoading || isLoadingAll} 
            onEdit={handleEditProduct}
            onRefresh={refetch}
            tags={productTags || []}
            allProducts={allProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
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
