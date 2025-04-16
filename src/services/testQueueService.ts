
import { PerformanceTestConfig, QueuedTestResponse, TestStatus } from "@/types/performance";
import { v4 as uuidv4 } from "uuid";

// In a real app, this would connect to a backend queue system
// For now, we'll simulate it with local storage and timeouts

// Store for our "queued" tests
const TEST_QUEUE_KEY = "performance_test_queue";
const TEST_RESULTS_KEY = "performance_test_results";

// Queue a new test
export async function queueTest(config: PerformanceTestConfig): Promise<QueuedTestResponse> {
  const testId = uuidv4();
  const queuedTest = {
    id: testId,
    config,
    status: "queued" as TestStatus,
    queuedAt: new Date().toISOString(),
    position: getQueueLength() + 1
  };
  
  // Add to "queue" in localStorage
  const queue = getQueue();
  queue.push(queuedTest);
  saveQueue(queue);
  
  // Simulate backend processing
  simulateProcessing(testId, config);
  
  return {
    testId,
    status: "queued",
    position: queuedTest.position,
    estimatedTime: queuedTest.position * 20 // 20 seconds per test in queue
  };
}

// Get the status of a test
export async function getTestStatus(testId: string): Promise<QueuedTestResponse | null> {
  const queue = getQueue();
  const queuedTest = queue.find(test => test.id === testId);
  
  if (!queuedTest) {
    // Check if it's in results (completed)
    const results = getTestResults();
    const result = results.find(r => r.id === testId);
    
    if (result) {
      return {
        testId,
        status: "completed",
        position: 0,
        estimatedTime: 0,
        result
      };
    }
    
    return null;
  }
  
  return {
    testId,
    status: queuedTest.status,
    position: queuedTest.position,
    estimatedTime: queuedTest.position * 20
  };
}

// Get all tests for a user (both queued and completed)
export async function getUserTests(): Promise<QueuedTestResponse[]> {
  const queue = getQueue();
  const results = getTestResults();
  
  const queuedTests = queue.map(test => ({
    testId: test.id,
    status: test.status,
    position: test.position,
    estimatedTime: test.position * 20,
    queuedAt: test.queuedAt,
    config: test.config
  }));
  
  const completedTests = results.map(result => ({
    testId: result.id,
    status: "completed" as TestStatus,
    position: 0,
    estimatedTime: 0,
    result
  }));
  
  return [...queuedTests, ...completedTests];
}

// Helper functions for our "queue" storage
function getQueue() {
  const queueJson = localStorage.getItem(TEST_QUEUE_KEY);
  return queueJson ? JSON.parse(queueJson) : [];
}

function saveQueue(queue: any[]) {
  localStorage.setItem(TEST_QUEUE_KEY, JSON.stringify(queue));
}

function getQueueLength() {
  return getQueue().length;
}

function getTestResults() {
  const resultsJson = localStorage.getItem(TEST_RESULTS_KEY);
  return resultsJson ? JSON.parse(resultsJson) : [];
}

function saveTestResults(results: any[]) {
  localStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(results));
}

// Simulate processing of tests
function simulateProcessing(testId: string, config: PerformanceTestConfig) {
  setTimeout(() => {
    // Update status to processing
    const queue = getQueue();
    const testIndex = queue.findIndex(test => test.id === testId);
    
    if (testIndex >= 0) {
      queue[testIndex].status = "processing";
      saveQueue(queue);
      
      // Simulate actual test run (would call the crawler in real implementation)
      import("@/services/performanceCrawlerService").then(({ runPerformanceTest }) => {
        setTimeout(async () => {
          try {
            const result = await runPerformanceTest(config);
            
            // Process test result and save
            import("@/hooks/usePerformanceTest").then(({ default: usePerformanceTest }) => {
              // This is a bit of a hack, normally we'd use proper backend processing
              const { transformCrawlerResult } = usePerformanceTest as any;
              const processedResult = transformCrawlerResult(result, config);
              
              // Save to "completed" tests
              const results = getTestResults();
              results.push(processedResult);
              saveTestResults(results);
              
              // Remove from queue
              const updatedQueue = getQueue().filter(t => t.id !== testId);
              
              // Update positions for remaining tests
              updatedQueue.forEach((test, idx) => {
                test.position = idx + 1;
              });
              
              saveQueue(updatedQueue);
            });
          } catch (error) {
            console.error("Test processing failed:", error);
            
            // Update queue with error status
            const queue = getQueue();
            const testIndex = queue.findIndex(test => test.id === testId);
            
            if (testIndex >= 0) {
              queue[testIndex].status = "failed";
              saveQueue(queue);
            }
          }
        }, 3000 + Math.random() * 5000); // Random processing time
      });
    }
  }, 2000); // Initial queue delay
}
