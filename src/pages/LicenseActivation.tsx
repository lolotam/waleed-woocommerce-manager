
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, RefreshCw, Shield } from "lucide-react";
import { activateLicense, getLicenseInfo, isLicenseValid } from "@/utils/licenseManager";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LicenseActivation = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLocked, setIsLocked] = useState(false);

  // Check if the app is already licensed
  useEffect(() => {
    const checkExistingLicense = async () => {
      const valid = await isLicenseValid();
      if (valid) {
        // If the app is already licensed, redirect to dashboard
        navigate('/');
      }

      // Check for remaining attempts
      const attempts = localStorage.getItem('license_attempts');
      if (attempts) {
        const remaining = parseInt(attempts);
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          setIsLocked(true);
          setError('Too many failed attempts. Please contact the administrator.');
        }
      } else {
        // Initialize attempts counter
        localStorage.setItem('license_attempts', '5');
      }
    };

    checkExistingLicense();
  }, [navigate]);

  const decreaseAttempts = () => {
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    localStorage.setItem('license_attempts', remaining.toString());
    
    if (remaining <= 0) {
      setIsLocked(true);
      setError('Too many failed attempts. Please contact the administrator.');
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(5);
    localStorage.setItem('license_attempts', '5');
    setIsLocked(false);
  };

  const handleActivation = async () => {
    if (isLocked) {
      toast.error('License activation is locked. Please contact the administrator.');
      return;
    }

    if (!licenseKey) {
      setError('Please enter a license key');
      return;
    }

    setIsActivating(true);
    setError('');

    try {
      const activated = await activateLicense(licenseKey);
      
      if (activated) {
        // Reset attempts on successful activation
        resetAttempts();
        toast.success('License successfully activated!');
        
        // Redirect to dashboard
        navigate('/');
      } else {
        decreaseAttempts();
        setError(`License activation failed. Please check your license key. ${attemptsLeft > 1 ? `${attemptsLeft - 1} attempts remaining.` : 'This is your last attempt.'}`);
      }
    } catch (error) {
      decreaseAttempts();
      setError(`An error occurred during activation. ${attemptsLeft > 1 ? `${attemptsLeft - 1} attempts remaining.` : 'This is your last attempt.'}`);
      console.error('Activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Waleed Smart WooCommerce</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">AI-powered WooCommerce management</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              {isLocked ? (
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              ) : (
                <LockKeyhole className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              )}
            </div>
            <CardTitle className="text-center text-xl md:text-2xl">License Activation</CardTitle>
            <CardDescription className="text-center text-sm md:text-base">
              {isLocked 
                ? 'Account locked due to too many failed attempts' 
                : 'Enter your license key to activate the application'}
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
                  className="text-base md:text-base"
                  disabled={isLocked || isActivating}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!isLocked && attemptsLeft < 5 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Warning: {attemptsLeft} activation {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )}
              </div>
              
              <Button 
                className="w-full text-base" 
                onClick={handleActivation}
                disabled={isActivating || isLocked}
                size="lg"
                variant={isLocked ? "destructive" : "default"}
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : isLocked ? (
                  'Activation Locked'
                ) : (
                  'Activate License'
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            {isLocked && (
              <p className="text-sm text-center text-red-600 dark:text-red-400">
                Please contact the administrator to receive a valid license key or unlock your account
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Waleed Mohamed. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LicenseActivation;
