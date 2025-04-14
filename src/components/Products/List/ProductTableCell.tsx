
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Check, 
  X, 
  Edit, 
  Trash2,
  ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/product';
import { Column } from '../Types/ProductTypes';

interface ProductTableCellProps {
  product: Product;
  column: Column;
  selectedProducts: Record<string, boolean>;
  handleSelectProduct: (productId: string, checked: boolean) => void;
  onEdit: (product: Product) => void;
  handleDeleteClick: (product: Product) => void;
}

const ProductTableCell: React.FC<ProductTableCellProps> = ({
  product,
  column,
  selectedProducts,
  handleSelectProduct,
  onEdit,
  handleDeleteClick
}) => {
  const getColumnAlign = (column: Column) => {
    switch(column.align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  };

  const renderCellContent = () => {
    switch(column.id) {
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
        const value = product[column.id as keyof Product];
        return value !== undefined ? String(value) : '—';
    }
  };

  return (
    <TableCell className={getColumnAlign(column)}>
      {renderCellContent()}
    </TableCell>
  );
};

export default ProductTableCell;
