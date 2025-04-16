import { CrawlerResult, PerformanceTestConfig } from "@/types/performance";

// This would normally call an actual backend API
// For now we'll simulate the crawler with mock data
export async function runPerformanceTest(config: PerformanceTestConfig): Promise<CrawlerResult> {
  console.log("Running performance test with config:", config);
  
  // Validate URL format
  try {
    // Make sure URL is properly formatted
    const urlObj = new URL(config.url);
    // Use the normalized URL
    config.url = urlObj.toString();
  } catch (err) {
    console.error("Invalid URL format:", config.url);
    throw new Error("Invalid URL: Please enter a valid website address");
  }
  
  // Mock implementation - would be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockCrawlerResult(config));
    }, 3000); // Simulate network delay
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
    let url;
    try {
      // For the first request, use the input URL
      url = i === 0 
        ? config.url 
        : `${getRandomDomain(config.url)}/${resourceType}/${i}${getFileExtension(resourceType)}`;
    } catch (e) {
      // Fallback URL in case of errors
      url = `https://example.com/${resourceType}/${i}${getFileExtension(resourceType)}`;
    }
    
    const size = Math.floor(Math.random() * 500000) + 1000; // 1KB to 500KB
    const time = i === 0 ? 0 : Math.floor(Math.random() * 1000) + 200; // 200ms to 1200ms
    
    requests.push({
      url,
      resourceType,
      method: "GET",
      time
    });
    
    responses.push({
      url,
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
function getRandomDomain(baseUrl: string): string {
  let hostname = "example.com";
  try {
    hostname = new URL(baseUrl).hostname;
  } catch (e) {
    // Default hostname if URL is invalid
    console.warn("Invalid URL when getting domain, using default");
  }
  
  const domains = [
    baseUrl,
    `cdn.${hostname}`,
    `assets.${hostname}`,
    `api.${hostname}`,
    "fonts.googleapis.com",
    "ajax.googleapis.com",
    "www.google-analytics.com"
  ];
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
    case "fast": return 0.8;
    case "average": return 1;
    case "slow": return 1.5;
    case "3g": return 2;
    case "4g": return 1.2;
    default: return 1;
  }
}
