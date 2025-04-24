
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductActiveFiltersProps {
  filtersCount: number;
  onClearFilters: () => void;
}

const ProductActiveFilters: React.FC<ProductActiveFiltersProps> = ({ 
  filtersCount, 
  onClearFilters 
}) => {
  if (filtersCount === 0) return null;
  
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <span>{filtersCount} active filters</span>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-4 w-4 p-0 ml-1" 
        onClick={onClearFilters}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
};

export default ProductActiveFilters;
