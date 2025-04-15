
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, KeyRound } from "lucide-react";

interface ProgressIndicatorProps {
  processed: {
    success: number;
    failed: number;
    total: number;
  };
}

const ProgressIndicator = ({ processed }: ProgressIndicatorProps) => {
  const completedPercentage = ((processed.success + processed.failed) / processed.total) * 100;
  const hasErrors = processed.failed > 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center">
          {hasErrors && <KeyRound className="h-4 w-4 text-red-500 mr-1" />}
          Processing files...
        </span>
        <span>{processed.success + processed.failed} of {processed.total}</span>
      </div>
      <Progress 
        value={completedPercentage} 
        className={`h-2 ${hasErrors ? 'bg-red-100' : ''}`}
      />
      <div className="flex justify-between text-sm">
        <span className="text-green-500">{processed.success} successful</span>
        {processed.failed > 0 && (
          <span className="text-red-500 font-medium flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {processed.failed} failed (permission error)
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
