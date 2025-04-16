
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
import { toast } from "sonner";

export function usePerformanceTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<PerformanceTestResult | null>(null);
  const [crawlerResult, setCrawlerResult] = useState<CrawlerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function to normalize URL
  const normalizeUrl = (url: string): string | null => {
    if (!url || url.trim() === '') return null;
    
    let normalizedUrl = url.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Validate URL format
    try {
      return new URL(normalizedUrl).toString();
    } catch (err) {
      return null;
    }
  };

  const runTest = async (config: PerformanceTestConfig) => {
    setIsLoading(true);
    setError(null);
    
    // Normalize and validate URL
    const normalizedUrl = normalizeUrl(config.url);
    if (!normalizedUrl) {
      toast.error("Please enter a valid URL");
      setIsLoading(false);
      setError("Invalid URL format");
      return null;
    }
    
    // Update config with normalized URL
    config.url = normalizedUrl;
    
    try {
      // Call the crawler service
      const result = await runPerformanceTest(config);
      setCrawlerResult(result);
      
      // Transform crawler result to our app's test result format
      const transformedResult = transformCrawlerResult(result, config);
      setTestResult(transformedResult);
      
      // Show success notification
      toast.success("Performance test completed successfully");
      
      return transformedResult;
    } catch (err) {
      console.error("Performance test failed:", err);
      setError(err instanceof Error ? err.message : "Test failed for unknown reason");
      
      // Show error notification
      toast.error("Performance test failed: " + (err instanceof Error ? err.message : "Unknown error"));
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to transform crawler result to app format (exported for testing)
  const transformCrawlerResult = (
    crawlerResult: CrawlerResult, 
    config: PerformanceTestConfig
  ): PerformanceTestResult => {
    // Generate resource timings from crawler data
    const resources = crawlerResult.requests.map((req, index) => {
      const response = crawlerResult.responses[index] || { size: 0 };
      let pathname = "";
      
      try {
        pathname = new URL(req.url).pathname;
      } catch (e) {
        // If URL parsing fails, use the original URL or a fallback
        pathname = req.url.split('?')[0] || '/unknown';
      }
      
      return {
        name: pathname,
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
        totalPageSize: crawlerResult.metrics.totalSize, // Keep in bytes for calculations
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
  };

  return {
    runTest,
    isLoading,
    testResult,
    crawlerResult,
    error,
    transformCrawlerResult, // Exported for testing
  };
}

export default usePerformanceTest;
