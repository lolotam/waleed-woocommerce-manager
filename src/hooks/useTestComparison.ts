
import { useState, useEffect } from "react";
import { PerformanceTestResult, TestHistoryItem } from "@/types/performance";

export function useTestComparison(historyData: TestHistoryItem[]) {
  const [testA, setTestA] = useState<PerformanceTestResult | null>(null);
  const [testB, setTestB] = useState<PerformanceTestResult | null>(null);
  const [selectedTestIdA, setSelectedTestIdA] = useState<string | null>(null);
  const [selectedTestIdB, setSelectedTestIdB] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock function to get test data - in a real app, this would call an API
  const getTestResult = async (testId: string): Promise<PerformanceTestResult | null> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we'll create a mock test result based on the history item
      const historyItem = historyData.find(item => item.id === testId);
      
      if (!historyItem) return null;
      
      // Create a mock test result with the same ID and basic info
      const mockResult: PerformanceTestResult = {
        id: historyItem.id,
        url: historyItem.url,
        testDate: historyItem.testDate,
        metrics: {
          pageLoadTime: Math.random() * 5 + 1,
          totalPageSize: Math.round((Math.random() * 5 + 1) * 10) / 10,
          numberOfRequests: Math.floor(Math.random() * 100) + 20,
          firstContentfulPaint: Math.random() * 2 + 0.5,
          largestContentfulPaint: Math.random() * 3 + 1,
          timeToInteractive: Math.random() * 4 + 2,
          cumulativeLayoutShift: Math.random() * 0.3
        },
        scores: {
          overall: historyItem.overallScore,
          speed: Math.floor(Math.random() * 30) + 70,
          optimization: Math.floor(Math.random() * 30) + 70,
          accessibility: Math.floor(Math.random() * 20) + 80
        },
        resources: [],
        config: {
          url: historyItem.url,
          device: 'desktop',
          connection: 'fast',
          location: 'us-east',
          browser: 'chrome'
        },
        recommendations: []
      };
      
      return mockResult;
    } catch (err) {
      console.error("Error fetching test result:", err);
      setError("Failed to load test data");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load test A when selectedTestIdA changes
  useEffect(() => {
    if (selectedTestIdA) {
      getTestResult(selectedTestIdA).then(result => {
        setTestA(result);
      });
    } else {
      setTestA(null);
    }
  }, [selectedTestIdA]);

  // Load test B when selectedTestIdB changes
  useEffect(() => {
    if (selectedTestIdB) {
      getTestResult(selectedTestIdB).then(result => {
        setTestB(result);
      });
    } else {
      setTestB(null);
    }
  }, [selectedTestIdB]);

  return {
    testA,
    testB,
    selectedTestIdA,
    selectedTestIdB,
    setSelectedTestIdA,
    setSelectedTestIdB,
    isLoading,
    error
  };
}
