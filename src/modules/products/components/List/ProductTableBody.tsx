
import React from 'react';
import { 
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Product } from '@/types/product';
import { Column } from '../Types/ProductTypes';
import ProductTableCell from './ProductTableCell';

interface ProductTableBodyProps {
  products: Product[];
  visibleColumns: Column[];
  selectedProducts: Record<string, boolean>;
  handleSelectProduct: (productId: string, checked: boolean) => void;
  onEdit: (product: Product) => void;
  handleDeleteClick: (product: Product) => void;
}

const ProductTableBody: React.FC<ProductTableBodyProps> = ({
  products,
  visibleColumns,
  selectedProducts,
  handleSelectProduct,
  onEdit,
  handleDeleteClick
}) => {
  return (
    <TableBody>
      {products.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={visibleColumns.length}
            className="h-24 text-center"
          >
            No products found.
          </TableCell>
        </TableRow>
      ) : (
        products.map((product) => (
          <TableRow key={product.id}>
            {visibleColumns.map((column) => (
              <ProductTableCell
                key={`${product.id}-${column.id}`}
                product={product}
                column={column}
                selectedProducts={selectedProducts}
                handleSelectProduct={handleSelectProduct}
                onEdit={onEdit}
                handleDeleteClick={handleDeleteClick}
              />
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  );
};

export default ProductTableBody;
