
export interface PerformanceMetrics {
  pageLoadTime: number;
  totalPageSize: number;
  numberOfRequests: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
}

export interface PerformanceScore {
  overall: number;
  speed: number;
  optimization: number;
  accessibility: number;
}

export interface ResourceTiming {
  name: string;
  initiatorType: string;
  startTime: number;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
}

export interface PerformanceTestConfig {
  url: string;
  device: 'desktop' | 'mobile' | 'tablet';
  connection: 'fast' | 'average' | 'slow' | '3g' | '4g';
  location: string;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
}

export interface PerformanceTestResult {
  id: string;
  url: string;
  testDate: string;
  metrics: PerformanceMetrics;
  scores: PerformanceScore;
  resources: ResourceTiming[];
  config: PerformanceTestConfig;
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'speed' | 'optimization' | 'accessibility' | 'best-practices';
}

export interface TestHistoryItem {
  id: string;
  url: string;
  testDate: string;
  overallScore: number;
}

// New types for crawler functionality
export interface CrawlerRequest {
  url: string;
  resourceType: string;
  method: string;
  time: number;
}

export interface CrawlerResponse {
  url: string;
  status: number;
  contentType: string;
  size: number;
  time: number;
}

export interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
}

export interface CrawlerMetrics {
  loadTime: number;
  resourceCount: number;
  totalSize: number;
  ttfb: number;
  domComplete: number;
}

export interface CrawlerResult {
  url: string;
  deviceType: string;
  timestamp: string;
  metrics: CrawlerMetrics;
  lighthouse: LighthouseMetrics;
  requests: CrawlerRequest[];
  responses: CrawlerResponse[];
}
