
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon, ExternalLink } from "lucide-react";
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
      <AlertDescription className="space-y-2">
        <p>
          Your API credentials don't have sufficient permissions to upload media files. 
          This is commonly caused by incorrect API key permissions or application password settings.
        </p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTabChange('troubleshooting')}
            className="flex items-center"
          >
            View Solutions <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionErrorAlert;
