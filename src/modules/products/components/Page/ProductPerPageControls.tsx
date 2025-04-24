
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ProductPerPageControlsProps {
  perPage: number;
  setPerPage: (count: number) => void;
  maxPerPage: number;
}

const ProductPerPageControls: React.FC<ProductPerPageControlsProps> = ({
  perPage,
  setPerPage,
  maxPerPage
}) => {
  const [customPerPage, setCustomPerPage] = useState('');

  const handlePerPageChange = (value: number[]) => {
    setPerPage(Math.min(value[0], maxPerPage));
  };

  const handleCustomPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPerPage(e.target.value);
  };

  const applyCustomPerPage = () => {
    const value = parseInt(customPerPage);
    if (!isNaN(value) && value > 0) {
      setPerPage(Math.min(value, maxPerPage));
      toast.success(`Showing ${Math.min(value, maxPerPage)} products per page`);
    } else {
      toast.error('Please enter a valid number greater than 0');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyCustomPerPage();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Products per page</h3>
      <div className="flex items-center space-x-2">
        <span className="text-sm">1</span>
        <Slider
          className="flex-1 mx-2"
          defaultValue={[perPage]}
          max={maxPerPage}
          min={1}
          step={100}
          value={[perPage]}
          onValueChange={handlePerPageChange}
        />
        <span className="text-sm">{maxPerPage}</span>
        <span className="ml-4 px-2 py-1 bg-primary/10 rounded text-sm font-medium">
          {perPage}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Note: Set between 1-{maxPerPage} products per page
      </p>
      
      <div className="flex items-center space-x-2 mt-2">
        <Input
          type="number"
          placeholder="Custom count"
          className="w-32"
          value={customPerPage}
          onChange={handleCustomPerPageChange}
          onKeyDown={handleKeyDown}
          min={1}
          max={maxPerPage}
        />
        <Button variant="outline" size="sm" onClick={applyCustomPerPage}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default ProductPerPageControls;
