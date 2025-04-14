
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ListFilter } from 'lucide-react';

interface LoadAllControlProps {
  isLoadingAll: boolean;
  loadAllProgress: number;
  handleLoadAll: () => void;
  handleCancelLoadAll: () => void;
  allProductsCount: number;
}

const LoadAllControl: React.FC<LoadAllControlProps> = ({
  isLoadingAll,
  loadAllProgress,
  handleLoadAll,
  handleCancelLoadAll,
  allProductsCount
}) => {
  if (isLoadingAll) {
    return (
      <div className="flex items-center space-x-2 ml-2">
        <div className="w-64 h-6 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${loadAllProgress}%` }}
          />
        </div>
        <span className="text-sm font-medium">{loadAllProgress}%</span>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleCancelLoadAll}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleLoadAll} 
      disabled={isLoadingAll}
      className="ml-auto"
    >
      {isLoadingAll ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading All...
        </>
      ) : (
        <>
          <ListFilter className="h-4 w-4 mr-2" />
          Load All Products {allProductsCount > 0 ? `(${allProductsCount})` : ''}
        </>
      )}
    </Button>
  );
};

export default LoadAllControl;
