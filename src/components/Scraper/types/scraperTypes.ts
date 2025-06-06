
export type ScrapingMode = 'auto' | 'simple' | 'headless' | 'authenticated';
export type ScrollBehavior = 'none' | 'bottom' | 'infinite';
export type PageType = 'product' | 'category' | 'auto-detect';

export interface ProxyConfig {
  enabled: boolean;
  type: 'custom' | 'service';
  url?: string;
  apiKey?: string;
  country?: string;
  sessionType?: 'rotating' | 'residential' | 'datacenter';
}

export interface ScrapingOptions {
  mode: ScrapingMode;
  useProxy: boolean;
  proxyConfig?: ProxyConfig;
  maxProducts?: number;
  isCategory: boolean;
  pageType: PageType;
  scrapeAll: boolean;
  customSelectors?: Record<string, string>;
  bypassProtection: boolean;
  enableCache: boolean;
  scrollBehavior?: ScrollBehavior;
  emulateUser?: boolean;
  maxRetries?: number;
  requestDelay: number;
  randomizeDelay?: boolean;
  concurrentRequests: number;
  waitForSelector?: string;
}
