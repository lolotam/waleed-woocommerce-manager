
import React, { useState, useEffect, useCallback } from 'react';
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
  ImageIcon,
  SlidersHorizontal,
  Filter,
  GripVertical,
  Save,
  ArrowLeftRight,
  Pencil,
  Calendar,
  Tag,
  Bookmark
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
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { productsApi } from '@/utils/api';
import { toast } from 'sonner';
import { DateRange } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProductTag } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkEditForm } from '@/components/Products/BulkEditForm';
import { Switch } from '@/components/ui/switch';

interface Column {
  id: keyof Product | 'image' | 'actions' | 'identifiers' | 'selection';
  name: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  order: number;
}

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
  tags?: ProductTag[];
}

// Define a custom filter interface to handle filter values that don't directly map to Product fields
interface ProductFilters {
  [key: string]: string | DateRange | undefined;
}

const ProductsList: React.FC<ProductsListProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onRefresh,
  tags = []
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
  
  // Initialize columns with order property
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
        // Swap order values
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
    } else {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
    }
  };
  
  const clearFilters = () => {
    setFilters({});
    setDateRange(undefined);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const filteredProducts = products.filter(product => {
    // Search filter - check name, sku, description, brand, permalink
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.permalink && product.permalink.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply column-specific filters
    const matchesFilters = Object.entries(filters).every(([field, filterValue]) => {
      if (!filterValue) return true;

      // Handle date range filter
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

      // Handle price range filters separately
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
      
      // Handle tag filter
      if (field === 'tag_id' && product.tags) {
        return product.tags.some(tag => tag.id === parseInt(filterValue as string));
      }
      
      // Check if the field exists on the product
      if (field in product) {
        const fieldValue = product[field as keyof Product];
        
        // Handle special cases
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
      
      return true; // Skip filtering for fields that don't exist on the product
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
      // Entering bulk edit mode
      toast.info("Bulk edit mode enabled. Select products to edit.");
    } else {
      // Exiting bulk edit mode
      setSelectedProducts({});
    }
  };
  
  const selectedProductCount = Object.values(selectedProducts).filter(Boolean).length;
  
  const handleBulkEditComplete = () => {
    setBulkEditMode(false);
    setSelectedProducts({});
    onRefresh();
    toast.success("Bulk edit completed successfully");
  };
  
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

  const renderCellContent = (product: Product, columnId: string) => {
    switch(columnId) {
      case 'selection':
        return product.id ? (
          <Checkbox
            checked={!!selectedProducts[product.id.toString()]}
            onCheckedChange={(checked) => {
              if (product.id) {
                handleSelectProduct(product.id.toString(), !!checked);
              }
            }}
          />
        ) : null;
        
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
          
      case 'tags':
        return product.tags && product.tags.length > 0
          ? (
            <div className="flex flex-wrap gap-1">
              {product.tags.map(tag => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )
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
        
      case 'permalink':
        return product.permalink ? (
          <div className="truncate max-w-[200px]">
            <a 
              href={product.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {product.permalink}
            </a>
          </div>
        ) : '—';
      
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
  
  // Sort columns by order for display
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  
  // Only show visible columns
  const visibleColumns = sortedColumns.filter(column => column.visible);

  if (bulkEditMode && selectedProductCount > 0) {
    return (
      <BulkEditForm 
        productIds={getSelectedProductIds()}
        products={getSelectedProductsData()}
        onComplete={handleBulkEditComplete}
        onCancel={() => setBulkEditMode(false)}
      />
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
        
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{Object.keys(filters).length} active filters</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleAdvancedSearch}
            className={advancedSearchMode ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            {advancedSearchMode ? "Simple Search" : "Advanced Search"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters {hasActiveFilters ? `(${Object.keys(filters).length})` : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Filter Products</DropdownMenuLabel>
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium">Brand</label>
                    <Input 
                      placeholder="Filter by brand..." 
                      value={filters.brand as string || ''}
                      onChange={(e) => applyFilter('brand', e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Type</label>
                    <Select 
                      value={filters.type as string || ''}
                      onValueChange={(value) => applyFilter('type', value || undefined)}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any type</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                        <SelectItem value="grouped">Grouped</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Category</label>
                    <Input 
                      placeholder="Filter by category..." 
                      value={filters.categories as string || ''}
                      onChange={(e) => applyFilter('categories', e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Tags</label>
                    {tags.length > 0 ? (
                      <Select
                        value={filters.tag_id as string || ''}
                        onValueChange={(value) => applyFilter('tag_id', value || undefined)}
                      >
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any tag</SelectItem>
                          {tags.map(tag => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        placeholder="Filter by tags..." 
                        value={filters.tags as string || ''}
                        onChange={(e) => applyFilter('tags', e.target.value)}
                        className="h-8 mt-1"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Stock Status</label>
                    <Select
                      value={filters.stock_status as string || ''}
                      onValueChange={(value) => applyFilter('stock_status', value || undefined)}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        <SelectItem value="instock">In Stock</SelectItem>
                        <SelectItem value="outofstock">Out of Stock</SelectItem>
                        <SelectItem value="onbackorder">On Backorder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Price Range</label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Min" 
                        value={filters.min_price as string || ''}
                        onChange={(e) => applyFilter('min_price', e.target.value)}
                        className="h-8"
                      />
                      <Input 
                        placeholder="Max" 
                        value={filters.max_price as string || ''}
                        onChange={(e) => applyFilter('max_price', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Date Created</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left font-normal mt-1 h-8"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <div className="p-3">
                          <DateRange
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range);
                              applyFilter('date_created', range);
                            }}
                            numberOfMonths={2}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              </ScrollArea>
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
                {columns
                  .filter(column => column.id !== 'selection') // Don't allow toggling selection column
                  .map((column) => (
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
              <div className="p-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="horizontal-scroll"
                    checked={enableHorizontalScroll}
                    onCheckedChange={setEnableHorizontalScroll}
                  />
                  <Label htmlFor="horizontal-scroll">Enable horizontal scroll</Label>
                </div>
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
      </div>
      
      {advancedSearchMode && (
        <div className="mb-4 p-4 bg-muted/30 rounded-md border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name-search">Product Name</Label>
              <Input 
                id="name-search"
                placeholder="Search by name..." 
                value={filters.name as string || ''}
                onChange={(e) => applyFilter('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sku-search">SKU</Label>
              <Input 
                id="sku-search"
                placeholder="Search by SKU..." 
                value={filters.sku as string || ''}
                onChange={(e) => applyFilter('sku', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="brand-search">Brand</Label>
              <Input 
                id="brand-search"
                placeholder="Search by brand..." 
                value={filters.brand as string || ''}
                onChange={(e) => applyFilter('brand', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category-search">Category</Label>
              <Input 
                id="category-search"
                placeholder="Search by category..." 
                value={filters.categories as string || ''}
                onChange={(e) => applyFilter('categories', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tag-search">Tags</Label>
              <Input 
                id="tag-search"
                placeholder="Search by tags..." 
                value={filters.tags as string || ''}
                onChange={(e) => applyFilter('tags', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="permalink-search">Permalink</Label>
              <Input 
                id="permalink-search"
                placeholder="Search by permalink..." 
                value={filters.permalink as string || ''}
                onChange={(e) => applyFilter('permalink', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          {searchTerm || hasActiveFilters ? 'No products match your search or filters' : 'No products found'}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className={enableHorizontalScroll ? "overflow-x-auto" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead 
                      key={column.id}
                      className={`${column.width || ''} ${getColumnAlign(column)} ${column.sortable ? 'cursor-pointer select-none' : ''} relative`}
                      onClick={() => column.sortable ? handleSort(column.id as keyof Product) : null}
                      onDragOver={() => handleColumnDragOver(column.id)}
                    >
                      {column.id === 'selection' ? (
                        <Checkbox
                          checked={Object.keys(selectedProducts).length > 0 && 
                                  Object.keys(selectedProducts).length === filteredProducts.length}
                          onCheckedChange={handleSelectAllProducts}
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          {column.id !== 'image' && column.id !== 'actions' && (
                            <span
                              className="cursor-move mr-1 text-muted-foreground hover:text-foreground"
                              draggable
                              onDragStart={() => handleColumnDragStart(column.id)}
                              onDragEnd={handleColumnDragEnd}
                            >
                              <GripVertical className="h-3 w-3" />
                            </span>
                          )}
                          <span>{column.name}</span>
                          {column.sortable && renderSortIcon(column.id as keyof Product)}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    {visibleColumns.map((column) => (
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
