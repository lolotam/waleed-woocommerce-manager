
/**
 * WooCommerce API utilities
 * Combines all API modules into a single export
 */
import { testConnection } from "./woocommerceCore";
import brandsApi from "./brandsApi";
import categoriesApi from "../../modules/categories/utils/categoriesApi";
import productsApi from "./productsApi";
import mediaApi from "./mediaApi";
import { extractData } from "./woocommerceCore";

export {
  brandsApi,
  categoriesApi,
  mediaApi,
  productsApi,
  extractData,
  testConnection,
};

export default {
  brands: brandsApi,
  categories: categoriesApi,
  extractData: extractData,
  products: productsApi,
  media: mediaApi,
  testConnection,
};
