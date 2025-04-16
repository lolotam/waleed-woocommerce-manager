
import { useState, useEffect, useCallback } from "react";
import { BarChart, Clock, Globe, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceTestConfig } from "@/types/performance";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PerformanceTestForm from "@/components/Performance/PerformanceTestForm";
import TestHistory from "@/components/Performance/TestHistory";
import TestResultsDashboard from "@/components/Performance/TestResultsDashboard";
import usePerformanceTest from "@/hooks/usePerformanceTest";

// Helper function to validate URL format
const isValidUrl = (url: string): boolean => {
  // Basic URL validation
  return !!url && url.trim().length > 0;
};

// Helper function to normalize URL (add protocol if missing)
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  
  return url;
};

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

  const handleQuickTest = useCallback(async () => {
    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL to test",
        variant: "destructive"
      });
      return;
    }

    // Normalize the URL and update it in the input field
    const normalizedUrl = normalizeUrl(url);
    setUrl(normalizedUrl);

    // Create a default config for quick test
    const quickTestConfig: PerformanceTestConfig = {
      url: normalizedUrl,
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
  }, [url, runTest]);

  const handleAdvancedTest = useCallback(async (config: PerformanceTestConfig) => {
    // Normalize the URL
    config.url = normalizeUrl(config.url);
    
    const result = await runTest(config);
    if (result) {
      setActiveTab("results");
    }
  }, [runTest]);

  const handleTestAgain = useCallback(() => {
    setActiveTab("test");
  }, []);

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
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pr-24"
              />
              {!url && (
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/70 text-sm">
                  https://
                </div>
              )}
            </div>
            <Button onClick={handleQuickTest} disabled={isLoading || !url} className="sm:w-auto w-full">
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
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This tool simulates performance testing. In a production environment, it would connect to a backend API that performs real crawling.
            </AlertDescription>
          </Alert>
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
