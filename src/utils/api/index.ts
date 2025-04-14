
/**
 * WooCommerce API utilities
 * Combines all API modules into a single export
 */
import { testConnection } from "./woocommerceCore";
import productsApi from "./productsApi";
import categoriesApi from "./categoriesApi";
import brandsApi from "./brandsApi";
import mediaApi from "./mediaApi";

export {
  productsApi,
  categoriesApi,
  brandsApi,
  mediaApi,
  testConnection
};

export default {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  media: mediaApi,
  testConnection,
};
