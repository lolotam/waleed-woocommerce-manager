
import React from 'react';
import { Filter, Pencil, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductActiveFilters from './ProductActiveFilters';
import ProductFiltersMenu from './ProductFiltersMenu';
import ProductColumnsMenu from './ProductColumnsMenu';
import { DateRange } from '@/components/ui/calendar';
import { ProductTag } from '@/types/product';
import { Column } from '../Types/ProductTypes';

interface ProductToolbarProps {
  filters: Record<string, any>;
  dateRange: DateRange | undefined;
  applyFilter: (field: string, value: string | DateRange | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  tags: ProductTag[];
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  resetColumnVisibility: () => void;
  enableHorizontalScroll: boolean;
  setEnableHorizontalScroll: (value: boolean) => void;
  bulkEditMode: boolean;
  toggleBulkEditMode: () => void;
  onRefresh: () => void;
  advancedSearchMode: boolean;
  toggleAdvancedSearch: () => void;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  filters,
  dateRange,
  applyFilter,
  clearFilters,
  hasActiveFilters,
  tags,
  columns,
  toggleColumnVisibility,
  resetColumnVisibility,
  enableHorizontalScroll,
  setEnableHorizontalScroll,
  bulkEditMode,
  toggleBulkEditMode,
  onRefresh,
  advancedSearchMode,
  toggleAdvancedSearch
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProductActiveFilters 
        filtersCount={Object.keys(filters).length} 
        onClearFilters={clearFilters} 
      />
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={toggleAdvancedSearch}
        className={advancedSearchMode ? "bg-muted" : ""}
      >
        <Filter className="h-4 w-4 mr-2" />
        {advancedSearchMode ? "Simple Search" : "Advanced Search"}
      </Button>
      
      <ProductFiltersMenu 
        filters={filters}
        dateRange={dateRange}
        applyFilter={applyFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        tags={tags}
      />
      
      <ProductColumnsMenu 
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        resetColumnVisibility={resetColumnVisibility}
        enableHorizontalScroll={enableHorizontalScroll}
        setEnableHorizontalScroll={setEnableHorizontalScroll}
      />
      
      <Button
        variant={bulkEditMode ? "default" : "outline"}
        size="sm"
        onClick={toggleBulkEditMode}
        className={bulkEditMode ? "bg-amber-500 hover:bg-amber-600" : ""}
      >
        <Pencil className="h-4 w-4 mr-2" />
        {bulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        title="Refresh products"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductToolbar;
