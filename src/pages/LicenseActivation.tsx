import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, RefreshCw, Shield, Mail, User, KeyRound } from "lucide-react";
import { activateLicense, getLicenseInfo, isLicenseValid } from "@/utils/licenseManager";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LicenseActivation = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkExistingLicense = async () => {
      const valid = await isLicenseValid();
      if (valid) {
        navigate('/');
      }

      const attempts = localStorage.getItem('license_attempts');
      if (attempts) {
        const remaining = parseInt(attempts);
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          setIsLocked(true);
          setError('Too many failed attempts. Please contact the administrator.');
        }
      } else {
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

  const handleRegistrationAndActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast.error('License activation is locked. Please contact the administrator.');
      return;
    }

    if (!licenseKey || !email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    setIsActivating(true);
    setError('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username
          }
        }
      });

      if (signUpError) throw signUpError;

      const activated = await activateLicense(licenseKey);
      
      if (activated) {
        resetAttempts();
        toast.success('Account created and license activated successfully!');
        toast.info('Please check your email to verify your account.');
        navigate('/');
      } else {
        decreaseAttempts();
        setError(`License activation failed. Please check your license key. ${attemptsLeft > 1 ? `${attemptsLeft - 1} attempts remaining.` : 'This is your last attempt.'}`);
      }
    } catch (error) {
      decreaseAttempts();
      setError(`Registration or activation error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      console.error('Registration/Activation error:', error);
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
            <CardTitle className="text-center text-xl md:text-2xl">Register & Activate</CardTitle>
            <CardDescription className="text-center text-sm md:text-base">
              {isLocked 
                ? 'Account locked due to too many failed attempts' 
                : 'Create your account and activate your license'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistrationAndActivation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLocked || isActivating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLocked || isActivating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLocked || isActivating}
                  />
                </div>
              </div>

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
                type="submit"
                disabled={isActivating || isLocked}
                size="lg"
                variant={isLocked ? "destructive" : "default"}
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isLocked ? (
                  'Account Locked'
                ) : (
                  'Register & Activate License'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            {isLocked && (
              <p className="text-sm text-center text-red-600 dark:text-red-400">
                Please contact the administrator to receive a valid license key or unlock your account
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Already have an account? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>Login here</Button>
            </p>
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
