
/**
 * WooCommerce API utilities
 * Combines all API modules into a single export
 */
import { testConnection } from "./woocommerceCore";
import productsApi, { extractData, extractDataWithPagination } from "./productsApi";
import categoriesApi from "./categoriesApi";
import brandsApi from "./brandsApi";
import mediaApi from "./mediaApi";

export {
  productsApi,
  categoriesApi,
  brandsApi,
  mediaApi,
  testConnection,
  extractData,
  extractDataWithPagination
};

export default {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  media: mediaApi,
  testConnection,
};
