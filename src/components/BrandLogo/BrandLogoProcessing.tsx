
import React, { useState, useEffect } from "react";
import { BrandLogoProcessingProps, ProcessedItem } from "@/types/brandLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, ShieldAlert } from "lucide-react";

// Import the separated components
import ProcessingControls from "./ProcessingControls";
import PermissionErrorAlert from "./PermissionErrorAlert";
import ProgressIndicator from "./ProcessingTabs/ProgressIndicator";
import ProcessingLog from "./ProcessingTabs/ProcessingLog";
import ProcessedItems from "./ProcessingTabs/ProcessedItems";
import TroubleshootingGuide from "./ProcessingTabs/TroubleshootingGuide";
import ProcessingSummary from "./ProcessingTabs/ProcessingSummary";

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
  
  // Check the processed items for permission errors
  useEffect(() => {
    if (processed.failed > 0) {
      // Set permission error flag to show the alert
      setHasPermissionError(true);
      
      // Automatically switch to troubleshooting tab if there are permission errors
      if (processed.failed > 0 && processed.failed === processed.total) {
        setActiveTab("troubleshooting");
      }
    }
  }, [processed.failed, processed.total]);
  
  const clearLog = () => {
    setProcessLog([]);
    setProcessedItems([]);
    setHasPermissionError(false);
  };
  
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

    // Check for common permission error messages
    if (
      message.includes("not allowed to create posts") || 
      message.includes("permission denied") ||
      message.includes("insufficient capabilities") ||
      message.includes("rest_cannot_create") ||
      message.includes("woocommerce_rest_cannot_create")
    ) {
      setHasPermissionError(true);
      setActiveTab("troubleshooting");
    }
  };
  
  return (
    <div className="space-y-6">
      <ProcessingControls 
        isProcessing={isProcessing}
        hasFiles={files.length > 0}
        hasLogs={processLog.length > 0}
        onStartProcessing={onStartProcessing}
        onClearLog={clearLog}
      />

      <PermissionErrorAlert 
        hasError={hasPermissionError} 
        onTabChange={setActiveTab} 
      />
      
      {isProcessing && <ProgressIndicator processed={processed} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="log" className="flex-1">Processing Log</TabsTrigger>
          <TabsTrigger value="items" className="flex-1">Processed Items</TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex-1">
            {hasPermissionError && <ShieldAlert className="h-4 w-4 mr-1 text-red-500" />}
            Troubleshooting
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="log">
          <ProcessingLog processLog={processLog} />
        </TabsContent>
        
        <TabsContent value="items">
          <ProcessedItems processedItems={processedItems} />
        </TabsContent>
        
        <TabsContent value="troubleshooting">
          <TroubleshootingGuide />
        </TabsContent>
      </Tabs>
      
      <ProcessingSummary config={config} filesCount={files.length} />
    </div>
  );
};

export default BrandLogoProcessing;
