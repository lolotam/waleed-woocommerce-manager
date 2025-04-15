
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isLicenseValid } from '@/utils/licenseManager';
import { toast } from 'sonner';

const Index = () => {
  // Check if we're returning from OAuth flow
  useEffect(() => {
    const authInProgress = localStorage.getItem('wc_auth_in_progress');
    if (authInProgress) {
      // Parse the auth data
      try {
        const authData = JSON.parse(authInProgress);
        const timestamp = authData.timestamp;
        const now = Date.now();
        
        // If auth started less than 5 minutes ago, show message
        if (now - timestamp < 5 * 60 * 1000) {
          toast.info('Waiting for WooCommerce authentication...', {
            description: 'Please complete the authorization in your browser'
          });
        }
      } catch (e) {
        // Just ignore parsing errors
      }
    }
    
    isLicenseValid();
  }, []);

  return <Navigate to="/brand-logo-uploader" replace />;
};

export default Index;
