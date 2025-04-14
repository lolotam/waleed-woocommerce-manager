import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronLeft, Loader2, ListFilter, FolderInput } from 'lucide-react';
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
  PaginationEllipsis,
} from '@/components/ui/pagination';
import ProductsList from '@/components/Products/ProductsList';
import ProductForm from '@/components/Products/ProductForm';
import { productsApi, extractData, extractDataWithPagination } from '@/utils/api';
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
  const [loadAllProgress, setLoadAllProgress] = useState(0);

  const MAX_PER_PAGE = 5000;

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
        const { data, totalItems, totalPages: responseTotalPages } = extractDataWithPagination<Product[]>(response);
        
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

  const handlePerPageChange = (value: number[]) => {
    setPerPage(Math.min(value[0], MAX_PER_PAGE));
    setCurrentPage(1);
  };

  const handleCustomPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPerPage(e.target.value);
  };

  const applyCustomPerPage = () => {
    const value = parseInt(customPerPage);
    if (!isNaN(value) && value > 0) {
      setPerPage(Math.min(value, MAX_PER_PAGE));
      setCurrentPage(1);
      toast.success(`Showing ${Math.min(value, MAX_PER_PAGE)} products per page`);
    } else {
      toast.error('Please enter a valid number greater than 0');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyCustomPerPage();
    }
  };

  const [goToPage, setGoToPage] = useState<string>('');
  
  const handleGoToPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToPage(e.target.value);
  };
  
  const handleGoToPageSubmit = () => {
    const pageNum = parseInt(goToPage);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage('');
      toast.success(`Navigated to page ${pageNum}`);
    } else {
      toast.error(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };
  
  const handleGoToPageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPageSubmit();
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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

  const displayProducts: Product[] = allProducts.length > 0 ? allProducts : (Array.isArray(productsResponse) ? productsResponse : []);

  const getPaginationRange = () => {
    const range: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      
      if (currentPage <= 3) {
        range.push(2, 3, 4);
        range.push('ellipsis');
      } else if (currentPage >= totalPages - 2) {
        range.push('ellipsis');
        range.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        range.push('ellipsis');
        range.push(currentPage - 1, currentPage, currentPage + 1);
        range.push('ellipsis');
      }
      
      range.push(totalPages);
    }
    
    return range;
  };

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
                    max={MAX_PER_PAGE}
                    min={1}
                    step={100}
                    value={[perPage]}
                    onValueChange={handlePerPageChange}
                  />
                  <span className="text-sm">{MAX_PER_PAGE}</span>
                  <span className="ml-4 px-2 py-1 bg-primary/10 rounded text-sm font-medium">
                    {perPage}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Set between 1-{MAX_PER_PAGE} products per page
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Custom count"
                    className="w-32"
                    value={customPerPage}
                    onChange={handleCustomPerPageChange}
                    onKeyDown={handleKeyDown}
                    min={1}
                    max={MAX_PER_PAGE}
                  />
                  <Button variant="outline" size="sm" onClick={applyCustomPerPage}>
                    Apply
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="number" 
                    placeholder="Go to page"
                    className="w-32"
                    value={goToPage}
                    onChange={handleGoToPageChange}
                    onKeyDown={handleGoToPageKeyDown}
                    min={1}
                    max={totalPages}
                  />
                  <Button variant="outline" size="sm" onClick={handleGoToPageSubmit}>
                    Go
                  </Button>
                </div>
                
                {isLoadingAll ? (
                  <div className="flex items-center space-x-2 ml-2">
                    <div className="w-64 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-in-out" 
                        style={{ width: `${loadAllProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{loadAllProgress}%</span>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleCancelLoadAll}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleLoadAll} 
                    disabled={isLoadingAll}
                    className="ml-auto"
                  >
                    {isLoadingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading All...
                      </>
                    ) : (
                      <>
                        <ListFilter className="h-4 w-4 mr-2" />
                        Load All Products {allProducts.length > 0 ? `(${allProducts.length})` : ''}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <ProductsList 
            products={displayProducts} 
            isLoading={isLoading || isLoadingAll} 
            onEdit={handleEditProduct}
            onRefresh={refetch}
          />
          
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
                
                {getPaginationRange().map((page, index) => (
                  page === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${page}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                
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
