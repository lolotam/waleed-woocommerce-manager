
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon, ExternalLink, User, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionErrorAlertProps {
  hasError: boolean;
  onTabChange: (tab: string) => void;
}

const PermissionErrorAlert = ({ hasError, onTabChange }: PermissionErrorAlertProps) => {
  if (!hasError) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertOctagon className="h-4 w-4" />
      <AlertTitle>WooCommerce API Permission Error</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Your API credentials don't have sufficient permissions to upload media files. 
          This is commonly caused by incorrect API key permissions or application password settings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 mb-1">
          <div className="p-2 border rounded bg-white/5 flex items-start">
            <User className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Application Password Method</span>
              <p className="text-muted-foreground text-xs">
                Recommended: Create an application password in WordPress Users → Profile
              </p>
            </div>
          </div>
          <div className="p-2 border rounded bg-white/5 flex items-start">
            <Key className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">API Keys Method</span>
              <p className="text-muted-foreground text-xs">
                Set Read/Write permission for API keys in WooCommerce → Settings → Advanced
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTabChange('troubleshooting')}
            className="flex items-center"
          >
            View Detailed Solutions <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionErrorAlert;
