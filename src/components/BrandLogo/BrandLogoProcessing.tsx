
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandLogoProcessingProps, ProcessedItem } from "@/types/brandLogo";
import { toast } from "sonner";
import { Play, AlertOctagon, CheckCircle2, Clock, X, Info } from "lucide-react";
import { mediaApi, brandsApi, categoriesApi } from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom of log when new items are added
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [processLog]);

  // Reset errors when files change
  useEffect(() => {
    setHasPermissionError(false);
  }, [files]);
  
  const clearLog = () => {
    setProcessLog([]);
    setProcessedItems([]);
    setHasPermissionError(false);
  };
  
  // This will be called when actual processing is implemented
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

    // Check for permission errors
    if (message.includes("not allowed to create posts") || 
        message.includes("permission denied")) {
      setHasPermissionError(true);
    }
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

      {hasPermissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            Your WooCommerce API keys don't have permission to upload media. 
            Please use an administrator account or check your API key permissions 
            in WooCommerce.
          </AlertDescription>
        </Alert>
      )}
      
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
                <div key={index} className={log.includes("error") || log.includes("failed") ? "text-red-500" : ""}>{log}</div>
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

      <Alert variant="default" className="border border-blue-200 bg-blue-50 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>WooCommerce API Permission Note</AlertTitle>
        <AlertDescription>
          For uploading logos, your WooCommerce API keys must have write permissions 
          for Media and {config.targetType === 'brands' ? 'Product Tags' : 'Product Categories'}.
          Please verify these permissions in your WooCommerce REST API settings.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BrandLogoProcessing;
