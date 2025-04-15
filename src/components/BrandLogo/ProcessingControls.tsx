
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, X, RefreshCw } from "lucide-react";

interface ProcessingControlsProps {
  isProcessing: boolean;
  hasFiles: boolean;
  hasLogs: boolean;
  onStartProcessing: () => void;
  onClearLog: () => void;
}

const ProcessingControls = ({
  isProcessing,
  hasFiles,
  hasLogs,
  onStartProcessing,
  onClearLog
}: ProcessingControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Process Logo Files</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearLog}
          disabled={isProcessing || !hasLogs}
        >
          <X className="h-4 w-4 mr-1" />
          Clear Log
        </Button>
        <Button
          onClick={onStartProcessing}
          disabled={isProcessing || !hasFiles}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Start Processing
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProcessingControls;
