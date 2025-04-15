
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { saveOAuthCredentials } from '@/utils/api/woocommerceAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const WooCommerceCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse the callback data from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const consumerKey = urlParams.get('consumer_key');
        const consumerSecret = urlParams.get('consumer_secret');
        const keyPermissions = urlParams.get('key_permissions');

        if (!consumerKey || !consumerSecret) {
          setStatus('error');
          setMessage('Authentication failed. Missing API credentials in the callback.');
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

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>WooCommerce Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your authentication request...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication error'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6">
            {status === 'loading' && <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
            
            <p className="mt-4 text-center">
              {message}
            </p>
          </div>
          
          <Button 
            onClick={handleBackToConfig} 
            className="w-full"
            variant={status === 'error' ? 'default' : 'outline'}
          >
            {status === 'error' ? 'Back to Configuration' : 'Return to App'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WooCommerceCallback;
