
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandLogoProcessingProps, ProcessedItem } from "@/types/brandLogo";
import { toast } from "sonner";
import { Play, AlertOctagon, CheckCircle2, Clock, X } from "lucide-react";
import { mediaApi, brandsApi, categoriesApi } from "@/utils/api";

const BrandLogoProcessing = ({
  files,
  mappings,
  isProcessing,
  processed,
  onStartProcessing,
  config
}: BrandLogoProcessingProps) => {
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom of log when new items are added
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [processLog]);
  
  const clearLog = () => {
    setProcessLog([]);
    setProcessedItems([]);
  };
  
  // This will be called when actual processing is implemented
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Process Logo Files</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLog}
            disabled={isProcessing || processLog.length === 0}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Log
          </Button>
          <Button
            onClick={onStartProcessing}
            disabled={isProcessing || files.length === 0}
          >
            <Play className="h-4 w-4 mr-1" />
            Start Processing
          </Button>
        </div>
      </div>
      
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Processing files...</span>
            <span>{processed.success + processed.failed} of {processed.total}</span>
          </div>
          <Progress 
            value={((processed.success + processed.failed) / processed.total) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-green-500">{processed.success} successful</span>
            {processed.failed > 0 && (
              <span className="text-red-500">{processed.failed} failed</span>
            )}
          </div>
        </div>
      )}
      
      <div className="border rounded-md">
        <div className="p-3 border-b bg-muted/50">
          <h4 className="font-medium">Processing Log</h4>
        </div>
        <ScrollArea className="h-60 p-3" ref={logRef}>
          {processLog.length > 0 ? (
            <div className="space-y-1 font-mono text-sm">
              {processLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">
                Processing log will appear here
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
      
      {processedItems.length > 0 && (
        <div className="border rounded-md">
          <div className="p-3 border-b bg-muted/50">
            <h4 className="font-medium">Processed Items</h4>
          </div>
          <div className="divide-y">
            {processedItems.map((item, index) => (
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
                  <span className="text-sm text-red-500">{item.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
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
            <span className="font-medium">{files.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogoProcessing;
