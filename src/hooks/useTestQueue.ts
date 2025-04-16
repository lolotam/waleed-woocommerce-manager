
import { useState, useEffect } from "react";
import { 
  PerformanceTestConfig, 
  QueuedTestResponse, 
  TestStatus 
} from "@/types/performance";
import { 
  queueTest, 
  getTestStatus, 
  getUserTests 
} from "@/services/testQueueService";

export function useTestQueue() {
  const [queuedTests, setQueuedTests] = useState<QueuedTestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  
  // Load all user tests on mount
  useEffect(() => {
    loadUserTests();
    
    // Set up polling for updates
    const intervalId = setInterval(() => {
      loadUserTests();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Load all tests for the current user
  const loadUserTests = async () => {
    try {
      const tests = await getUserTests();
      setQueuedTests(tests);
      
      // If we have an active test, check if it completed
      if (activeTestId) {
        const activeTest = tests.find(t => t.testId === activeTestId);
        if (activeTest?.status === 'completed') {
          setActiveTestId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load tests:", err);
      setError("Failed to load test queue");
    }
  };
  
  // Add a new test to the queue
  const addToQueue = async (config: PerformanceTestConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await queueTest(config);
      setActiveTestId(response.testId);
      await loadUserTests(); // Refresh the list
      return response;
    } catch (err) {
      console.error("Failed to queue test:", err);
      setError("Failed to add test to queue");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a specific test by ID
  const getTest = async (testId: string) => {
    try {
      return await getTestStatus(testId);
    } catch (err) {
      console.error("Failed to get test status:", err);
      setError("Failed to retrieve test status");
      return null;
    }
  };
  
  // Get tests filtered by status
  const getTestsByStatus = (status: TestStatus | 'all') => {
    if (status === 'all') return queuedTests;
    return queuedTests.filter(test => test.status === status);
  };
  
  return {
    queuedTests,
    isLoading,
    error,
    activeTestId,
    addToQueue,
    getTest,
    getTestsByStatus,
    refreshTests: loadUserTests
  };
}

export default useTestQueue;
