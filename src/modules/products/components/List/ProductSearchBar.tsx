
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search products..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

export default ProductSearchBar;
