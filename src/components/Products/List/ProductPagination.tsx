
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
  isLoading
}) => {
  const getPaginationRange = () => {
    const range: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      
      if (currentPage <= 3) {
        range.push(2, 3, 4);
        range.push('ellipsis');
      } else if (currentPage >= totalPages - 2) {
        range.push('ellipsis');
        range.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        range.push('ellipsis');
        range.push(currentPage - 1, currentPage, currentPage + 1);
        range.push('ellipsis');
      }
      
      range.push(totalPages);
    }
    
    return range;
  };

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {currentPage === 1 || isLoading ? (
            <span className="pointer-events-none opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium gap-1 pl-2.5 h-10 px-4 py-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </span>
          ) : (
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            />
          )}
        </PaginationItem>
        
        {getPaginationRange().map((page, index) => (
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                onClick={() => setCurrentPage(page as number)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        ))}
        
        <PaginationItem>
          {currentPage === totalPages || isLoading ? (
            <span className="pointer-events-none opacity-50 inline-flex items-center justify-center rounded-md text-sm font-medium gap-1 pr-2.5 h-10 px-4 py-2">
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : (
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProductPagination;
