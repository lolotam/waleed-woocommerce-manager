
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ProductLoadingState: React.FC = () => {
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
};

export default ProductLoadingState;
