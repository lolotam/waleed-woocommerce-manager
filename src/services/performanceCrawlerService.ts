
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

// This would normally call an actual backend API
// For now we'll simulate the crawler with mock data
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
  
  // Mock implementation - would be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockCrawlerResult(updatedConfig));
    }, 2000); // Simulate network delay
  });
}

// Helper function to generate mock crawler data
function generateMockCrawlerResult(config: PerformanceTestConfig): CrawlerResult {
  const resourceTypes = ["document", "stylesheet", "script", "image", "font", "fetch", "xhr"];
  const requests: any[] = [];
  const responses: any[] = [];
  
  // Generate mock request/response data
  for (let i = 0; i < 30; i++) {
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
    // Create valid URLs for resources
    let resourceUrl;
    try {
      if (i === 0) {
        resourceUrl = config.url;
      } else {
        // Generate a valid subdomain URL
        const baseUrl = new URL(config.url);
        const domain = baseUrl.hostname;
        const protocol = baseUrl.protocol;
        
        if (Math.random() > 0.7) {
          // Use subdomain
          resourceUrl = `${protocol}//${getRandomSubdomain()}.${domain}/${resourceType}/${i}${getFileExtension(resourceType)}`;
        } else {
          // Use same domain
          resourceUrl = `${protocol}//${domain}/${resourceType}/${i}${getFileExtension(resourceType)}`;
        }
      }
    } catch (e) {
      // Fallback to a valid URL if there's an error
      resourceUrl = `https://example.com/${resourceType}/${i}${getFileExtension(resourceType)}`;
    }
    
    const size = Math.floor(Math.random() * 500000) + 1000; // 1KB to 500KB
    const time = i === 0 ? 0 : Math.floor(Math.random() * 1000) + 200; // 200ms to 1200ms
    
    requests.push({
      url: resourceUrl,
      resourceType,
      method: "GET",
      time
    });
    
    responses.push({
      url: resourceUrl,
      status: Math.random() > 0.9 ? 404 : 200, // Occasionally add 404s
      contentType: getContentType(resourceType),
      size,
      time: time + Math.floor(Math.random() * 300) // Response time is request time + processing time
    });
  }
  
  // Sort by time
  requests.sort((a, b) => a.time - b.time);
  responses.sort((a, b) => a.time - b.time);
  
  // Generate performance metrics based on the connection type
  const performanceMultiplier = getPerformanceMultiplier(config.connection);
  
  return {
    url: config.url,
    deviceType: config.device,
    timestamp: new Date().toISOString(),
    metrics: {
      loadTime: Math.floor(2000 * performanceMultiplier),
      resourceCount: requests.length,
      totalSize: responses.reduce((sum, res) => sum + res.size, 0),
      ttfb: Math.floor(200 * performanceMultiplier),
      domComplete: Math.floor(1500 * performanceMultiplier)
    },
    lighthouse: {
      performance: Math.min(100, Math.floor(100 / performanceMultiplier)),
      accessibility: Math.floor(Math.random() * 20) + 80,
      'best-practices': Math.floor(Math.random() * 15) + 85,
      seo: Math.floor(Math.random() * 10) + 90
    },
    requests,
    responses
  };
}

// Helper functions for mock data generation
function getRandomSubdomain(): string {
  const subdomains = ["cdn", "assets", "api", "static", "img", "media", "fonts"];
  return subdomains[Math.floor(Math.random() * subdomains.length)];
}

function getFileExtension(resourceType: string): string {
  switch (resourceType) {
    case "document": return ".html";
    case "stylesheet": return ".css";
    case "script": return ".js";
    case "image": return [".jpg", ".png", ".svg", ".webp"][Math.floor(Math.random() * 4)];
    case "font": return [".woff2", ".ttf", ".otf"][Math.floor(Math.random() * 3)];
    case "fetch": 
    case "xhr": return ".json";
    default: return "";
  }
}

function getContentType(resourceType: string): string {
  switch (resourceType) {
    case "document": return "text/html";
    case "stylesheet": return "text/css";
    case "script": return "application/javascript";
    case "image": return ["image/jpeg", "image/png", "image/svg+xml", "image/webp"][Math.floor(Math.random() * 4)];
    case "font": return ["font/woff2", "font/ttf", "font/otf"][Math.floor(Math.random() * 3)];
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
