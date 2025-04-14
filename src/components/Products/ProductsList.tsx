
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon,
  SlidersHorizontal,
  Filter
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { productsApi } from '@/utils/api';
import { toast } from 'sonner';

interface Column {
  id: keyof Product | 'image' | 'actions' | 'identifiers';
  name: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columns, setColumns] = useState<Column[]>([
    { id: 'image', name: 'Image', visible: true, sortable: false, width: 'w-[60px]' },
    { id: 'name', name: 'Product', visible: true, sortable: true },
    { id: 'brand', name: 'Brand', visible: true, sortable: true },
    { id: 'categories', name: 'Category', visible: true, sortable: false },
    { id: 'type', name: 'Type', visible: true, sortable: true, width: 'w-[120px]', align: 'center' },
    { id: 'sku', name: 'SKU', visible: true, sortable: true, width: 'w-[150px]' },
    { id: 'identifiers', name: 'Identifiers', visible: false, sortable: false, width: 'w-[150px]' },
    { id: 'regular_price', name: 'Regular Price', visible: true, sortable: true, width: 'w-[120px]', align: 'right' },
    { id: 'sale_price', name: 'Sale Price', visible: true, sortable: true, width: 'w-[120px]', align: 'right' },
    { id: 'stock_status', name: 'Stock', visible: true, sortable: true, width: 'w-[100px]', align: 'center' },
    { id: 'actions', name: 'Actions', visible: true, sortable: false, width: 'w-[100px]', align: 'right' }
  ]);
  const [filters, setFilters] = useState<{[key: string]: string}>({});

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
  }, []);

  // Save columns configuration to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('product_columns', JSON.stringify(columns));
  }, [columns]);

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

  const applyFilter = (field: keyof Product, value: string) => {
    if (value) {
      setFilters({ ...filters, [field]: value });
    } else {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
    }
  };

  const filteredProducts = products.filter(product => {
    // Search filter - check name, sku, description
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply column-specific filters
    const matchesFilters = Object.entries(filters).every(([field, filterValue]) => {
      if (!filterValue) return true;
      
      const fieldValue = product[field as keyof Product];
      
      // Handle special cases
      if (field === 'categories' && Array.isArray(product.categories)) {
        return product.categories.some(cat => 
          cat.name.toLowerCase().includes(filterValue.toLowerCase())
        );
      }
      
      if (fieldValue === undefined) return false;
      
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return String(fieldValue).toLowerCase().includes(filterValue.toLowerCase());
    });
    
    return matchesSearch && matchesFilters;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // Handle special cases for sorting
    if (sortField === 'categories' && a.categories && b.categories) {
      aValue = a.categories[0]?.name || '';
      bValue = b.categories[0]?.name || '';
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

  const renderCellContent = (product: Product, columnId: string) => {
    switch(columnId) {
      case 'image':
        return product.images && product.images[0]?.src ? (
          <img 
            src={product.images[0].src} 
            alt={product.images[0].alt || product.name} 
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        );
      
      case 'name':
        return (
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
              {product.short_description
                ? product.short_description.replace(/<[^>]*>/g, '').substring(0, 50) + 
                  (product.short_description.length > 50 ? '...' : '')
                : ''}
            </div>
          </div>
        );
      
      case 'brand':
        return product.brand || '—';
      
      case 'categories':
        return product.categories && product.categories.length > 0
          ? product.categories.map(cat => cat.name).join(', ')
          : '—';
      
      case 'type':
        return product.type 
          ? <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{product.type}</span>
          : '—';
      
      case 'identifiers':
        return (
          <div className="text-xs space-y-1">
            {product.gtin && <div><span className="font-medium">GTIN:</span> {product.gtin}</div>}
            {product.upc && <div><span className="font-medium">UPC:</span> {product.upc}</div>}
            {product.ean && <div><span className="font-medium">EAN:</span> {product.ean}</div>}
            {product.isbn && <div><span className="font-medium">ISBN:</span> {product.isbn}</div>}
            {!product.gtin && !product.upc && !product.ean && !product.isbn && '—'}
          </div>
        );
      
      case 'sku':
        return product.sku || '—';
      
      case 'regular_price':
        return product.regular_price ? `$${product.regular_price}` : '—';
      
      case 'sale_price':
        return product.on_sale && product.sale_price 
          ? <span className="font-medium text-green-600">${product.sale_price}</span>
          : '—';
      
      case 'stock_status':
        return product.stock_status === 'instock' ? (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" /> In Stock
          </span>
        ) : product.stock_status === 'outofstock' ? (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" /> Out of Stock
          </span>
        ) : (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            Backordered
          </span>
        );
      
      case 'actions':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteClick(product)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      
      default:
        const value = product[columnId as keyof Product];
        return value !== undefined ? String(value) : '—';
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-20 ml-2" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex py-4 border-b">
            <Skeleton className="h-12 w-12 rounded mr-4" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Filter Products</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div>
                  <label className="text-xs font-medium">Brand</label>
                  <Input 
                    placeholder="Filter by brand..." 
                    value={filters.brand || ''}
                    onChange={(e) => applyFilter('brand', e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Type</label>
                  <Input 
                    placeholder="Filter by type..." 
                    value={filters.type || ''}
                    onChange={(e) => applyFilter('type', e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Category</label>
                  <Input 
                    placeholder="Filter by category..." 
                    value={filters.categories || ''}
                    onChange={(e) => applyFilter('categories', e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Stock Status</label>
                  <Input 
                    placeholder="instock, outofstock..." 
                    value={filters.stock_status || ''}
                    onChange={(e) => applyFilter('stock_status', e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Price Range</label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      placeholder="Min" 
                      value={filters.min_price || ''}
                      onChange={(e) => applyFilter('min_price', e.target.value)}
                      className="h-8"
                    />
                    <Input 
                      placeholder="Max" 
                      value={filters.max_price || ''}
                      onChange={(e) => applyFilter('max_price', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-80">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  >
                    {column.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={resetColumnVisibility}
                >
                  Reset Columns
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            title="Refresh products"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm || Object.keys(filters).length > 0 ? 'No products match your filters' : 'No products found'}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns
                    .filter(column => column.visible)
                    .map((column) => (
                      <TableHead 
                        key={column.id}
                        className={`${column.width || ''} ${getColumnAlign(column)} ${column.sortable ? 'cursor-pointer' : ''}`}
                        onClick={() => column.sortable ? handleSort(column.id as keyof Product) : null}
                      >
                        {column.name} {column.sortable && renderSortIcon(column.id as keyof Product)}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    {columns
                      .filter(column => column.visible)
                      .map((column) => (
                        <TableCell 
                          key={`${product.id}-${column.id}`} 
                          className={getColumnAlign(column)}
                        >
                          {renderCellContent(product, column.id)}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsList;
