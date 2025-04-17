
import { ScraperConfig, ScraperPlatform } from "@/types/scraper";

export const platformConfigs: Record<ScraperPlatform, ScraperConfig> = {
  aliexpress: {
    selectors: {
      title: ".product-title-text",
      price: ".product-price-value",
      sale_price: ".product-price-sale",
      sku: '[data-spm="product_detail"] [data-pl="product-sku"]',
      images: '.images-view-item img',
      description: '.product-description',
      attributes: '.product-property-list',
      categories: '.breadcrumb-list a',
      brand: '.brand-info',
    },
    category_page: {
      product_link: '.list-item a[href*="/item/"]',
      next_page: '.next-pagination-item',
    },
    scraping_mode: 'headless',
    use_proxy: true,
    platform_specific: {
      platform: 'aliexpress',
      settings: {
        wait_for_selector: '.product-title-text',
        scroll_behavior: 'infinite',
        bypass_protection: true,
      }
    }
  },
  shein: {
    selectors: {
      title: '.product-intro__head-name',
      price: '.product-intro__head-price',
      sale_price: '.product-intro__head-price .from',
      sku: '.product-intro__head-sku',
      images: '.product-intro__gallerySlides img',
      description: '.product-intro__description',
      attributes: '.product-intro__attrs',
      categories: '.bread-crumb__item',
    },
    category_page: {
      product_link: '.S-product-item__link',
      next_page: '.pagination-next:not(.sui-disabled)',
    },
    scraping_mode: 'authenticated',
    use_proxy: true,
    platform_specific: {
      platform: 'shein',
      settings: {
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        bypass_protection: true,
        scroll_behavior: 'infinite',
      }
    }
  },
  temu: {
    selectors: {
      title: '.ProductDetailHead_name',
      price: '.ProductDetailHead_priceCurrent',
      sale_price: '.ProductDetailHead_priceOriginal',
      sku: '.ProductDetailProperties_sku',
      images: '.ProductDetailGallery_thumbnail img',
      description: '.ProductDetailProperties_content',
      attributes: '.ProductDetailProperties_properties',
    },
    category_page: {
      product_link: '.GridItem_link',
      next_page: '.Pagination_next',
    },
    scraping_mode: 'authenticated',
    use_proxy: true,
    platform_specific: {
      platform: 'temu',
      settings: {
        bypass_protection: true,
        scroll_behavior: 'infinite',
      }
    }
  },
  woocommerce: {
    selectors: {
      title: '.product_title',
      price: '.price .amount',
      sale_price: '.price ins .amount',
      sku: '.sku',
      images: '.woocommerce-product-gallery__image img',
      description: '.woocommerce-product-details__short-description',
      attributes: '.woocommerce-product-attributes',
      categories: '.posted_in a',
      tags: '.tagged_as a',
    },
    scraping_mode: 'simple',
    platform_specific: {
      platform: 'woocommerce',
      settings: {
        scroll_behavior: 'none',
      }
    }
  },
  shopify: {
    selectors: {
      title: '.product__title',
      price: '.price__regular .price-item',
      sale_price: '.price__sale .price-item--sale',
      sku: '[data-product-sku]',
      images: '.product__media img',
      description: '.product__description',
      categories: '.breadcrumbs__link',
    },
    scraping_mode: 'headless',
    platform_specific: {
      platform: 'shopify',
      settings: {
        wait_for_selector: '.product__title',
        scroll_behavior: 'none',
      }
    }
  },
  amazon: {
    selectors: {
      title: '#productTitle',
      price: '.a-price .a-offscreen',
      sale_price: '#priceblock_saleprice',
      sku: '#ASIN',
      images: '#imgBlkFront',
      description: '#productDescription',
      attributes: '#productDetails_feature_div',
      brand: '#bylineInfo',
    },
    scraping_mode: 'authenticated',
    use_proxy: true,
    platform_specific: {
      platform: 'amazon',
      settings: {
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        bypass_protection: true,
      }
    }
  },
  unknown: {
    selectors: {
      title: 'h1',
      price: '.price, [class*="price"]',
      images: 'img[src*="product"], .product img',
      description: '[class*="description"]',
    },
    scraping_mode: 'auto',
  }
};

export const detectPlatform = (url: string): ScraperPlatform => {
  if (url.includes('aliexpress.com')) return 'aliexpress';
  if (url.includes('shein.com')) return 'shein';
  if (url.includes('temu.com')) return 'temu';
  if (url.includes('amazon.com')) return 'amazon';
  if (url.includes('shopify.com') || url.includes('myshopify.com')) return 'shopify';
  if (url.includes('woocommerce') || url.includes('/wp-content/')) return 'woocommerce';
  return 'unknown';
};
