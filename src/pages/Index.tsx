
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isLicenseValid } from '@/utils/licenseManager';
import { toast } from 'sonner';

const Index = () => {
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user has a valid license
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const valid = await isLicenseValid();
        setIsLicensed(valid);
      } catch (error) {
        console.error("License check error:", error);
        setIsLicensed(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLicense();
    
    // Check if we're returning from OAuth flow
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
            description: 'Please complete the authorization process in the popup window',
            duration: 8000
          });
          
          // Add info for popup blockers
          toast.info('If you don\'t see the authorization window', {
            description: 'Check for popup blockers or go back to the configuration page',
            action: {
              label: 'Go to Config',
              onClick: () => window.location.href = '/brand-logo-uploader?tab=config'
            },
            duration: 10000
          });
        } else {
          // Auth process has timed out, clean up
          localStorage.removeItem('wc_auth_in_progress');
        }
      } catch (e) {
        // Just ignore parsing errors
        localStorage.removeItem('wc_auth_in_progress');
      }
    }
  }, []);

  // Show loading state while checking license
  if (isLoading) {
    return null; // Show nothing while loading
  }

  // If not licensed, redirect to license page
  if (isLicensed === false) {
    return <Navigate to="/license" replace />;
  }

  // If licensed, redirect to dashboard
  if (isLicensed === true) {
    return <Navigate to="/brand-logo-uploader" replace />;
  }

  // Default fallback - should never reach here if state management is working correctly
  return null;
};

export default Index;
