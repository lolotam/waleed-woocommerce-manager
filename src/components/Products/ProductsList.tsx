
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, a
  TableRow 
} from '@/components/ui/table';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { productsApi } from '@/utils/woocommerceApi';
import { toast } from 'sonner';

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

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Handle null or undefined values
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
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
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Refresh products"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No products match your search' : 'No products found'}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSort('name')}
                >
                  Product {renderSortIcon('name')}
                </TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer" 
                  onClick={() => handleSort('sku')}
                >
                  SKU {renderSortIcon('sku')}
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer text-right" 
                  onClick={() => handleSort('price')}
                >
                  Price {renderSortIcon('price')}
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer text-center" 
                  onClick={() => handleSort('stock_status')}
                >
                  Stock {renderSortIcon('stock_status')}
                </TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images[0]?.src ? (
                      <img 
                        src={product.images[0].src} 
                        alt={product.images[0].alt || product.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {product.short_description
                        .replace(/<[^>]*>/g, '')
                        .substring(0, 50)}
                      {product.short_description.length > 50 ? '...' : ''}
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">
                    {product.on_sale && product.sale_price 
                      ? <div>
                          <span className="line-through text-muted-foreground mr-1">
                            ${product.regular_price}
                          </span>
                          <span className="font-medium text-green-600">${product.sale_price}</span>
                        </div>
                      : <span>${product.regular_price || product.price}</span>
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {product.stock_status === 'instock' ? (
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
                    )}
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
