
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Column } from '../Types/ProductTypes';

interface ProductColumnsMenuProps {
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  resetColumnVisibility: () => void;
  enableHorizontalScroll: boolean;
  setEnableHorizontalScroll: (value: boolean) => void;
}

const ProductColumnsMenu: React.FC<ProductColumnsMenuProps> = ({ 
  columns, 
  toggleColumnVisibility, 
  resetColumnVisibility,
  enableHorizontalScroll,
  setEnableHorizontalScroll
}) => {
  return (
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
            .filter(column => column.id !== 'selection')
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
  );
};

export default ProductColumnsMenu;
