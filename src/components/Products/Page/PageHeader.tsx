
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  totalProducts: number;
  isLoading: boolean;
  onCreateProduct: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  totalProducts, 
  isLoading, 
  onCreateProduct 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">
        Products 
        <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {isLoading ? 'Loading...' : `${totalProducts} items`}
        </span>
      </h1>
      <Button onClick={onCreateProduct}>
        <Plus className="h-4 w-4 mr-2" /> 
        New Product
      </Button>
    </div>
  );
};

export default PageHeader;
