
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

export type ScraperPlatform = 'woocommerce' | 'shopify' | 'amazon' | 'temu' | 'shein' | 'aliexpress' | 'unknown';
export type ScrapingMode = 'simple' | 'headless' | 'authenticated' | 'auto';

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
  platform?: ScraperPlatform;
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
  scraping_mode?: ScrapingMode;
  use_proxy?: boolean;
  proxy_config?: ProxyConfig;
  platform_specific?: PlatformSpecificConfig;
}

export interface ProxyConfig {
  type: 'custom' | 'service';
  url?: string;
  api_key?: string;
  country?: string;
  session_type?: 'rotating' | 'residential' | 'datacenter';
}

export interface PlatformSpecificConfig {
  platform: ScraperPlatform;
  settings: {
    user_agent?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    wait_for_selector?: string;
    click_selectors?: string[];
    scroll_behavior?: 'none' | 'bottom' | 'infinite';
    bypass_protection?: boolean;
  };
}

export interface ScraperResult {
  products: ScrapedProduct[];
  errors?: string[];
  warnings?: string[];
  platform_detected?: ScraperPlatform;
  scrape_stats?: {
    duration_ms: number;
    pages_processed: number;
    products_found: number;
    success_rate: number;
  };
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

export interface ScraperTemplate {
  id: string;
  name: string;
  platform: ScraperPlatform;
  config: ScraperConfig;
  description: string;
}
