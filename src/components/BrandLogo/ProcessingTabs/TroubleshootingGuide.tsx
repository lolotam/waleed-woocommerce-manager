
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const TroubleshootingGuide = () => {
  return (
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
  );
};

export default TroubleshootingGuide;
