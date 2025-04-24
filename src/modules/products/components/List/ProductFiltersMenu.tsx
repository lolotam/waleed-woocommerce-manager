
import React from 'react';
import { Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent, DateRange } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ProductTag } from '@/types/product';

interface ProductFiltersMenuProps {
  filters: Record<string, any>;
  dateRange: DateRange | undefined;
  applyFilter: (field: string, value: string | DateRange | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  tags: ProductTag[];
}

const ProductFiltersMenu: React.FC<ProductFiltersMenuProps> = ({ 
  filters, 
  dateRange,
  applyFilter, 
  clearFilters,
  hasActiveFilters,
  tags
}) => {
  return (
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
                  <SelectItem value="any">Any type</SelectItem>
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
                    <SelectItem value="any">Any tag</SelectItem>
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
                  <SelectItem value="any">Any status</SelectItem>
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
                    <CalendarComponent
                      selected={dateRange}
                      onSelect={(range) => {
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
  );
};

export default ProductFiltersMenu;
