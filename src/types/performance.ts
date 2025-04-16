
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
  connection: 'fast' | 'average' | 'slow' | '3g' | '4g' | '2g';
  location: string;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge';
  blockAds?: boolean;
  auth?: {
    username: string;
    password: string;
  };
  api?: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: string;
    body: string;
  };
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

// Crawler types
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

// Extended metrics for Core Web Vitals
export interface CoreWebVitals {
  lcp: number;  // Largest Contentful Paint (ms)
  fid: number;  // First Input Delay (ms)
  cls: number;  // Cumulative Layout Shift (unitless)
  ttfb: number; // Time to First Byte (ms)
  tbt: number;  // Total Blocking Time (ms)
}

// Queue system types
export type TestStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface QueuedTestResponse {
  testId: string;
  status: TestStatus;
  position: number;
  estimatedTime: number; // in seconds
  result?: PerformanceTestResult;
  queuedAt?: string;
  config?: PerformanceTestConfig;
}

export interface QueueStatusResponse {
  queueLength: number;
  estimatedWaitTime: number; // in seconds
  activeTests: number;
}
