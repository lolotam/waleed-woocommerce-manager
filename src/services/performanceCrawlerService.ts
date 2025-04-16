
import { CrawlerResult, PerformanceTestConfig } from "@/types/performance";

// Cache for domains to prevent repeated calculations
const domainCache = new Map<string, string[]>();

// This would normally call an actual backend API
// For now we'll simulate the crawler with mock data
export async function runPerformanceTest(config: PerformanceTestConfig): Promise<CrawlerResult> {
  console.log("Running performance test with config:", config);
  
  // URL is already validated in usePerformanceTest, but double-check here
  if (!config.url.startsWith('http')) {
    throw new Error("Invalid URL: URL must start with http:// or https://");
  }
  
  // Mock implementation - would be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockCrawlerResult(config));
    }, 1500); // Reduced delay for better responsiveness
  });
}

// Helper function to generate mock crawler data
function generateMockCrawlerResult(config: PerformanceTestConfig): CrawlerResult {
  const resourceTypes = ["document", "stylesheet", "script", "image", "font", "fetch", "xhr"];
  const requests: any[] = [];
  const responses: any[] = [];
  
  // Generate a smaller number of mock requests for better performance
  const requestCount = 20; // Reduced from 30
  
  // Generate mock request/response data
  for (let i = 0; i < requestCount; i++) {
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    let url;
    
    try {
      // For the first request, use the input URL
      if (i === 0) {
        url = config.url;
      } else {
        // Get a random domain based on the base URL
        const baseDomain = getRandomDomain(config.url);
        url = `${baseDomain}/${resourceType}/${i}${getFileExtension(resourceType)}`;
      }
    } catch (e) {
      // Fallback URL in case of errors
      url = `https://example.com/${resourceType}/${i}${getFileExtension(resourceType)}`;
    }
    
    const size = Math.floor(Math.random() * 300000) + 1000; // 1KB to 300KB (reduced)
    const time = i === 0 ? 0 : Math.floor(Math.random() * 500) + 200; // 200ms to 700ms (reduced)
    
    requests.push({
      url,
      resourceType,
      method: "GET",
      time
    });
    
    responses.push({
      url,
      status: Math.random() > 0.95 ? 404 : 200, // Occasionally add 404s
      contentType: getContentType(resourceType),
      size,
      time: time + Math.floor(Math.random() * 200) // Response time is request time + processing time (reduced)
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
      loadTime: Math.floor(1500 * performanceMultiplier), // Reduced time
      resourceCount: requests.length,
      totalSize: responses.reduce((sum, res) => sum + res.size, 0),
      ttfb: Math.floor(150 * performanceMultiplier), // Reduced time
      domComplete: Math.floor(1200 * performanceMultiplier) // Reduced time
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
function getRandomDomain(baseUrl: string): string {
  let hostname = "example.com";
  
  try {
    hostname = new URL(baseUrl).hostname;
  } catch (e) {
    // Default hostname if URL is invalid
    console.warn("Invalid URL when getting domain, using default");
    return "https://example.com";
  }
  
  // Check if we have cached domains for this hostname
  if (domainCache.has(hostname)) {
    const domains = domainCache.get(hostname)!;
    return domains[Math.floor(Math.random() * domains.length)];
  }
  
  // Create and cache domains for this hostname
  const domains = [
    baseUrl,
    `https://cdn.${hostname}`,
    `https://assets.${hostname}`,
    `https://api.${hostname}`,
    "https://fonts.googleapis.com",
    "https://ajax.googleapis.com",
    "https://www.google-analytics.com"
  ];
  
  domainCache.set(hostname, domains);
  return domains[Math.floor(Math.random() * domains.length)];
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
    case "fast": return 0.7; // made slightly faster
    case "average": return 0.9; // made slightly faster
    case "slow": return 1.3; // made slightly faster
    case "3g": return 1.8; // made slightly faster
    case "4g": return 1.0; // made slightly faster
    default: return 0.9; // made slightly faster
  }
}
