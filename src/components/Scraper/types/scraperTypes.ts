
export type ScrapingMode = 'auto' | 'simple' | 'headless' | 'authenticated';

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
  scrapeAll: boolean;
  customSelectors?: Record<string, string>;
  bypassProtection: boolean;
  enableCache: boolean;
}
