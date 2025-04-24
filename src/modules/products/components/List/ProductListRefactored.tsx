
import React, { useState, useEffect, useCallback } from 'react';
import { Table } from '@/components/ui/table';
import { productsApi } from '@/utils/api';
import { toast } from 'sonner';
import { Product, ProductTag } from '@/types/product';
import { DateRange } from '@/components/ui/calendar';

import ProductTableHeader from './ProductTableHeader';
import ProductTableBody from './ProductTableBody';
import ProductSearchBar from './ProductSearchBar';
import ProductToolbar from './ProductToolbar';
import DeleteProductDialog from './DeleteProductDialog';
import ProductLoadingState from './ProductLoadingState';
import ProductPagination from './ProductPagination';
import { Column, ProductFilters } from '../Types/ProductTypes';

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
  tags?: ProductTag[];
  allProducts: Product[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const ProductListRefactored: React.FC<ProductsListProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onRefresh,
  tags = [],
  allProducts,
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [isColumnDragging, setIsColumnDragging] = useState(false);
  const [dragColumnId, setDragColumnId] = useState<string | null>(null);
  const [enableHorizontalScroll, setEnableHorizontalScroll] = useState(true);
  
  const [columns, setColumns] = useState<Column[]>([
    { id: 'selection', name: '', visible: true, sortable: false, width: 'w-[40px]', align: 'center', order: 0 },
    { id: 'image', name: 'Image', visible: true, sortable: false, width: 'w-[60px]', order: 1 },
    { id: 'name', name: 'Product', visible: true, sortable: true, order: 2 },
    { id: 'brand', name: 'Brand', visible: true, sortable: true, order: 3 },
    { id: 'categories', name: 'Category', visible: true, sortable: false, order: 4 },
    { id: 'tags', name: 'Tags', visible: false, sortable: false, order: 5 },
    { id: 'type', name: 'Type', visible: true, sortable: true, width: 'w-[120px]', align: 'center', order: 6 },
    { id: 'sku', name: 'SKU', visible: true, sortable: true, width: 'w-[150px]', order: 7 },
    { id: 'permalink', name: 'Permalink', visible: false, sortable: true, order: 8 },
    { id: 'identifiers', name: 'Identifiers', visible: false, sortable: false, width: 'w-[150px]', order: 9 },
    { id: 'regular_price', name: 'Regular Price', visible: true, sortable: true, width: 'w-[120px]', align: 'right', order: 10 },
    { id: 'sale_price', name: 'Sale Price', visible: true, sortable: true, width: 'w-[120px]', align: 'right', order: 11 },
    { id: 'stock_status', name: 'Stock', visible: true, sortable: true, width: 'w-[100px]', align: 'center', order: 12 },
    { id: 'actions', name: 'Actions', visible: true, sortable: false, width: 'w-[100px]', align: 'right', order: 13 }
  ]);
  
  const [filters, setFilters] = useState<ProductFilters>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [advancedSearchMode, setAdvancedSearchMode] = useState(false);

  // Load columns configuration from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('product_columns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        setColumns(parsedColumns);
      } catch (e) {
        console.error('Error parsing saved columns', e);
      }
    }
    
    const savedScroll = localStorage.getItem('horizontal_scroll');
    if (savedScroll) {
      setEnableHorizontalScroll(savedScroll === 'true');
    }
  }, []);

  // Save columns configuration to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('product_columns', JSON.stringify(columns));
  }, [columns]);
  
  // Save horizontal scroll preference
  useEffect(() => {
    localStorage.setItem('horizontal_scroll', String(enableHorizontalScroll));
  }, [enableHorizontalScroll]);

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, visible: !col.visible } 
        : col
    ));
  };

  const resetColumnVisibility = () => {
    setColumns(columns.map(col => ({ ...col, visible: true })));
  };
  
  const handleColumnDragStart = (columnId: string) => {
    setIsColumnDragging(true);
    setDragColumnId(columnId);
  };
  
  const handleColumnDragOver = (columnId: string) => {
    if (isColumnDragging && dragColumnId && dragColumnId !== columnId) {
      const updatedColumns = [...columns];
      
      const dragIndex = updatedColumns.findIndex(col => col.id === dragColumnId);
      const dropIndex = updatedColumns.findIndex(col => col.id === columnId);
      
      if (dragIndex !== -1 && dropIndex !== -1) {
        const dragOrder = updatedColumns[dragIndex].order;
        const dropOrder = updatedColumns[dropIndex].order;
        
        updatedColumns[dragIndex] = { ...updatedColumns[dragIndex], order: dropOrder };
        updatedColumns[dropIndex] = { ...updatedColumns[dropIndex], order: dragOrder };
        
        setColumns(updatedColumns);
      }
    }
  };
  
  const handleColumnDragEnd = () => {
    setIsColumnDragging(false);
    setDragColumnId(null);
  };

  const applyFilter = (field: string, value: string | DateRange | undefined) => {
    if (value) {
      setFilters({ ...filters, [field]: value });
      if (field === 'date_created' && typeof value !== 'string') {
        setDateRange(value);
      }
    } else {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
      if (field === 'date_created') {
        setDateRange(undefined);
      }
    }
  };
  
  const clearFilters = () => {
    setFilters({});
    setDateRange(undefined);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const filteredProducts = (allProducts.length > 0 ? allProducts : products).filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.permalink && product.permalink.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = Object.entries(filters).every(([field, filterValue]) => {
      if (!filterValue) return true;

      if (field === 'date_created' && filterValue && typeof filterValue !== 'string') {
        const { from, to } = filterValue;
        if (!from) return true;
        
        const productDate = new Date(product.date_created || '');
        if (isNaN(productDate.getTime())) return false;
        
        if (from && to) {
          return productDate >= from && productDate <= to;
        }
        return productDate >= from;
      }

      if (field === 'min_price' && product.regular_price) {
        const productPrice = parseFloat(product.regular_price);
        const minPrice = parseFloat(filterValue as string);
        return !isNaN(productPrice) && !isNaN(minPrice) && productPrice >= minPrice;
      }

      if (field === 'max_price' && product.regular_price) {
        const productPrice = parseFloat(product.regular_price);
        const maxPrice = parseFloat(filterValue as string);
        return !isNaN(productPrice) && !isNaN(maxPrice) && productPrice <= maxPrice;
      }
      
      if (field === 'tag_id' && product.tags) {
        return product.tags.some(tag => tag.id === parseInt(filterValue as string));
      }
      
      if (field in product) {
        const fieldValue = product[field as keyof Product];
        
        if (field === 'categories' && Array.isArray(product.categories)) {
          return product.categories.some(cat => 
            cat.name.toLowerCase().includes((filterValue as string).toLowerCase())
          );
        }
        
        if (field === 'tags' && Array.isArray(product.tags)) {
          return product.tags.some(tag => 
            tag.name.toLowerCase().includes((filterValue as string).toLowerCase())
          );
        }
        
        if (fieldValue === undefined) return false;
        
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes((filterValue as string).toLowerCase());
        }
        
        return String(fieldValue).toLowerCase().includes((filterValue as string).toLowerCase());
      }
      
      return true;
    });
    
    return matchesSearch && matchesFilters;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'categories' && a.categories && b.categories) {
      aValue = a.categories[0]?.name || '';
      bValue = b.categories[0]?.name || '';
    }
    
    if (sortField === 'tags' && a.tags && b.tags) {
      aValue = a.tags[0]?.name || '';
      bValue = b.tags[0]?.name || '';
    }
    
    if (sortField === 'regular_price' || sortField === 'sale_price') {
      aValue = parseFloat(aValue || '0');
      bValue = parseFloat(bValue || '0');
    }
    
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete?.id) return;
    
    setIsDeleting(true);
    try {
      await productsApi.delete(productToDelete.id);
      toast.success(`"${productToDelete.name}" deleted successfully`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      const newSelection: Record<string, boolean> = {};
      sortedProducts.forEach(product => {
        if (product.id) {
          newSelection[product.id.toString()] = true;
        }
      });
      setSelectedProducts(newSelection);
    } else {
      setSelectedProducts({});
    }
  };
  
  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: checked
    }));
  };
  
  const toggleBulkEditMode = () => {
    setBulkEditMode(!bulkEditMode);
    if (!bulkEditMode) {
      toast.info("Bulk edit mode enabled. Select products to edit.");
    } else {
      setSelectedProducts({});
    }
  };
  
  const selectedProductCount = Object.values(selectedProducts).filter(Boolean).length;
  
  const getSelectedProductIds = useCallback(() => {
    return Object.entries(selectedProducts)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id));
  }, [selectedProducts]);
  
  const getSelectedProductsData = useCallback(() => {
    return sortedProducts.filter(p => p.id && selectedProducts[p.id.toString()]);
  }, [sortedProducts, selectedProducts]);
  
  const toggleAdvancedSearch = () => {
    setAdvancedSearchMode(!advancedSearchMode);
  };

  // Sort columns by order for display
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  
  // Only show visible columns
  const visibleColumns = sortedColumns.filter(column => column.visible);

  if (isLoading) {
    return <ProductLoadingState />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <ProductSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <ProductToolbar 
          filters={filters}
          dateRange={dateRange}
          applyFilter={applyFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          tags={tags}
          columns={columns}
          toggleColumnVisibility={toggleColumnVisibility}
          resetColumnVisibility={resetColumnVisibility}
          enableHorizontalScroll={enableHorizontalScroll}
          setEnableHorizontalScroll={setEnableHorizontalScroll}
          bulkEditMode={bulkEditMode}
          toggleBulkEditMode={toggleBulkEditMode}
          onRefresh={onRefresh}
          advancedSearchMode={advancedSearchMode}
          toggleAdvancedSearch={toggleAdvancedSearch}
        />
      </div>
      
      <div className={enableHorizontalScroll ? "overflow-x-auto" : ""}>
        <Table>
          <ProductTableHeader 
            visibleColumns={visibleColumns}
            handleColumnDragStart={handleColumnDragStart}
            handleColumnDragOver={handleColumnDragOver}
            handleColumnDragEnd={handleColumnDragEnd}
            handleSelectAllProducts={handleSelectAllProducts}
            handleSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedProductCount={selectedProductCount}
            productsCount={sortedProducts.length}
          />
          
          <ProductTableBody 
            products={sortedProducts}
            visibleColumns={visibleColumns}
            selectedProducts={selectedProducts}
            handleSelectProduct={handleSelectProduct}
            onEdit={onEdit}
            handleDeleteClick={handleDeleteClick}
          />
        </Table>
      </div>
      
      {!allProducts.length && (
        <ProductPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />
      )}
      
      <DeleteProductDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={productToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProductListRefactored;
