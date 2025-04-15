
import React from "react";
import { ProcessedItem } from "@/types/brandLogo";
import { CheckCircle2, AlertOctagon, Clock } from "lucide-react";

interface ProcessedItemsProps {
  processedItems: ProcessedItem[];
}

const ProcessedItems = ({ processedItems }: ProcessedItemsProps) => {
  return (
    <div className="border rounded-md">
      <div className="p-3 border-b bg-muted/50">
        <h4 className="font-medium">Processed Items</h4>
      </div>
      <div className="divide-y max-h-60 overflow-auto">
        {processedItems.length > 0 ? (
          processedItems.map((item, index) => (
            <div key={index} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {item.status === 'failed' && <AlertOctagon className="h-4 w-4 text-red-500" />}
                {item.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                <span>{item.filename}</span>
                <span className="text-muted-foreground">→</span>
                <span>{item.targetName}</span>
              </div>
              {item.status === 'failed' && item.message && (
                <span className="text-sm text-red-500 max-w-[50%] truncate" title={item.message}>
                  {item.message}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No items processed yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessedItems;
