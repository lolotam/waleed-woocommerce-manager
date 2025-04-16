
import { useState, useEffect } from "react";
import { BarChart, Clock, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceTestConfig, PerformanceTestResult } from "@/types/performance";
import { toast } from "@/components/ui/use-toast";
import PerformanceTestForm from "@/components/Performance/PerformanceTestForm";
import TestHistory from "@/components/Performance/TestHistory";
import TestResultsDashboard from "@/components/Performance/TestResultsDashboard";
import QueueStatus from "@/components/Performance/QueueStatus";
import usePerformanceTest from "@/hooks/usePerformanceTest";
import useTestQueue from "@/hooks/useTestQueue";

const WebPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("test");
  const [url, setUrl] = useState("");
  const { 
    runTest, 
    isLoading: testRunning, 
    testResult, 
    error: testError 
  } = usePerformanceTest();
  
  const {
    addToQueue,
    getTest,
    activeTestId,
    isLoading: queueLoading,
    error: queueError,
    refreshTests
  } = useTestQueue();
  
  const [activeTest, setActiveTest] = useState(null);
  const [selectedTestResult, setSelectedTestResult] = useState<PerformanceTestResult | null>(null);
  
  // Fetch active test data periodically
  useEffect(() => {
    if (activeTestId) {
      const fetchActiveTest = async () => {
        const test = await getTest(activeTestId);
        setActiveTest(test);
        
        // If test is completed, get the results
        if (test?.status === 'completed' && test?.result) {
          setSelectedTestResult(test.result);
          setActiveTab("results");
          
          toast({
            title: "Test Completed",
            description: "Your performance test has finished. Viewing results now.",
          });
        }
      };
      
      fetchActiveTest();
      const intervalId = setInterval(fetchActiveTest, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeTestId]);
  
  // Handle any errors
  useEffect(() => {
    if (testError) {
      toast({
        title: "Test Failed",
        description: testError,
        variant: "destructive"
      });
    }
    
    if (queueError) {
      toast({
        title: "Queue Error",
        description: queueError,
        variant: "destructive"
      });
    }
  }, [testError, queueError]);

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

    // Queue the test
    const response = await addToQueue(quickTestConfig);
    if (response) {
      toast({
        title: "Test Queued",
        description: `Your test for ${url} has been added to the queue.`,
      });
    }
  };

  const handleAdvancedTest = async (config: PerformanceTestConfig) => {
    const response = await addToQueue(config);
    if (response) {
      toast({
        title: "Test Queued",
        description: `Your test for ${config.url} has been added to the queue.`,
      });
    }
  };

  const handleTestAgain = () => {
    setActiveTab("test");
    setSelectedTestResult(null);
  };
  
  const handleViewResults = (testId: string) => {
    getTest(testId).then(test => {
      if (test?.result) {
        setSelectedTestResult(test.result);
        setActiveTab("results");
      }
    });
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
            <Button 
              onClick={handleQuickTest} 
              disabled={queueLoading || !url}
            >
              {queueLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Queueing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Show queue status if we have an active test */}
      {activeTest && (
        <QueueStatus 
          activeTest={activeTest} 
          onViewResults={handleViewResults}
          onRefresh={refreshTests}
        />
      )}

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
          <PerformanceTestForm 
            onSubmit={handleAdvancedTest} 
            isLoading={queueLoading} 
          />
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <TestResultsDashboard 
            testResult={selectedTestResult || testResult} 
            onTestAgain={handleTestAgain} 
            isLoading={testRunning || queueLoading} 
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <TestHistory onViewResult={handleViewResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebPerformancePage;
