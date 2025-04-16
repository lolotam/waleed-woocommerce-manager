
import { CrawlerResult, PerformanceTestConfig } from "@/types/performance";

// Helper function to validate URL
function isValidUrl(url: string): boolean {
  try {
    // Try to construct a URL object
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to normalize URL (add protocol if missing)
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Run a performance test against the specified URL
 */
export async function runPerformanceTest(config: PerformanceTestConfig): Promise<CrawlerResult> {
  console.log("Running performance test with config:", config);
  
  // Validate and normalize URL
  let normalizedUrl = normalizeUrl(config.url);
  
  if (!isValidUrl(normalizedUrl)) {
    throw new Error(`Invalid URL: ${config.url}`);
  }
  
  // Update config with normalized URL
  const updatedConfig = {
    ...config,
    url: normalizedUrl
  };
  
  // In a real implementation, this would initiate a headless browser session
  // and collect real metrics. For now, we'll use a combination of real data
  // and simulated data for demonstration purposes.
  try {
    // Fetch the main page to check if it's accessible
    const startTime = performance.now();
    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      mode: 'no-cors',
    });
    const endTime = performance.now();
    
    // Calculate initial response time
    const responseTime = endTime - startTime;
    
    // Generate a synthetic crawler result based on the real response
    // combined with plausible simulated data
    return generateCrawlerResult(updatedConfig, responseTime);
  } catch (error) {
    console.error("Error crawling website:", error);
    // If the fetch fails, provide a fallback result indicating the site is unreachable
    return generateErrorCrawlerResult(updatedConfig);
  }
}

// Generate crawler result for a site that cannot be reached
function generateErrorCrawlerResult(config: PerformanceTestConfig): CrawlerResult {
  return {
    url: config.url,
    deviceType: config.device,
    timestamp: new Date().toISOString(),
    metrics: {
      loadTime: 0,
      resourceCount: 0,
      totalSize: 0,
      ttfb: 0,
      domComplete: 0
    },
    lighthouse: {
      performance: 0,
      accessibility: 0,
      'best-practices': 0,
      seo: 0
    },
    requests: [],
    responses: [],
    error: "Could not connect to the website. Please check the URL and try again."
  };
}

// Generate a crawler result with realistic data
function generateCrawlerResult(config: PerformanceTestConfig, initialResponseTime: number): CrawlerResult {
  // Performance multiplier based on connection type
  const performanceMultiplier = getPerformanceMultiplier(config.connection);
  
  // Estimate metrics based on device, connection, and initial response time
  const ttfb = Math.max(100, initialResponseTime * 0.8);
  const loadTime = Math.max(500, ttfb * 5 * performanceMultiplier);
  const resourceCount = 20 + Math.floor(Math.random() * 30);
  const totalSize = 500000 + Math.floor(Math.random() * 2000000); // 500KB to 2.5MB
  
  // Generate requests and responses
  const { requests, responses } = generateResourceData(
    config.url, 
    resourceCount, 
    ttfb, 
    performanceMultiplier
  );
  
  // Calculate lighthouse scores based on simulated metrics
  const performanceScore = calculatePerformanceScore(ttfb, loadTime, totalSize, config.connection);
  
  return {
    url: config.url,
    deviceType: config.device,
    timestamp: new Date().toISOString(),
    metrics: {
      loadTime: loadTime,
      resourceCount: resourceCount,
      totalSize: totalSize,
      ttfb: ttfb,
      domComplete: loadTime * 0.9
    },
    lighthouse: {
      performance: performanceScore,
      accessibility: 70 + Math.floor(Math.random() * 30),
      'best-practices': 75 + Math.floor(Math.random() * 25),
      seo: 80 + Math.floor(Math.random() * 20)
    },
    requests,
    responses
  };
}

// Calculate a realistic performance score
function calculatePerformanceScore(ttfb: number, loadTime: number, totalSize: number, connection: string): number {
  // Base score
  let score = 100;
  
  // Penalize for slow TTFB
  if (ttfb > 200) score -= Math.min(20, (ttfb - 200) / 50);
  
  // Penalize for slow load time
  if (loadTime > 3000) score -= Math.min(40, (loadTime - 3000) / 500);
  
  // Penalize for large page size
  if (totalSize > 1000000) score -= Math.min(30, (totalSize - 1000000) / 500000);
  
  // Adjust based on connection type expectations
  if (connection === 'slow' || connection === '3g') {
    score += 10; // Be more forgiving on slow connections
  }
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, Math.floor(score)));
}

