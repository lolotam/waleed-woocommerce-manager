
import { useState, useEffect } from "react";
import { BarChart as BarChartIcon, Download, Share2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PerformanceMetrics, PerformanceScore, PerformanceRecommendation, PerformanceTestResult } from "@/types/performance";
import PerformanceScoreCard from "./charts/PerformanceScoreCard";
import PerformanceMetricsChart from "./charts/PerformanceMetricsChart";
import ResourceWaterfallChart from "./charts/ResourceWaterfallChart";
import RecommendationsList from "./RecommendationsList";

interface TestResultsDashboardProps {
  testResult?: PerformanceTestResult | null;
  onTestAgain?: () => void;
  isLoading?: boolean;
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({ 
  testResult, 
  onTestAgain, 
  isLoading = false 
}) => {
  // If no test result is provided, use mock data
  const [scores, setScores] = useState<PerformanceScore>({
    overall: 72,
    speed: 65,
    optimization: 80,
    accessibility: 75
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 3.8,
    totalPageSize: 2.4,
    numberOfRequests: 87,
    firstContentfulPaint: 1.2,
    largestContentfulPaint: 2.8,
    timeToInteractive: 4.2,
    cumulativeLayoutShift: 0.12
  });

  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([
    {
      id: "rec1",
      title: "Optimize Images",
      description: "Compress and properly size images to reduce page load time",
      impact: "high",
      category: "optimization"
    },
    {
      id: "rec2",
      title: "Reduce JavaScript Bundle Size",
      description: "Consider code splitting and tree shaking to reduce JavaScript payload",
      impact: "high",
      category: "speed"
    },
    {
      id: "rec3",
      title: "Implement Browser Caching",
      description: "Set appropriate cache headers for static resources",
      impact: "medium",
      category: "optimization"
    },
    {
      id: "rec4",
      title: "Eliminate Render-Blocking Resources",
      description: "Defer non-critical CSS and JavaScript loading",
      impact: "medium",
      category: "speed"
    },
    {
      id: "rec5",
      title: "Improve Accessibility",
      description: "Add proper alt tags to images and ensure proper contrast ratios",
      impact: "medium",
      category: "accessibility"
    }
  ]);

  // Update state when testResult changes
  useEffect(() => {
    if (testResult) {
      setScores(testResult.scores);
      setMetrics(testResult.metrics);
      setRecommendations(testResult.recommendations);
    }
  }, [testResult]);

  // Format the test date for display
  const formatTestDate = (date: string | undefined) => {
    if (!date) return "April 16, 2025"; // Default date if none provided
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Report</h2>
          <p className="text-muted-foreground">
            Result for: <span className="font-medium">{testResult?.url || "https://example.com"}</span> • 
            Tested on {formatTestDate(testResult?.testDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            size="sm"
            onClick={onTestAgain}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Again"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PerformanceScoreCard title="Overall Score" score={scores.overall} />
        <PerformanceScoreCard title="Speed" score={scores.speed} />
        <PerformanceScoreCard title="Optimization" score={scores.optimization} />
        <PerformanceScoreCard title="Accessibility" score={scores.accessibility} />
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Performance Metrics
          </TabsTrigger>
          <TabsTrigger value="waterfall">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals & Metrics</CardTitle>
              <CardDescription>
                Key performance indicators that affect user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PerformanceMetricsChart metrics={metrics} />
              </div>
              
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="metrics-details">
                  <AccordionTrigger>Metrics Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Page Load Time</h4>
                        <p className="text-2xl font-bold">{metrics.pageLoadTime.toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">
                          Total time to fully load the page
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Total Page Size</h4>
                        <p className="text-2xl font-bold">{metrics.totalPageSize.toFixed(1)} MB</p>
                        <p className="text-sm text-muted-foreground">
                          Total size of all resources
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Number of Requests</h4>
                        <p className="text-2xl font-bold">{metrics.numberOfRequests}</p>
                        <p className="text-sm text-muted-foreground">
                          Total HTTP requests made
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">First Contentful Paint</h4>
                        <p className="text-2xl font-bold">{metrics.firstContentfulPaint.toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">
                          Time until first content is painted
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Largest Contentful Paint</h4>
                        <p className="text-2xl font-bold">{metrics.largestContentfulPaint.toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">
                          Time until largest content element is visible
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Time to Interactive</h4>
                        <p className="text-2xl font-bold">{metrics.timeToInteractive.toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">
                          Time until the page becomes fully interactive
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="waterfall">
          <Card>
            <CardHeader>
              <CardTitle>Resource Waterfall</CardTitle>
              <CardDescription>
                Timeline of resource loading sequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResourceWaterfallChart resources={testResult?.resources} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <RecommendationsList recommendations={recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestResultsDashboard;
