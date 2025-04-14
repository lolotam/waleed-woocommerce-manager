
export interface ProductImage {
  id?: number;
  src: string;
  alt: string;
  name: string;
  title?: string;
  caption?: string;
  description?: string;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductSeoMeta {
  focus_keyword?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

export interface Product {
  id?: number;
  name: string;
  slug: string;
  permalink?: string;
  date_created?: string;
  status?: 'draft' | 'pending' | 'private' | 'publish';
  featured?: boolean;
  description: string;
  short_description: string;
  sku: string;
  price?: string;
  regular_price: string;
  sale_price: string;
  on_sale?: boolean;
  purchasable?: boolean;
  total_sales?: number;
  virtual?: boolean;
  downloadable?: boolean;
  manage_stock?: boolean;
  stock_quantity: number | null;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  backorders?: 'no' | 'notify' | 'yes';
  backorders_allowed?: boolean;
  backordered?: boolean;
  weight?: string;
  dimensions?: ProductDimensions;
  shipping_required?: boolean;
  shipping_taxable?: boolean;
  shipping_class?: string;
  shipping_class_id?: number;
  reviews_allowed?: boolean;
  average_rating?: string;
  rating_count?: number;
  related_ids?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  parent_id?: number;
  purchase_note?: string;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags?: ProductTag[];
  images: ProductImage[];
  attributes?: any[];
  default_attributes?: any[];
  variations?: any[];
  grouped_products?: number[];
  menu_order?: number;
  meta_data?: Array<{
    id: number;
    key: string;
    value: any;
  }>;
  type?: 'simple' | 'grouped' | 'external' | 'variable';
  gtin?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  brand?: string;
  rankmath_seo?: ProductSeoMeta;
  _links?: any;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  regular_price: string;
  sale_price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: ProductTag[];
  images: ProductImage[];
  type?: 'simple' | 'grouped' | 'external' | 'variable';
  gtin?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  brand?: string;
  rankmath_seo: ProductSeoMeta;
}

export const emptyProduct: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  sku: '',
  regular_price: '',
  sale_price: '',
  manage_stock: false,
  stock_quantity: null,
  stock_status: 'instock',
  categories: [],
  tags: [],
  images: [],
  type: 'simple',
  gtin: '',
  upc: '',
  ean: '',
  isbn: '',
  brand: '',
  rankmath_seo: {
    focus_keyword: '',
    meta_title: '',
    meta_description: ''
  }
};
