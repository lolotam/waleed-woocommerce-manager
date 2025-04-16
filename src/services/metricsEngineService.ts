
import { PerformanceRecommendation, CrawlerResult, PerformanceScore } from "@/types/performance";
import { v4 as uuidv4 } from "uuid";

class MetricsEngine {
  /**
   * Calculate overall performance score based on web vitals and other metrics
   */
  calculatePerformanceScore(metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
    tbt?: number;
    loadTime?: number;
    totalSize?: number;
  }): PerformanceScore {
    // Weights for different metrics
    const weights = {
      lcp: 0.25,  // Largest Contentful Paint
      fid: 0.25,  // First Input Delay
      cls: 0.15,  // Cumulative Layout Shift
      ttfb: 0.10, // Time to First Byte
      tbt: 0.15,  // Total Blocking Time
      speed: 0.10 // Overall page speed
    };
    
    // Normalize metrics to scores between 0-1
    const scores = {
      lcp: this._scoreLCP(metrics.lcp || 0),
      fid: this._scoreFID(metrics.fid || 0),
      cls: this._scoreCLS(metrics.cls || 0),
      ttfb: this._scoreTTFB(metrics.ttfb || 0),
      tbt: this._scoreTBT(metrics.tbt || 0),
      speed: this._scoreSpeed(metrics.loadTime || 0, metrics.totalSize || 0)
    };
    
    // Calculate weighted score
    let weightedScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      weightedScore += scores[metric] * weight;
    }
    
    // Convert to 0-100 scale
    const overall = Math.round(weightedScore * 100);
    
    // Calculate specific scores
    return {
      overall,
      speed: Math.round(
        (scores.lcp * 0.4 + scores.ttfb * 0.3 + scores.speed * 0.3) * 100
      ),
      optimization: Math.round(
        (scores.tbt * 0.5 + scores.speed * 0.5) * 100
      ),
      accessibility: Math.round(
        (scores.cls * 0.6 + scores.fid * 0.4) * 100
      )
    };
  }
  
  /**
   * Generate recommendations based on test data
   */
  generateRecommendations(testData: CrawlerResult): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Check for large resources
    const largeResources = testData.responses.filter(res => res.size > 1000000);
    if (largeResources.length > 0) {
      recommendations.push({
        id: uuidv4(),
        title: 'Optimize large resources',
        description: `Found ${largeResources.length} resources larger than 1MB. Compress images, minify JavaScript and CSS files.`,
        impact: 'high',
        category: 'optimization'
      });
    }
    
    // Check for render-blocking resources
    const renderBlockingResources = testData.requests.filter(req => 
      (req.resourceType === 'script' || req.resourceType === 'stylesheet') && 
      req.time < testData.metrics.domComplete
    );
    
    if (renderBlockingResources.length > 3) {
      recommendations.push({
        id: uuidv4(),
        title: 'Eliminate render-blocking resources',
        description: `Found ${renderBlockingResources.length} render-blocking resources. Defer non-critical JavaScript, use async loading.`,
        impact: 'high',
        category: 'speed'
      });
    }
    
    // Check for slow TTFB
    if (testData.metrics.ttfb > 600) {
      recommendations.push({
        id: uuidv4(),
        title: 'Improve server response time',
        description: `Your Time to First Byte (TTFB) is ${testData.metrics.ttfb}ms, which is slow. Consider optimizing server performance, using a CDN, or caching.`,
        impact: 'high',
        category: 'speed'
      });
    }
    
    // Check for excessive requests
    if (testData.metrics.resourceCount > 50) {
      recommendations.push({
        id: uuidv4(),
        title: 'Reduce HTTP requests',
        description: `Your page makes ${testData.metrics.resourceCount} HTTP requests. Consolidate files, use CSS sprites, and limit third-party resources.`,
        impact: 'medium',
        category: 'optimization'
      });
    }
    
    // Check for total page size
    if (testData.metrics.totalSize > 3 * 1024 * 1024) { // > 3MB
      recommendations.push({
        id: uuidv4(),
        title: 'Reduce total page size',
        description: `Your page size is ${Math.round(testData.metrics.totalSize / (1024 * 1024))}MB, which is large. Optimize images, minify code, and remove unnecessary resources.`,
        impact: 'medium',
        category: 'optimization'
      });
    }
    
    // Check for 404 responses
    const notFoundResponses = testData.responses.filter(res => res.status === 404);
    if (notFoundResponses.length > 0) {
      recommendations.push({
        id: uuidv4(),
        title: 'Fix broken resources',
        description: `Found ${notFoundResponses.length} resources with 404 (Not Found) status. Fix or remove these broken links.`,
        impact: 'low',
        category: 'best-practices'
      });
    }
    
    return recommendations;
  }
  
  // Private scoring methods
  private _scoreLCP(lcp: number): number {
    // LCP thresholds in ms: good (<2.5s), needs improvement (<4s), poor (>=4s)
    if (lcp <= 2500) return 1;
    if (lcp <= 4000) return 0.5 - ((lcp - 2500) / 3000);
    return Math.max(0, 0.3 - ((lcp - 4000) / 6000));
  }
  
  private _scoreFID(fid: number): number {
    // FID thresholds in ms: good (<100), needs improvement (<300), poor (>=300)
    if (fid <= 100) return 1;
    if (fid <= 300) return 0.5 - ((fid - 100) / 400);
    return Math.max(0, 0.3 - ((fid - 300) / 500));
  }
  
  private _scoreCLS(cls: number): number {
    // CLS thresholds: good (<0.1), needs improvement (<0.25), poor (>=0.25)
    if (cls <= 0.1) return 1;
    if (cls <= 0.25) return 0.5 - ((cls - 0.1) / 0.3);
    return Math.max(0, 0.3 - ((cls - 0.25) / 0.5));
  }
  
  private _scoreTTFB(ttfb: number): number {
    // TTFB thresholds in ms: good (<200), needs improvement (<500), poor (>=500)
    if (ttfb <= 200) return 1;
    if (ttfb <= 500) return 0.5 - ((ttfb - 200) / 600);
    return Math.max(0, 0.3 - ((ttfb - 500) / 500));
  }
  
  private _scoreTBT(tbt: number): number {
    // TBT thresholds in ms: good (<200), needs improvement (<600), poor (>=600)
    if (tbt <= 200) return 1;
    if (tbt <= 600) return 0.5 - ((tbt - 200) / 800);
    return Math.max(0, 0.3 - ((tbt - 600) / 1000));
  }
  
  private _scoreSpeed(loadTime: number, totalSize: number): number {
    // Combined score based on load time and total size
    const loadTimeScore = loadTime <= 2000 ? 1 : 
                         loadTime <= 5000 ? 0.5 - ((loadTime - 2000) / 6000) : 
                         Math.max(0, 0.3 - ((loadTime - 5000) / 5000));
    
    const sizeScore = totalSize <= 1000000 ? 1 : 
                     totalSize <= 3000000 ? 0.5 - ((totalSize - 1000000) / 4000000) :
                     Math.max(0, 0.3 - ((totalSize - 3000000) / 7000000));
    
    return (loadTimeScore * 0.6) + (sizeScore * 0.4);
  }
}

// Export a singleton instance
export const metricsEngine = new MetricsEngine();

export default metricsEngine;
