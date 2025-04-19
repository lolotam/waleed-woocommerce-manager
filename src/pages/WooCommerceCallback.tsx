
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { saveOAuthCredentials } from '@/utils/api/woocommerceAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

const WooCommerceCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'empty' | 'unauthorized'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Use ref to prevent multiple redirects
  const redirectAttempted = React.useRef(false);

  useEffect(() => {
    console.log("WooCommerce callback page loaded");
    console.log("URL params:", window.location.search);
    
    // Only process once
    if (redirectAttempted.current) return;
    
    const processCallback = async () => {
      try {
        // Get URL parameters
        const consumerKey = searchParams.get('consumer_key');
        const consumerSecret = searchParams.get('consumer_secret');
        const keyPermissions = searchParams.get('key_permissions');
        const error = searchParams.get('error');
        
        // Check for specific WooCommerce errors in the URL
        if (error) {
          setStatus('error');
          setMessage('Authentication was denied or failed.');
          setErrorDetails(error);
          console.error('WooCommerce OAuth error:', error);
          return;
        }

        // Check if we're in the access_denied or access_granted page without credentials
        if (window.location.href.includes('access_denied')) {
          setStatus('unauthorized');
          setMessage('Access was denied by the store administrator.');
          setErrorDetails('The store administrator did not approve the connection request.');
          console.error('OAuth access denied by store admin');
          return;
        }

        if (window.location.href.includes('access_granted') && (!consumerKey || !consumerSecret)) {
          setStatus('unauthorized');
          setMessage('Authentication failed: Unauthorized access');
          setErrorDetails('The store granted access but did not provide valid credentials. This could be due to WooCommerce API restriction settings.');
          console.error('OAuth access_granted but no credentials provided');
          return;
        }

        // Check if we have the required credentials
        if (!consumerKey || !consumerSecret) {
          setStatus('empty');
          setMessage('No authentication data received. The process may have been canceled or blocked.');
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
          
          // Redirect after a short delay - but only once
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            setTimeout(() => {
              navigate(returnPage, { replace: true });
            }, 2000);
          }
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
  }, [navigate, searchParams]);

  const handleBackToConfig = () => {
    // Use replace instead of push to prevent adding to history
    navigate('/brand-logo-uploader?tab=config', { replace: true });
  };
  
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'unauthorized':
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
            {status === 'unauthorized' && 'Authentication denied'}
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
            
            {status === 'unauthorized' && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md text-sm">
                <p className="font-semibold">For store administrators:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Make sure you are logged in as an administrator on your WordPress site</li>
                  <li>Verify that WooCommerce REST API is enabled in WooCommerce → Settings → Advanced</li>
                  <li>Check that your user has permission to manage WooCommerce</li>
                  <li>Try logging out and back in to WordPress before authorizing</li>
                </ul>
              </div>
            )}
            
            {(status === 'empty' || status === 'error' || status === 'unauthorized') && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-md text-sm">
                <p className="font-semibold">Troubleshooting suggestions:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Check if your store has WooCommerce REST API enabled</li>
                  <li>Ensure you're logged in as an administrator on your WordPress site</li>
                  <li>Try clearing browser cookies and cache</li>
                  <li>Disable any security plugins temporarily that might block the API</li>
                  <li>Check if your site uses HTTPS with a valid SSL certificate</li>
                  <li>Verify that WooCommerce is properly installed and activated</li>
                  <li>Try using the "Consumer Keys" authentication method instead</li>
                </ul>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleBackToConfig} 
            className="w-full"
            variant={status === 'error' || status === 'empty' || status === 'unauthorized' ? 'default' : 'outline'}
          >
            {status === 'error' || status === 'empty' || status === 'unauthorized' ? 'Back to Configuration' : 'Return to App'}
          </Button>
          
          {(status === 'error' || status === 'unauthorized') && (
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => window.open('https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View WooCommerce API Documentation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WooCommerceCallback;
