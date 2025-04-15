
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";

interface PermissionErrorAlertProps {
  hasError: boolean;
  onTabChange: (tab: string) => void;
}

const PermissionErrorAlert = ({ hasError, onTabChange }: PermissionErrorAlertProps) => {
  if (!hasError) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertOctagon className="h-4 w-4" />
      <AlertTitle>Permission Error Detected</AlertTitle>
      <AlertDescription>
        Your WooCommerce API keys don't have permission to upload media. 
        Please check the troubleshooting tab below for detailed solutions.
      </AlertDescription>
    </Alert>
  );
};

export default PermissionErrorAlert;
