
import { useState, useEffect } from "react";
import { BarChart, Clock, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceTestConfig } from "@/types/performance";
import { toast } from "@/components/ui/use-toast";
import PerformanceTestForm from "@/components/Performance/PerformanceTestForm";
import TestHistory from "@/components/Performance/TestHistory";
import TestResultsDashboard from "@/components/Performance/TestResultsDashboard";
import usePerformanceTest from "@/hooks/usePerformanceTest";

const WebPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("test");
  const [url, setUrl] = useState("");
  const { runTest, isLoading, testResult, error } = usePerformanceTest();

  // Handle any errors from the test
  useEffect(() => {
    if (error) {
      toast({
        title: "Test Failed",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  const handleQuickTest = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to test",
        variant: "destructive"
      });
      return;
    }

    // Create a default config for quick test
    const quickTestConfig: PerformanceTestConfig = {
      url,
      device: "desktop",
      connection: "fast",
      location: "us-east",
      browser: "chrome"
    };

    // Run the test
    const result = await runTest(quickTestConfig);
    if (result) {
      setActiveTab("results");
    }
  };

  const handleAdvancedTest = async (config: PerformanceTestConfig) => {
    const result = await runTest(config);
    if (result) {
      setActiveTab("results");
    }
  };

  const handleTestAgain = () => {
    setActiveTab("test");
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
          <PerformanceTestForm onSubmit={handleAdvancedTest} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <TestResultsDashboard 
            testResult={testResult} 
            onTestAgain={handleTestAgain} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <TestHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebPerformancePage;
