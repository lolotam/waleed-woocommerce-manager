import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertOctagon, 
  ExternalLink, 
  Key, 
  UserCircle, 
  ShieldCheck, 
  Info, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  Settings,
  Globe,
  FileJson,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mediaApi } from "@/utils/api";
import { toast } from "sonner";
import { getWooCommerceConfig } from "@/utils/api/woocommerceCore";

const TroubleshootingGuide = () => {
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const wcConfig = getWooCommerceConfig();
  
  const testRestApi = async () => {
    setIsTestingApi(true);
    try {
      // Test media endpoint
      const result = await mediaApi.testRestApiEndpoint('wp/v2/media');
      setApiTestResult(result);
      
      if (result.accessible) {
        toast.success('WordPress REST API is accessible!');
      } else if (result.status === 404) {
        toast.error('WordPress REST API endpoint not found!', {
          description: 'The REST API might be disabled on your WordPress site.'
        });
      } else {
        toast.error(`REST API test failed with status ${result.status}`, {
          description: result.statusText || 'Unknown error'
        });
      }
    } catch (error: any) {
      setApiTestResult({
        accessible: false,
        error: error.message || 'Unknown error'
      });
      toast.error('Error testing REST API', {
        description: error.message || 'Unknown error occurred while testing the REST API'
      });
    } finally {
      setIsTestingApi(false);
    }
  };
  
  return (
    <div className="border rounded-md p-4 space-y-4">
      <h4 className="font-medium text-lg">WooCommerce Permission Troubleshooting</h4>
      
      <Alert variant="destructive" className="mb-4">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>Media Upload Permission Error</AlertTitle>
        <AlertDescription>
          The <strong>"not allowed to create posts"</strong> error indicates that your API credentials lack the necessary 
          permissions to upload files to the WordPress media library, which is required for brand logos.
        </AlertDescription>
      </Alert>
      
      <Card className="p-4 border-amber-500 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <h5 className="font-medium">WordPress REST API Status</h5>
            <p className="text-sm text-muted-foreground">
              Some WordPress sites have the REST API disabled, which prevents any API operations including media uploads.
              Test if your WordPress REST API is accessible:
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2"
                onClick={testRestApi}
                disabled={isTestingApi || !wcConfig?.url}
              >
                {isTestingApi ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Test WordPress REST API
              </Button>
              
              {!wcConfig?.url && (
                <span className="text-xs text-red-500">Please configure your WooCommerce URL first</span>
              )}
              
              {wcConfig?.url && (
                <span className="text-xs text-muted-foreground">
                  Testing: {wcConfig.url}/wp-json/wp/v2/media
                </span>
              )}
            </div>
            
            {apiTestResult && (
              <div className="mt-2 p-3 border rounded-md bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Test Results:</span>
                  {apiTestResult.accessible ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      REST API Accessible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      REST API Not Accessible
                    </span>
                  )}
                </div>
                
                <div className="text-xs space-y-1">
                  <div><strong>Status:</strong> {apiTestResult.status} {apiTestResult.statusText}</div>
                  {apiTestResult.networkError && (
                    <div className="text-red-600">
                      Network error: Could not connect to the server. Check URL and network connection.
                    </div>
                  )}
                  {apiTestResult.status === 404 && (
                    <div className="text-amber-600">
                      The REST API endpoint was not found. The WordPress REST API might be disabled.
                    </div>
                  )}
                  
                  {apiTestResult.accessible ? (
                    <div className="flex items-center mt-2 gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Your WordPress REST API is working! If you're still having issues, check authentication permissions.</span>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <div className="text-red-600 font-medium">How to fix REST API issues:</div>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Make sure your WordPress version is 4.7 or higher</li>
                        <li>Check that the REST API is not disabled by a security plugin</li>
                        <li>
                          Ensure your permalink settings are not set to "Plain" 
                          (Go to Settings → Permalinks in WordPress)
                        </li>
                        <li>Check if your .htaccess file blocks REST API access</li>
                        <li>Temporarily disable security plugins to test if they're blocking the API</li>
                        <li>
                          Try accessing <code>{wcConfig?.url}/wp-json/</code> directly in your browser to check if it returns JSON
                        </li>
                      </ol>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => window.open(`${wcConfig?.url}/wp-json/`, '_blank')}
                        >
                          Try Opening REST API Root
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center mt-3 gap-1 text-xs text-amber-700 dark:text-amber-400">
              <Info className="h-3 w-3" />
              <span>
                Most WordPress sites have the REST API enabled by default, but some security plugins or server configurations can disable it.
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      <div>
        <h5 className="font-medium mb-3 flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          How to Fix API Permission Issues:
        </h5>
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
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs flex items-start">
                  <Info className="h-3 w-3 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>The Application Password feature requires WordPress 5.6+ and allows fine-grained API access without sharing your main password.</span>
                </div>
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
                <p className="text-sm mb-2">Create REST API keys with proper permissions:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Log in to WordPress as an administrator</li>
                  <li>Go to WooCommerce → Settings → Advanced → REST API</li>
                  <li>Click "Add Key" button</li>
                  <li>Set Description to "Brand Logo Uploader"</li>
                  <li>Set User to an administrator account</li>
                  <li>Set Permission to <strong className="text-red-500">Read/Write</strong> (crucial for media uploads)</li>
                  <li>Click "Generate API Key"</li>
                  <li>Copy both the Consumer Key and Consumer Secret</li>
                  <li>Return to Configuration tab and use "API Keys" authentication method</li>
                </ol>
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-xs flex items-start">
                  <AlertCircle className="h-3 w-3 text-amber-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>The permission level <strong>MUST</strong> be set to "Read/Write" for media uploads to work correctly.</span>
                </div>
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
                  <li>Go to Users → All Users and check the user's role</li>
                  <li>Ensure this user has the Administrator role in WordPress</li>
                  <li>If not an Administrator, change the role or use a different user</li>
                  <li>Consider creating a new dedicated admin user just for API connections</li>
                  <li>Check if any security plugins are blocking API requests</li>
                </ol>
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-xs flex items-start">
                  <AlertCircle className="h-3 w-3 text-amber-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>Some WordPress security plugins may block REST API access. Check for plugins like Wordfence, iThemes Security, or others that might need configuration to allow API access.</span>
                </div>
              </div>
            </div>
          </li>
          
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <Globe className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 4: Check WordPress REST API Configuration</h6>
                <p className="text-sm mb-2">Ensure that the WordPress REST API is properly enabled:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Verify that your WordPress is running version 5.0 or higher</li>
                  <li>Check if the REST API is enabled in WordPress settings</li>
                  <li>Try accessing <code>{'{your-site-url}'}/wp-json/</code> in your browser - it should return JSON data</li>
                  <li>Check your site's permalink settings (Settings → Permalinks) - they should not be set to "Plain"</li>
                  <li>Make sure your web server properly handles OPTIONS requests (for CORS preflight)</li>
                </ol>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs flex items-start">
                  <Info className="h-3 w-3 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>The WordPress REST API is required for media uploads. If it's disabled by a security plugin or server configuration, you'll need to enable it.</span>
                </div>
              </div>
            </div>
          </li>
          
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <FileJson className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 5: Test with WordPress REST API Directly</h6>
                <p className="text-sm mb-2">Test if your credentials work with the WordPress REST API:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Try accessing <code>{'{your-site-url}'}/wp-json/wp/v2/media</code> with your credentials</li>
                  <li>Use a tool like Postman to test the API endpoints with your credentials</li>
                  <li>Try a simple GET request first to see if authentication works</li>
                  <li>Then try a POST request to the media endpoint to test upload permissions</li>
                </ol>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs flex items-start">
                  <Info className="h-3 w-3 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>Testing with an API client like Postman can help isolate whether the issue is with your credentials or with the app itself.</span>
                </div>
              </div>
            </div>
          </li>
          
          <li className="p-3 border rounded-md bg-muted/30">
            <div className="flex items-start">
              <Database className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h6 className="font-medium">Option 6: Check WordPress Database Permissions</h6>
                <p className="text-sm mb-2">Verify that WordPress can write to the database and file system:</p>
                <ol className="list-decimal list-inside ml-4 text-sm space-y-1 text-muted-foreground">
                  <li>Check if you can upload media through the WordPress dashboard</li>
                  <li>Verify that your uploads directory is writable</li>
                  <li>Try creating a post manually to see if that works</li>
                  <li>Check your WordPress error logs for any database permission issues</li>
                </ol>
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-xs flex items-start">
                  <AlertCircle className="h-3 w-3 text-amber-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span>If you can't upload media through the WordPress dashboard either, it might be a file system permission issue rather than an API permission issue.</span>
                </div>
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
        
        <div className="mt-3 p-3 border rounded-md bg-green-50 dark:bg-green-950">
          <h6 className="font-medium flex items-center text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Test Your Credentials
          </h6>
          <p className="text-sm mt-1 text-green-700 dark:text-green-400">
            After updating your credentials, always test the connection to verify media upload permissions.
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Link 
            to="/brand-logo-uploader?tab=config" 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            Return to Configuration
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
