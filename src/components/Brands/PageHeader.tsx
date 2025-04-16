
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  totalBrands: number;
  isLoading: boolean;
  onCreateBrand: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  totalBrands, 
  isLoading, 
  onCreateBrand 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">
        Brands 
        <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {isLoading ? 'Loading...' : `${totalBrands} brands`}
        </span>
      </h1>
      <Button onClick={onCreateBrand}>
        <Plus className="h-4 w-4 mr-2" /> 
        New Brand
      </Button>
    </div>
  );
};

export default PageHeader;
