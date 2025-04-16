
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, RefreshCw, KeyRound } from "lucide-react";
import { activateLicense } from "@/utils/licenseManager";
import { useNavigate, Link } from "react-router-dom";

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
                <Input
                  id="license-key"
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                />
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              Admin? <Link to="/license-generator" className="text-blue-600 hover:underline">Generate license keys</Link>
            </p>
          </CardFooter>
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
