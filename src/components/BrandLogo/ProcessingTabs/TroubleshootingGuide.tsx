
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon, ExternalLink, Key, UserCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TroubleshootingGuide = () => {
  return (
    <div className="border rounded-md p-4 space-y-4">
      <h4 className="font-medium text-lg">WooCommerce Permission Troubleshooting</h4>
      
      <Alert variant="destructive" className="mb-4">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>Media Upload Permission Error</AlertTitle>
        <AlertDescription>
          The "not allowed to create posts" error indicates that your API credentials lack the necessary 
          permissions to upload files to the WordPress media library, which is required for brand logos.
        </AlertDescription>
      </Alert>
      
      <div>
        <h5 className="font-medium mb-2">How to Fix API Permission Issues:</h5>
        <ol className="list-decimal list-inside space-y-4">
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <UserCircle className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 1: Use Application Passwords (Recommended)</h6>
                <p className="text-sm mb-2">WordPress Application Passwords provide the most reliable permissions.</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Go to WordPress Dashboard → Users → Your Profile</li>
                  <li>Scroll to "Application Passwords" section</li>
                  <li>Name it "Brand Logo Uploader"</li>
                  <li>Click "Add New Application Password"</li>
                  <li>Copy the generated password (looks like: XXXX XXXX XXXX XXXX)</li>
                  <li>Return to Configuration tab and select "WordPress Login" method</li>
                  <li>Enter your WordPress admin username and the new application password</li>
                </ol>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 text-blue-600 flex items-center mt-1" 
                  onClick={() => window.open('https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/', '_blank')}
                >
                  Learn about Application Passwords <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </li>
          
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <Key className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 2: Create New REST API Keys</h6>
                <p className="text-sm mb-2">Based on your screenshot, create REST API keys with proper permissions:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Log in to WordPress as an administrator</li>
                  <li>Go to WooCommerce → Settings → Advanced → REST API</li>
                  <li>Click "Add Key" button (as shown in your screenshot)</li>
                  <li>Set Description to "Brand Logo Uploader"</li>
                  <li>Set User to an administrator account (like "ioiofam" in your screenshot)</li>
                  <li>Set Permission to <strong>Read/Write</strong> (crucial for media uploads)</li>
                  <li>Click "Generate API Key"</li>
                  <li>Copy both the Consumer Key and Consumer Secret</li>
                  <li>Return to Configuration tab and use "API Keys" authentication method</li>
                </ol>
              </div>
            </div>
          </li>
          
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 3: Check User Role and Permissions</h6>
                <p className="text-sm mb-2">Verify the user associated with your API keys has proper permissions:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>In your screenshot, the user "ioiofam" has Read/Write permissions</li>
                  <li>Ensure this user has the Administrator role in WordPress</li>
                  <li>Go to Users → All Users and check the user's role</li>
                  <li>If not an Administrator, change the role or use a different user</li>
                  <li>Consider creating a new dedicated admin user just for API connections</li>
                </ol>
              </div>
            </div>
          </li>
        </ol>
      </div>
      
      <div className="mt-4 border-t pt-4">
        <h5 className="font-medium mb-2">After Making Changes:</h5>
        <ol className="list-decimal list-inside ml-4 text-sm space-y-1">
          <li>Return to the Configuration tab</li>
          <li>Enter your new API credentials</li>
          <li>Click "Save & Connect"</li>
          <li>Test the connection before proceeding</li>
        </ol>
        
        <div className="flex justify-between items-center mt-4">
          <Link 
            to="/brand-logo-uploader?tab=config" 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            Return to Configuration <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
          
          <Button variant="outline" size="sm" onClick={() => window.open('https://woocommerce.com/document/woocommerce-rest-api/', '_blank')}>
            WooCommerce API Docs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingGuide;
