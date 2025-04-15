
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { saveOAuthCredentials } from '@/utils/api/woocommerceAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const WooCommerceCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("WooCommerce callback page loaded");
    console.log("URL params:", window.location.search);
    
    const processCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const consumerKey = urlParams.get('consumer_key');
        const consumerSecret = urlParams.get('consumer_secret');
        const keyPermissions = urlParams.get('key_permissions');
        const error = urlParams.get('error');
        
        // Check for errors from WooCommerce
        if (error) {
          setStatus('error');
          setMessage('Authentication was denied or failed.');
          setErrorDetails(error);
          console.error('WooCommerce OAuth error:', error);
          return;
        }

        // Check if we have the required credentials
        if (!consumerKey || !consumerSecret) {
          setStatus('empty');
          setMessage('No authentication data received. The process may have been canceled.');
          console.error('Missing OAuth credentials in callback');
          return;
        }

        // Save the OAuth credentials
        const success = saveOAuthCredentials({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          key_permissions: keyPermissions || 'read_write'
        });

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! You can now use the Brand Logo Uploader.');
          
          // Get the return page or default to the config page
          const returnPage = localStorage.getItem('wc_auth_return_page') || '/brand-logo-uploader?tab=config';
          localStorage.removeItem('wc_auth_return_page');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate(returnPage);
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to save authentication credentials.');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Authentication error: ${error.message || 'Unknown error'}`);
      }
    };

    processCallback();
  }, [navigate]);

  const handleBackToConfig = () => {
    navigate('/brand-logo-uploader?tab=config');
  };
  
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'empty':
        return <AlertTriangle className="h-16 w-16 text-amber-500" />;
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>WooCommerce Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your authentication request...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication error'}
            {status === 'empty' && 'No authentication data received'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6">
            {getIcon()}
            
            <p className="mt-4 text-center">
              {message}
            </p>
            
            {errorDetails && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md text-sm text-red-700 dark:text-red-300">
                <p className="font-semibold">Error details:</p>
                <p>{errorDetails}</p>
              </div>
            )}
            
            {status === 'empty' && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-md text-sm">
                <p className="font-semibold">Possible reasons:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>You canceled the authentication</li>
                  <li>Your store doesn't have WooCommerce properly installed</li>
                  <li>You don't have administrator permissions</li>
                  <li>A security plugin is blocking the connection</li>
                </ul>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleBackToConfig} 
            className="w-full"
            variant={status === 'error' || status === 'empty' ? 'default' : 'outline'}
          >
            {status === 'error' || status === 'empty' ? 'Back to Configuration' : 'Return to App'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WooCommerceCallback;
