
import { useState } from "react";
import { 
  PerformanceTestConfig, 
  CrawlerResult, 
  PerformanceTestResult, 
  CrawlerResponse
} from "@/types/performance";
import { runPerformanceTest } from "@/services/performanceCrawlerService";
import metricsEngine from "@/services/metricsEngineService";
import { v4 as uuidv4 } from "uuid";

export function usePerformanceTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<PerformanceTestResult | null>(null);
  const [crawlerResult, setCrawlerResult] = useState<CrawlerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (config: PerformanceTestConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the crawler service
      const result = await runPerformanceTest(config);
      setCrawlerResult(result);
      
      // Transform crawler result to our app's test result format
      const transformedResult = transformCrawlerResult(result, config);
      setTestResult(transformedResult);
      
      return transformedResult;
    } catch (err) {
      console.error("Performance test failed:", err);
      setError(err instanceof Error ? err.message : "Test failed for unknown reason");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    runTest,
    isLoading,
    testResult,
    crawlerResult,
    error
  };
}

// Helper function to transform crawler result to app format
function transformCrawlerResult(
  crawlerResult: CrawlerResult, 
  config: PerformanceTestConfig
): PerformanceTestResult {
  // Generate resource timings from crawler data
  const resources = crawlerResult.requests.map((req, index) => {
    const response = crawlerResult.responses[index] || { size: 0 };
    
    return {
      name: new URL(req.url).pathname,
      initiatorType: req.resourceType,
      startTime: req.time,
      duration: ((response as CrawlerResponse).time || req.time) - req.time,
      transferSize: response.size || 0,
      decodedBodySize: response.size || 0
    };
  });

  // Calculate performance metrics
  const metricsData = {
    lcp: (crawlerResult.metrics.ttfb + 500), // Estimate LCP
    fid: Math.random() * 100 + 50, // Mock FID
    cls: Math.random() * 0.2, // Mock CLS
    ttfb: crawlerResult.metrics.ttfb,
    tbt: Math.random() * 300 + 100, // Mock TBT
    loadTime: crawlerResult.metrics.loadTime,
    totalSize: crawlerResult.metrics.totalSize
  };

  // Calculate scores using the metrics engine
  const scores = metricsEngine.calculatePerformanceScore(metricsData);

  // Generate recommendations using the metrics engine
  const recommendations = metricsEngine.generateRecommendations(crawlerResult);

  return {
    id: uuidv4(),
    url: crawlerResult.url,
    testDate: crawlerResult.timestamp,
    metrics: {
      pageLoadTime: crawlerResult.metrics.loadTime / 1000, // convert to seconds
      totalPageSize: Math.round(crawlerResult.metrics.totalSize / (1024 * 1024) * 10) / 10, // convert to MB with 1 decimal
      numberOfRequests: crawlerResult.metrics.resourceCount,
      firstContentfulPaint: crawlerResult.metrics.ttfb / 1000 + 0.2, // estimate FCP
      largestContentfulPaint: (crawlerResult.metrics.ttfb + 500) / 1000, // estimate LCP
      timeToInteractive: crawlerResult.metrics.domComplete / 1000,
      cumulativeLayoutShift: metricsData.cls // use the same CLS value
    },
    scores,
    resources,
    config,
    recommendations
  };
}

export default usePerformanceTest;
