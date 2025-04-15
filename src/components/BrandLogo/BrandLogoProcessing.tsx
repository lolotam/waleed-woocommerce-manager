import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandLogoProcessingProps, ProcessedItem } from "@/types/brandLogo";
import { toast } from "sonner";
import { Play, AlertOctagon, CheckCircle2, Clock, X, Info, ExternalLink, RefreshCw } from "lucide-react";
import { mediaApi, brandsApi, categoriesApi } from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("log");
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [processLog]);

  useEffect(() => {
    setHasPermissionError(false);
  }, [files]);
  
  const clearLog = () => {
    setProcessLog([]);
    setProcessedItems([]);
    setHasPermissionError(false);
  };
  
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

    if (message.includes("not allowed to create posts") || 
        message.includes("permission denied")) {
      setHasPermissionError(true);
      
      setActiveTab("troubleshooting");
    }
  };
  
  const handleItemProcessed = (item: ProcessedItem) => {
    setProcessedItems(prev => [...prev, item]);
    
    if (item.status === 'failed' && 
        (item.message?.includes('permission denied') || 
         item.message?.includes('not allowed to create'))) {
      setHasPermissionError(true);
      setActiveTab("troubleshooting");
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

      {hasPermissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Permission Error Detected</AlertTitle>
          <AlertDescription>
            Your WooCommerce API keys don't have permission to upload media. 
            Please check the troubleshooting tab below for detailed solutions.
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="log" className="flex-1">Processing Log</TabsTrigger>
          <TabsTrigger value="items" className="flex-1">Processed Items</TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex-1">
            {hasPermissionError && <AlertOctagon className="h-4 w-4 mr-1 text-red-500" />}
            Troubleshooting
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="log">
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
        </TabsContent>
        
        <TabsContent value="items">
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
        </TabsContent>
        
        <TabsContent value="troubleshooting">
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-lg">Permission Issue Troubleshooting</h4>
            
            <Alert variant="destructive" className="mb-4">
              <AlertOctagon className="h-4 w-4" />
              <AlertTitle>Common Media Upload Permission Error</AlertTitle>
              <AlertDescription>
                The "not allowed to create posts" error indicates insufficient API permissions 
                for media file uploads. This typically happens when your WordPress or WooCommerce 
                credentials lack the necessary rights.
              </AlertDescription>
            </Alert>
            
            <div>
              <h5 className="font-medium mb-2">Recommended Solutions:</h5>
              <ol className="list-decimal list-inside space-y-4">
                <li className="p-3 border rounded-md bg-muted/30">
                  <h6 className="font-medium">1. Use Application Passwords (Recommended)</h6>
                  <p className="text-sm mb-2">Generate a dedicated application password with full media upload permissions.</p>
                  <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                    <li>Go to WordPress Dashboard → Users → Your Profile</li>
                    <li>Scroll to "Application Passwords" section</li>
                    <li>Click "Add New Application Password"</li>
                    <li>Name it "Brand Logo Uploader"</li>
                    <li>Copy the generated password</li>
                    <li>Return to Configuration and select "WordPress Login"</li>
                    <li>Enter your WordPress username and the new application password</li>
                  </ol>
                </li>
                
                <li className="p-3 border rounded-md bg-muted/30">
                  <h6 className="font-medium">2. Create WooCommerce API Keys with Admin Privileges</h6>
                  <p className="text-sm mb-2">Generate API keys using an administrator account with full permissions.</p>
                  <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                    <li>Log in to WordPress as an administrator</li>
                    <li>Navigate to WooCommerce → Settings → Advanced → REST API</li>
                    <li>Click "Add key"</li>
                    <li>Set Description to "Brand Logo Uploader"</li>
                    <li>Select an admin user account</li>
                    <li>Set Permissions to "Read/Write"</li>
                    <li>Generate and copy the Consumer Key and Secret</li>
                    <li>Return to Configuration and use API Keys method</li>
                  </ol>
                </li>
                
                <li className="p-3 border rounded-md bg-muted/30">
                  <h6 className="font-medium">3. Verify User Role Permissions</h6>
                  <p className="text-sm mb-2">Ensure your WordPress user has sufficient privileges.</p>
                  <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                    <li>Check your user role in WordPress Users</li>
                    <li>Confirm you have Administrator or Editor role</li>
                    <li>If not, request role upgrade from site administrator</li>
                    <li>Alternatively, use credentials from an admin account</li>
                  </ol>
                </li>
              </ol>
            </div>
            
            <div className="mt-4">
              <h5 className="font-medium mb-2">Additional Troubleshooting</h5>
              <div className="flex items-center space-x-2">
                <Link 
                  to="/brand-logo-uploader?tab=config" 
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Return to Configuration <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Refer to the <a 
                  href="https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication-over-http" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  WooCommerce API Documentation
                </a> for comprehensive authentication guidance.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
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
