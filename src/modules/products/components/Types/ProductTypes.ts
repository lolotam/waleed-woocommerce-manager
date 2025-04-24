
import { Product } from '@/types/product';

export interface Column {
  id: keyof Product | 'image' | 'actions' | 'identifiers' | 'selection';
  name: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  order: number;
}

export interface ProductFilters {
  [key: string]: string | Record<string, any> | undefined;
}
