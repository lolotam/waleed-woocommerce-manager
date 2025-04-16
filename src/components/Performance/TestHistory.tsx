
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueuedTestResponse } from "@/types/performance";
import { Clock, BarChart, Link2 } from "lucide-react";
import useTestQueue from "@/hooks/useTestQueue";

interface TestHistoryProps {
  onViewResult?: (testId: string) => void;
}

const TestHistory: React.FC<TestHistoryProps> = ({ onViewResult }) => {
  const { queuedTests, refreshTests } = useTestQueue();
  const [tests, setTests] = useState<QueuedTestResponse[]>([]);

  // Load tests when component mounts
  useEffect(() => {
    setTests(queuedTests);
  }, [queuedTests]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display elements
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'queued':
        return <Badge className="bg-yellow-500">Queued</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Get score display
  const getScoreDisplay = (test: QueuedTestResponse) => {
    if (test.status === 'completed' && test.result) {
      const score = test.result.scores.overall;
      let color;
      
      if (score >= 90) color = 'text-green-500';
      else if (score >= 70) color = 'text-yellow-500';
      else color = 'text-red-500';
      
      return <span className={`font-bold ${color}`}>{score}</span>;
    }
    
    return <span className="text-gray-400">--</span>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Test History</CardTitle>
            <CardDescription>Your recent performance tests</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshTests}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 opacity-50 mb-2" />
            <p>No test history found.</p>
            <p className="text-sm">Run your first performance test to see results here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tests.map((test) => (
              <div 
                key={test.testId}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[180px] md:max-w-[300px]">
                      {test.config?.url || test.result?.url || "Unknown URL"}
                    </span>
                    {getStatusBadge(test.status)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {test.queuedAt && formatDate(test.queuedAt)}
                    {test.result?.testDate && formatDate(test.result.testDate)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      Score: {getScoreDisplay(test)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {test.config?.device || test.result?.config.device}, 
                      {test.config?.browser || test.result?.config.browser}
                    </div>
                  </div>
                  
                  {test.status === 'completed' && onViewResult && (
                    <Button 
                      size="sm" 
                      onClick={() => onViewResult(test.testId)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestHistory;
