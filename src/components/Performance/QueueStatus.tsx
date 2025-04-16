
import React from "react";
import { QueuedTestResponse } from "@/types/performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QueueStatusProps {
  activeTest?: QueuedTestResponse | null;
  onViewResults?: (testId: string) => void;
  onRefresh?: () => void;
}

const QueueStatus: React.FC<QueueStatusProps> = ({ 
  activeTest,
  onViewResults,
  onRefresh
}) => {
  if (!activeTest) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getProgressValue = (status: string, estimatedTime: number) => {
    switch (status) {
      case 'queued': return Math.min(30, 100 - (estimatedTime / 60) * 100);
      case 'processing': return 70;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Test Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(activeTest.status)}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(activeTest.status)}
                  {activeTest.status.charAt(0).toUpperCase() + activeTest.status.slice(1)}
                </span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {activeTest.url || activeTest.config?.url || "URL unavailable"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={getProgressValue(activeTest.status, activeTest.estimatedTime)} 
              className="h-2" 
            />
            
            <div className="text-sm text-muted-foreground">
              {activeTest.status === 'queued' && (
                <span>
                  Position in queue: {activeTest.position} &bull; 
                  Estimated wait: {formatTime(activeTest.estimatedTime)}
                </span>
              )}
              
              {activeTest.status === 'processing' && (
                <span>Processing your test...</span>
              )}
              
              {activeTest.status === 'completed' && (
                <div className="flex justify-between items-center">
                  <span>Test completed successfully</span>
                  {onViewResults && (
                    <Button 
                      size="sm" 
                      onClick={() => onViewResults(activeTest.testId)}
                    >
                      View Results
                    </Button>
                  )}
                </div>
              )}
              
              {activeTest.status === 'failed' && (
                <span className="text-red-500">Test failed. Please try again.</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper to format time in minutes and seconds
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} min${mins > 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''}`;
}

export default QueueStatus;
