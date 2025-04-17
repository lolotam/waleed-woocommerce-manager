
import React from 'react';
import { ScrapedProduct } from '@/types/scraper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScrapedProductsTableProps {
  products: ScrapedProduct[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onToggleSelection: (id: string) => void;
}

const ScrapedProductsTable: React.FC<ScrapedProductsTableProps> = ({
  products,
  onSelectAll,
  onSelectNone,
  onToggleSelection
}) => {
  if (!products.length) {
    return <div className="text-center p-4 text-muted-foreground">No products scraped yet</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">
          {products.length} Products Found ({products.filter(p => p.selected).length} Selected)
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>Select All</Button>
          <Button variant="outline" size="sm" onClick={onSelectNone}>Deselect All</Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead className="w-[50px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="w-[100px]">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product.id || product.source_url} 
                className={product.selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              >
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={product.selected} 
                    onChange={() => onToggleSelection(product.id || '')}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell>
                  {product.image_url ? (
                    <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <X size={14} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>
                  {product.sale_price ? (
                    <div>
                      <span className="line-through text-muted-foreground mr-1">{product.regular_price}</span>
                      <span className="text-red-600">{product.sale_price}</span>
                    </div>
                  ) : (
                    product.regular_price
                  )}
                </TableCell>
                <TableCell>{product.brand || '-'}</TableCell>
                <TableCell>{product.sku || '-'}</TableCell>
                <TableCell>
                  <a 
                    href={product.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    View
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {products.some(p => p.categories?.length) && (
          <div>
            <span className="text-xs font-medium mr-1">Categories:</span>
            {Array.from(new Set(products.flatMap(p => p.categories || []))).map(category => (
              <Badge key={category} variant="outline" className="mr-1">{category}</Badge>
            ))}
          </div>
        )}
        
        {products.some(p => p.tags?.length) && (
          <div>
            <span className="text-xs font-medium mr-1">Tags:</span>
            {Array.from(new Set(products.flatMap(p => p.tags || []))).map(tag => (
              <Badge key={tag} variant="outline" className="mr-1">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapedProductsTable;
