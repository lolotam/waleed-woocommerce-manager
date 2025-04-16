
import React, { useState, useEffect } from "react";
import { BrandLogoProcessingProps } from "@/types/brandLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import { getWooCommerceConfig } from "@/utils/api/woocommerceCore";
import useProcessLog from "@/hooks/useProcessLog";

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
  const { 
    processLog, 
    processedItems, 
    hasPermissionError, 
    addLogEntry, 
    clearLog 
  } = useProcessLog();
  
  const [activeTab, setActiveTab] = useState<string>("log");
  
  // Update active tab when permission errors occur
  useEffect(() => {
    if (processed.failed > 0) {
      if (processed.failed > 0 && processed.failed === processed.total) {
        setActiveTab("troubleshooting");
      }
    }
  }, [processed.failed, processed.total]);
  
  // Get WooCommerce configuration from the utility function
  const wcConfig = getWooCommerceConfig();
  
  const handleStartProcessing = () => {
    addLogEntry("Starting processing...");
    addLogEntry(`Authentication method: ${wcConfig.authMethod || 'not set'}`);
    addLogEntry(`Store URL: ${wcConfig.url || 'not set'}`);
    addLogEntry(`Using target: ${config.targetType}`);
    addLogEntry(`Files to process: ${files.length}`);
    onStartProcessing();
  };
  
  return (
    <div className="space-y-6">
      <ProcessingControls 
        isProcessing={isProcessing}
        hasFiles={files.length > 0}
        hasLogs={processLog.length > 0}
        onStartProcessing={handleStartProcessing}
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
