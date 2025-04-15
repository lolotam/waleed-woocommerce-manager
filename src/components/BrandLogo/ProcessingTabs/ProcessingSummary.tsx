
import React from "react";
import { BrandLogoConfigType } from "@/types/brandLogo";

interface ProcessingSummaryProps {
  config: BrandLogoConfigType;
  filesCount: number;
}

const ProcessingSummary = ({ config, filesCount }: ProcessingSummaryProps) => {
  return (
    <div className="border rounded-md p-4">
      <h4 className="font-medium mb-2">Processing Summary</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Target Type:</span>
          <span className="font-medium capitalize">{config.targetType}</span>
        </div>
        <div className="flex justify-between">
          <span>Add to Description:</span>
          <span className="font-medium">{config.addToDescription ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span>Fuzzy Matching:</span>
          <span className="font-medium">{config.fuzzyMatching ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className="flex justify-between">
          <span>Files to Process:</span>
          <span className="font-medium">{filesCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingSummary;
