
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, Copy, Download, Check, Lock } from "lucide-react";
import { generateLicenseKeys } from "@/utils/licenseKeyGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isLicenseValid } from "@/utils/licenseManager";

const LicenseGenerator = () => {
  const navigate = useNavigate();
  const [licenseType, setLicenseType] = useState<'one_time' | 'time_limited' | 'permanent'>('one_time');
  const [quantity, setQuantity] = useState(1);
  const [expiryDays, setExpiryDays] = useState(30);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // The expected admin password - in a real app, this would be stored securely
  const ADMIN_PASSWORD = "admin123"; // This is just for demo purposes
  
  // Check if user is licensed
  useState(() => {
    const checkLicense = async () => {
      const valid = await isLicenseValid();
      if (!valid) {
        // If not licensed, redirect to license activation
        navigate('/license');
      }
    };
    
    checkLicense();
  });
  
  const authenticateAdmin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success("Administrator authenticated");
    } else {
      toast.error("Invalid administrator password");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const keys = await generateLicenseKeys(licenseType, quantity, expiryDays);
      setGeneratedKeys(keys);
      toast.success(`${quantity} license key${quantity > 1 ? 's' : ''} generated successfully`);
    } catch (error) {
      toast.error(`Error generating keys: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('License key copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const copyAllToClipboard = () => {
    const allKeys = generatedKeys.join('\n');
    navigator.clipboard.writeText(allKeys)
      .then(() => {
        toast.success('All license keys copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const downloadAsCSV = () => {
    const allKeys = generatedKeys.join('\n');
    const blob = new Blob([allKeys], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `license_keys_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('License keys downloaded as CSV');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-amber-100 dark:bg-amber-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <CardTitle className="text-center text-xl md:text-2xl">Administrator Authentication</CardTitle>
              <CardDescription className="text-center text-sm md:text-base">
                Enter the administrator password to access the license generator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Administrator Password</Label>
                  <Input 
                    id="admin-password"
                    type="password"
                    placeholder="Enter administrator password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="text-base md:text-base"
                  />
                </div>
                <Button 
                  className="w-full text-base" 
                  onClick={authenticateAdmin}
                  size="lg"
                >
                  Authenticate
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <KeyRound className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <CardTitle className="text-center text-xl md:text-2xl">License Key Generator</CardTitle>
            <CardDescription className="text-center text-sm md:text-base">
              Generate license keys to activate the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license-type">License Type</Label>
                  <Select 
                    value={licenseType} 
                    onValueChange={(value) => setLicenseType(value as 'one_time' | 'time_limited' | 'permanent')}
                  >
                    <SelectTrigger id="license-type">
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time License</SelectItem>
                      <SelectItem value="time_limited">Time-Limited License</SelectItem>
                      <SelectItem value="permanent">Permanent License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity ({quantity})</Label>
                  <Slider 
                    id="quantity" 
                    min={1} 
                    max={100} 
                    step={1} 
                    value={[quantity]} 
                    onValueChange={(value) => setQuantity(value[0])}
                  />
                </div>
                
                {licenseType === 'time_limited' && (
                  <div className="space-y-2">
                    <Label htmlFor="expiry-days">Expiry Period ({expiryDays} days)</Label>
                    <Slider 
                      id="expiry-days" 
                      min={1} 
                      max={365} 
                      step={1} 
                      value={[expiryDays]} 
                      onValueChange={(value) => setExpiryDays(value[0])}
                    />
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : `Generate ${quantity} Key${quantity > 1 ? 's' : ''}`}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="generated-keys">Generated Keys</Label>
                    {generatedKeys.length > 0 && (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyAllToClipboard}
                          title="Copy all keys"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={downloadAsCSV}
                          title="Download as CSV"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Textarea 
                    id="generated-keys" 
                    readOnly 
                    value={generatedKeys.join('\n')}
                    placeholder="Generated license keys will appear here"
                    className="h-48 font-mono text-sm"
                  />
                </div>
                
                {generatedKeys.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Individual Keys:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {generatedKeys.map((key, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 border rounded bg-gray-50 dark:bg-gray-800"
                        >
                          <code className="text-xs truncate">{key}</code>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(key)}
                            title="Copy key"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LicenseGenerator;
