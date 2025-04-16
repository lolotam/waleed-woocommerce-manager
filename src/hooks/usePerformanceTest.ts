import { useState } from "react";
import { 
  PerformanceTestConfig, 
  CrawlerResult, 
  PerformanceTestResult, 
  PerformanceRecommendation 
} from "@/types/performance";
import { runPerformanceTest } from "@/services/performanceCrawlerService";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

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
  const resources = crawlerResult.requests.map((req) => {
    const response = crawlerResult.responses.find(res => res.url === req.url) || { size: 0, time: req.time };
    
    // Safely extract pathname from URL
    let pathname = "";
    try {
      // Make sure the URL is valid
      if (req.url && req.url !== "about:blank") {
        const url = new URL(req.url);
        pathname = url.pathname;
      }
    } catch (e) {
      // If URL parsing fails, use a fallback
      pathname = req.url ? req.url.split("/").pop() || req.url : `resource-${Math.random().toString(36).substring(7)}`;
    }
    
    return {
      name: pathname,
      initiatorType: req.resourceType,
      startTime: req.time,
      duration: (response.time || req.time) - req.time,
      transferSize: response.size || 0,
      decodedBodySize: response.size || 0
    };
  });

  // Calculate overall scores from lighthouse scores
  const lighthouse = crawlerResult.lighthouse;
  const overall = Math.round((lighthouse.performance + lighthouse.accessibility + 
    lighthouse['best-practices'] + lighthouse.seo) / 4);

  // Generate recommendations based on the metrics
  const recommendations = generateRecommendations(crawlerResult);

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
      cumulativeLayoutShift: Math.random() * 0.2 // random CLS for mock data
    },
    scores: {
      overall,
      speed: lighthouse.performance,
      optimization: lighthouse['best-practices'],
      accessibility: lighthouse.accessibility
    },
    resources,
    config,
    recommendations
  };
}

// Generate recommendations based on crawler results
function generateRecommendations(crawlerResult: CrawlerResult): PerformanceRecommendation[] {
  const recommendations: PerformanceRecommendation[] = [];
  
  // Check load time
  if (crawlerResult.metrics.loadTime > 3000) {
    recommendations.push({
      id: uuidv4(),
      title: "Optimize Page Load Time",
      description: "Your page load time exceeds 3 seconds, which can lead to high bounce rates.",
      impact: "high",
      category: "speed"
    });
  }
  
  // Check resource count
  if (crawlerResult.metrics.resourceCount > 20) {
    recommendations.push({
      id: uuidv4(),
      title: "Reduce HTTP Requests",
      description: `Your page makes ${crawlerResult.metrics.resourceCount} HTTP requests. Consider bundling resources to reduce this number.`,
      impact: "medium",
      category: "optimization"
    });
  }
  
  // Check total size
  if (crawlerResult.metrics.totalSize > 1024 * 1024 * 3) { // 3MB
    recommendations.push({
      id: uuidv4(),
      title: "Reduce Page Weight",
      description: `Your page total size is ${Math.round(crawlerResult.metrics.totalSize / (1024 * 1024))}MB. Consider optimizing images and minifying resources.`,
      impact: "high",
      category: "optimization"
    });
  }
  
  // Check for large images
  const largeImages = crawlerResult.responses.filter(
    res => res.contentType?.includes('image') && res.size > 200000
  );
  
  if (largeImages.length > 0) {
    recommendations.push({
      id: uuidv4(),
      title: "Optimize Images",
      description: `You have ${largeImages.length} images larger than 200KB. Consider resizing and compressing them.`,
      impact: "medium",
      category: "optimization"
    });
  }
  
  // Add some accessibility recommendations
  if (crawlerResult.lighthouse.accessibility < 90) {
    recommendations.push({
      id: uuidv4(),
      title: "Improve Accessibility",
      description: "Your accessibility score is below 90. Ensure proper contrast ratios and semantic HTML.",
      impact: "medium",
      category: "accessibility"
    });
  }
  
  return recommendations;
}

export default usePerformanceTest;
