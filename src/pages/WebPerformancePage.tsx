
import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GitCompareArrows } from "lucide-react";
import PerformanceTestForm from "@/components/Performance/PerformanceTestForm";
import TestResultsDashboard from "@/components/Performance/TestResultsDashboard";
import UserDashboard from "@/components/Performance/UserDashboard"; 
import { usePerformanceTest } from "@/hooks/usePerformanceTest";
import { toast } from "sonner";

const WebPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("test");
  const { runTest, isLoading, testResult } = usePerformanceTest();

  const handleRunTest = async (formData: any) => {
    if (!formData.url) {
      toast.error("Please enter a URL to test");
      return;
    }
    
    const result = await runTest(formData);
    if (result) {
      setActiveTab("results");
    }
  };

  const handleTestAgain = () => {
    setActiveTab("test");
  };

  const historyData = testResult 
    ? [
        {
          id: testResult.id,
          url: testResult.url,
          testDate: testResult.testDate,
          overallScore: testResult.scores.overall,
        },
        {
          id: "prev-test-1",
          url: testResult.url,
          testDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          overallScore: testResult.scores.overall - 5,
        },
        {
          id: "prev-test-2",
          url: testResult.url,
          testDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
          overallScore: testResult.scores.overall - 8,
        }
      ]
    : [];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Web Performance Testing</h1>
        
        <Link to="/web-performance/compare">
          <Button variant="outline">
            <GitCompareArrows className="mr-2 h-4 w-4" />
            Compare Tests
          </Button>
        </Link>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="test">Test a URL</TabsTrigger>
          <TabsTrigger value="results" disabled={!testResult}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <UserDashboard 
            history={historyData}
            loading={false}
          />
        </TabsContent>
        
        <TabsContent value="test">
          <PerformanceTestForm onSubmit={handleRunTest} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="results">
          {testResult ? (
            <TestResultsDashboard 
              testResult={testResult} 
              onTestAgain={handleTestAgain}
              isLoading={isLoading}
              historyData={historyData}
            />
          ) : (
            <div className="text-center py-12">
              <p>No test results available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebPerformancePage;
