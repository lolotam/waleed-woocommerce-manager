
import { useState } from "react";
import { BarChart, Clock, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceTestConfig } from "@/types/performance";
import PerformanceTestForm from "@/components/Performance/PerformanceTestForm";
import TestHistory from "@/components/Performance/TestHistory";
import TestResultsDashboard from "@/components/Performance/TestResultsDashboard";

const WebPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("test");
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");

  const handleQuickTest = () => {
    if (!url) return;
    setIsLoading(true);
    
    // This would normally call an API to start a test
    setTimeout(() => {
      setIsLoading(false);
      setActiveTab("results");
    }, 3000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Web Performance Analysis</h1>
          <p className="text-muted-foreground">
            Analyze websites, identify performance issues, and get optimization recommendations
          </p>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Quick Performance Test
          </CardTitle>
          <CardDescription>
            Enter a URL to run a quick performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleQuickTest} disabled={isLoading || !url}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">
            <RefreshCw className="mr-2 h-4 w-4" />
            Test Configuration
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart className="mr-2 h-4 w-4" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Test History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="test" className="space-y-4">
          <PerformanceTestForm />
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <TestResultsDashboard />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <TestHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebPerformancePage;
