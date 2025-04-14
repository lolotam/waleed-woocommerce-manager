
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isLicenseValid } from '@/utils/licenseManager';

const Index = () => {
  // Redirect to the appropriate page based on license status
  useEffect(() => {
    isLicenseValid();
  }, []);

  return <Navigate to="/" replace />;
};

export default Index;
