
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandsApi, extractData } from '@/utils/api';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PageHeader from '@/components/Brands/PageHeader';

const BrandsManager = () => {
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  
  const { data: brandsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandsApi.getAll({ per_page: "100" });
      return extractData(response);
    },
    meta: {
      totalCount: true // This will help us get the total count from headers
    }
  });
  
  const brands = Array.isArray(brandsResponse) ? brandsResponse : [];
  const totalBrands = brandsResponse?.headers?.['x-wp-total'] 
    ? parseInt(brandsResponse.headers['x-wp-total']) 
    : brands.length;

  const handleRefresh = () => {
    refetch();
    toast.success('Brands refreshed');
  };

  const handleCreateBrand = () => {
    setIsAddingBrand(true);
  };

  return (
    <div className="container p-6 mx-auto">
      <PageHeader 
        totalBrands={totalBrands} 
        isLoading={isLoading} 
        onCreateBrand={handleCreateBrand} 
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to fetch brands. Your WooCommerce API keys may not have sufficient permissions.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No brands found. Create your first brand to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <div 
                  key={brand.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{brand.name}</h3>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground mt-1">{brand.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandsManager;

