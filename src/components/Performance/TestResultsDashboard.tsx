
import { useState, useEffect } from "react";
import { Download, Share2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceMetrics, PerformanceScore, PerformanceRecommendation, PerformanceTestResult } from "@/types/performance";
import ResourceWaterfallChart from "./charts/ResourceWaterfallChart";
import RecommendationsPanel from "./RecommendationsPanel";
import PerformanceScoreDashboard from "./charts/PerformanceScoreDashboard";

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

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="waterfall">
            Resource Timeline
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <PerformanceScoreDashboard testResult={testResult || {
            id: "mock-test",
            url: "https://example.com",
            testDate: new Date().toISOString(),
            metrics,
            scores,
            resources: [],
            recommendations,
            config: {
              url: "https://example.com",
              device: "desktop",
              connection: "fast",
              location: "us-east",
              browser: "chrome"
            }
          }} />
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
          <RecommendationsPanel 
            recommendations={recommendations} 
            testResult={testResult || {
              id: "mock-test",
              url: "https://example.com",
              testDate: new Date().toISOString(),
              metrics,
              scores,
              resources: [],
              recommendations,
              config: {
                url: "https://example.com",
                device: "desktop",
                connection: "fast",
                location: "us-east",
                browser: "chrome"
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestResultsDashboard;
