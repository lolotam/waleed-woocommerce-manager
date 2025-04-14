
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Key, RefreshCw } from "lucide-react";
import { activateLicense, generateSampleLicenseKey } from "@/utils/licenseManager";
import { useNavigate } from "react-router-dom";

const LicenseActivation = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');

  const handleActivation = async () => {
    if (!licenseKey) {
      setError('Please enter a license key');
      return;
    }

    setIsActivating(true);
    setError('');

    try {
      const activated = await activateLicense(licenseKey);
      
      if (activated) {
        // Redirect to dashboard
        navigate('/');
      } else {
        setError('License activation failed. Please check your license key.');
      }
    } catch (error) {
      setError('An error occurred during activation. Please try again.');
      console.error('Activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const generateDemoKey = (type: 'trial' | 'full') => {
    const key = generateSampleLicenseKey(type);
    setLicenseKey(key);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Waleed Smart WooCommerce</h1>
          <p className="text-muted-foreground mt-2">AI-powered WooCommerce management</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <LockKeyhole className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <CardTitle className="text-center">License Activation</CardTitle>
            <CardDescription className="text-center">
              Enter your license key to activate the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license-key">License Key</Label>
                <div className="flex">
                  <Input
                    id="license-key"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => generateDemoKey('full')}
                    title="Generate demo license key"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleActivation}
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate License'
                )}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  Don't have a license key?{' '}
                  <button 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => generateDemoKey('trial')}
                  >
                    Generate Trial Key
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Waleed Mohamed. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseActivation;
