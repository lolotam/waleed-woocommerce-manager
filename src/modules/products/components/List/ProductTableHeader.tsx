
import React from 'react';
import { 
  TableHead,
  TableRow,
  TableHeader, 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Column } from '../Types/ProductTypes';
import { Product } from '@/types/product';

interface ProductTableHeaderProps {
  visibleColumns: Column[];
  handleColumnDragStart: (columnId: string) => void;
  handleColumnDragOver: (columnId: string) => void;
  handleColumnDragEnd: () => void;
  handleSelectAllProducts: (checked: boolean) => void;
  handleSort: (field: keyof Product) => void;
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  selectedProductCount: number;
  productsCount: number;
}

const ProductTableHeader: React.FC<ProductTableHeaderProps> = ({
  visibleColumns,
  handleColumnDragStart,
  handleColumnDragOver,
  handleColumnDragEnd,
  handleSelectAllProducts,
  handleSort,
  sortField,
  sortDirection,
  selectedProductCount,
  productsCount
}) => {
  const renderSortIcon = (field: keyof Product) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 inline ml-1" /> 
      : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const getColumnAlign = (column: Column) => {
    switch(column.align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  };

  return (
    <TableHeader>
      <TableRow>
        {visibleColumns.map((column) => (
          <TableHead
            key={column.id}
            className={`${getColumnAlign(column)} ${column.width || ''}`}
            draggable={column.id !== 'selection'}
            onDragStart={() => handleColumnDragStart(column.id)}
            onDragOver={() => handleColumnDragOver(column.id)}
            onDragEnd={handleColumnDragEnd}
            style={{ cursor: column.id !== 'selection' ? 'grab' : 'default' }}
          >
            {column.id === 'selection' ? (
              <Checkbox
                checked={
                  selectedProductCount > 0 && 
                  selectedProductCount === productsCount
                }
                onCheckedChange={handleSelectAllProducts}
              />
            ) : column.sortable ? (
              <button 
                className="flex items-center w-full"
                onClick={() => handleSort(column.id as keyof Product)}
              >
                {column.name}
                {renderSortIcon(column.id as keyof Product)}
              </button>
            ) : (
              column.name
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
