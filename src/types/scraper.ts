
export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductVariation {
  attributes: ProductAttribute[];
  price: string;
  sale_price?: string;
  stock_quantity?: number;
  sku?: string;
}

export interface ScrapedProduct {
  id?: string;
  title: string;
  regular_price: string;
  sale_price?: string;
  sku?: string;
  image_url?: string;
  gallery_urls?: string[];
  tags?: string[];
  categories?: string[];
  brand?: string;
  description?: string;
  short_description?: string;
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  source_url: string;
  selected?: boolean; // For UI selection
}

export interface ScraperConfig {
  selectors: {
    title: string;
    price: string;
    sale_price?: string;
    sku?: string;
    images?: string;
    description?: string;
    attributes?: string;
    categories?: string;
    tags?: string;
    brand?: string;
  };
  category_page?: {
    product_link: string;
    next_page?: string;
  };
}

export interface ScraperResult {
  products: ScrapedProduct[];
  errors?: string[];
  warnings?: string[];
}

export interface ImportMapping {
  source_field: string;
  target_field: string;
  transform?: (value: any) => any;
}

export interface ImportConfig {
  field_mapping: ImportMapping[];
  create_categories: boolean;
  create_tags: boolean;
  download_images: boolean;
  update_existing: boolean;
  batch_size: number;
}
