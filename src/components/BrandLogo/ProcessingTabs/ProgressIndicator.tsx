
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  processed: {
    success: number;
    failed: number;
    total: number;
  };
}

const ProgressIndicator = ({ processed }: ProgressIndicatorProps) => {
  const completedPercentage = ((processed.success + processed.failed) / processed.total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Processing files...</span>
        <span>{processed.success + processed.failed} of {processed.total}</span>
      </div>
      <Progress 
        value={completedPercentage} 
        className="h-2"
      />
      <div className="flex justify-between text-sm">
        <span className="text-green-500">{processed.success} successful</span>
        {processed.failed > 0 && (
          <span className="text-red-500">{processed.failed} failed</span>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