// Generate realistic resource data
function generateResourceData(baseUrl: string, resourceCount: number, ttfb: number, performanceMultiplier: number) {
  const resourceTypes = ["document", "stylesheet", "script", "image", "font", "fetch", "xhr"];
  const requests: any[] = [];
  const responses: any[] = [];
  
  // Try to extract domain for resource URLs
  let domain = "";
  try {
    const url = new URL(baseUrl);
    domain = url.hostname;
  } catch (e) {
    domain = "example.com";
  }
  
  // Generate the main document request/response
  requests.push({
    url: baseUrl,
    resourceType: "document",
    method: "GET",
    time: 0
  });
  
  responses.push({
    url: baseUrl,
    status: 200,
    contentType: "text/html",
    size: 50000 + Math.floor(Math.random() * 100000),
    time: ttfb
  });
  
  // Generate realistic resource timings
  for (let i = 1; i < resourceCount; i++) {
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
    // Create realistic resource URLs
    let resourceUrl = "";
    try {
      if (Math.random() > 0.3) {
        // Same domain
        resourceUrl = `https://${domain}/${resourceType}s/${getResourceName(resourceType, i)}`;
      } else {
        // CDN domain
        resourceUrl = `https://cdn.${domain}/${resourceType}s/${getResourceName(resourceType, i)}`;
      }
    } catch (e) {
      resourceUrl = `https://cdn.example.com/${resourceType}s/${getResourceName(resourceType, i)}`;
    }
    
    // Calculate realistic timings
    const startTime = Math.floor(ttfb + (i * 50 * performanceMultiplier));
    const size = getTypicalResourceSize(resourceType);
    const duration = calculateDownloadTime(size, performanceMultiplier);
    
    requests.push({
      url: resourceUrl,
      resourceType,
      method: "GET",
      time: startTime
    });
    
    responses.push({
      url: resourceUrl,
      status: Math.random() > 0.95 ? 404 : 200, // Occasional 404s
      contentType: getContentType(resourceType),
      size: size,
      time: startTime + duration
    });
  }
  
  // Sort by time
  requests.sort((a, b) => a.time - b.time);
  responses.sort((a, b) => a.time - b.time);
  
  return { requests, responses };
}

// Get a resource name with appropriate extension
function getResourceName(resourceType: string, index: number): string {
  switch (resourceType) {
    case "document": return `page-${index}.html`;
    case "stylesheet": return `style-${index}.css`;
    case "script": return `script-${index}.js`;
    case "image": 
      const imgExt = ["jpg", "png", "webp"][Math.floor(Math.random() * 3)];
      return `image-${index}.${imgExt}`;
    case "font": 
      const fontExt = ["woff2", "ttf"][Math.floor(Math.random() * 2)];
      return `font-${index}.${fontExt}`;
    case "fetch":
    case "xhr": 
      return `data-${index}.json`;
    default: 
      return `resource-${index}`;
  }
}

// Get typical resource size based on type
function getTypicalResourceSize(resourceType: string): number {
  switch (resourceType) {
    case "document": return 30000 + Math.floor(Math.random() * 50000);
    case "stylesheet": return 10000 + Math.floor(Math.random() * 40000);
    case "script": return 50000 + Math.floor(Math.random() * 150000);
    case "image": return 40000 + Math.floor(Math.random() * 500000);
    case "font": return 20000 + Math.floor(Math.random() * 80000);
    case "fetch":
    case "xhr": return 2000 + Math.floor(Math.random() * 50000);
    default: return 5000 + Math.floor(Math.random() * 20000);
  }
}

// Calculate download time based on file size and connection
function calculateDownloadTime(fileSize: number, performanceMultiplier: number): number {
  // Base calculation: larger files take longer to download
  const baseTime = 50 + (fileSize / 5000);
  
  // Apply the performance multiplier for different connection types
  return Math.floor(baseTime * performanceMultiplier);
}

// Helper functions from the original implementation
function getContentType(resourceType: string): string {
  switch (resourceType) {
    case "document": return "text/html";
    case "stylesheet": return "text/css";
    case "script": return "application/javascript";
    case "image": return ["image/jpeg", "image/png", "image/webp"][Math.floor(Math.random() * 3)];
    case "font": return ["font/woff2", "font/ttf"][Math.floor(Math.random() * 2)];
    case "fetch": 
    case "xhr": return "application/json";
    default: return "application/octet-stream";
  }
}

function getPerformanceMultiplier(connection: string): number {
  switch (connection) {
    case "fast": return 0.8;
    case "average": return 1;
    case "slow": return 1.5;
    case "3g": return 2;
    case "4g": return 1.2;
    default: return 1;
  }
}
