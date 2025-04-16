
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download } from "lucide-react";
import { PerformanceTestResult, TestHistoryItem } from "@/types/performance";
import ScoreGauge from "./ScoreGauge";
import MetricsTable from "./MetricsTable";
import RecommendationsList from "./RecommendationsList";
import HistoryChart from "./HistoryChart";
import PerformanceVisualization from "./PerformanceVisualization";
import { toast } from "sonner";

interface TestResultsDashboardProps {
  testResult: PerformanceTestResult;
  onTestAgain: () => void;
  isLoading?: boolean;
  historyData?: TestHistoryItem[];
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({
  testResult,
  onTestAgain,
  isLoading = false,
  historyData = []
}) => {
  const [activeResultTab, setActiveResultTab] = useState("metrics");

  const handleDownloadReport = () => {
    // This would generate and download a PDF report in a real app
    console.log("Downloading report for", testResult.id);
    toast.success("Report download initiated");
  };

  // Format page size for display
  const formatPageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Test Results</h2>
          <p className="text-muted-foreground">
            {testResult.url} • {new Date(testResult.testDate).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onTestAgain}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Test Again
          </Button>
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScoreGauge 
              score={testResult.scores.overall} 
              size="large"
              label="Overall"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Performance Scores</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <ScoreGauge 
                score={testResult.scores.speed} 
                label="Speed"
                size="small"
              />
              <ScoreGauge 
                score={testResult.scores.optimization} 
                label="Optimization"
                size="small"
              />
              <ScoreGauge 
                score={testResult.scores.accessibility} 
                label="Accessibility"
                size="small"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Load Time</span>
                <span className="font-medium">{testResult.metrics.pageLoadTime.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Size</span>
                <span className="font-medium">{formatPageSize(testResult.metrics.totalPageSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requests</span>
                <span className="font-medium">{testResult.metrics.numberOfRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Contentful Paint</span>
                <span className="font-medium">{testResult.metrics.firstContentfulPaint.toFixed(2)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs 
        value={activeResultTab} 
        onValueChange={setActiveResultTab} 
        defaultValue="metrics"
      >
        <TabsList className="w-full border-b mb-4 justify-start overflow-x-auto">
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed metrics about your page's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsTable metrics={testResult.metrics} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your page's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecommendationsList recommendations={testResult.recommendations} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>
                How your site's performance has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyData.length > 1 ? (
                <HistoryChart data={historyData} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Not enough historical data available yet.
                  Run more tests to see performance trends.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visualization">
          <PerformanceVisualization testResult={testResult} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestResultsDashboard;
