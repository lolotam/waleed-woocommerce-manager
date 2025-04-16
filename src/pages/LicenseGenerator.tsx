
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Key, RefreshCw, Clock, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { generateLicenseKeys } from "@/utils/licenseKeyGenerator";

const LicenseGenerator = () => {
  const [licenseType, setLicenseType] = useState<'one_time' | 'time_limited' | 'permanent'>('one_time');
  const [quantity, setQuantity] = useState<number>(10);
  const [expiryDays, setExpiryDays] = useState<number>(1);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const keys = await generateLicenseKeys(licenseType, quantity, expiryDays);
      setGeneratedKeys(keys);
      toast.success(`Generated ${keys.length} ${licenseType.replace('_', ' ')} license keys`);
    } catch (error) {
      console.error('Error generating keys:', error);
      toast.error('Failed to generate license keys');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (generatedKeys.length === 0) {
      toast.error("No license keys to export");
      return;
    }

    // Create CSV content
    const csvContent = generatedKeys.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${licenseType}_licenses.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Licenses exported successfully");
  };

  const getLicenseIcon = () => {
    switch (licenseType) {
      case 'one_time':
        return <Key className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
      case 'time_limited':
        return <Clock className="h-6 w-6 text-orange-600 dark:text-orange-300" />;
      case 'permanent':
        return <Shield className="h-6 w-6 text-green-600 dark:text-green-300" />;
      default:
        return <Key className="h-6 w-6 text-blue-600 dark:text-blue-300" />;
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    let allKeys: string[] = [];
    
    try {
      // Generate 100 one-time licenses
      const oneTimeKeys = await generateLicenseKeys('one_time', 100, 0);
      
      // Generate 1000 time-limited licenses (1 day)
      const timeLimitedKeys = await generateLicenseKeys('time_limited', 1000, 1);
      
      // Generate 100 permanent licenses
      const permanentKeys = await generateLicenseKeys('permanent', 100, 0);
      
      allKeys = [...oneTimeKeys, ...timeLimitedKeys, ...permanentKeys];
      setGeneratedKeys(allKeys);
      
      toast.success(`Generated all requested license keys (${allKeys.length} total)`);
    } catch (error) {
      console.error('Error generating bulk keys:', error);
      toast.error('Failed to generate bulk license keys');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">License Key Generator</h1>
          <p className="text-muted-foreground mt-2">Generate license keys for Waleed Smart WooCommerce</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                {getLicenseIcon()}
              </div>
              <CardTitle className="text-center">Generate License Keys</CardTitle>
              <CardDescription className="text-center">
                Create license keys for your application
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license-type">License Type</Label>
                  <Select
                    value={licenseType}
                    onValueChange={(value) => setLicenseType(value as 'one_time' | 'time_limited' | 'permanent')}
                  >
                    <SelectTrigger id="license-type">
                      <SelectValue placeholder="Select License Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time Use</SelectItem>
                      <SelectItem value="time_limited">Time-Limited</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 10)}
                  />
                </div>
                
                {licenseType === 'time_limited' && (
                  <div className="space-y-2">
                    <Label htmlFor="expiry-days">Expiry (Days)</Label>
                    <Input
                      id="expiry-days"
                      type="number"
                      min="1"
                      max="365"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Keys'
                  )}
                </Button>
                
                <div className="border-t pt-4 mt-4">
                  <Button 
                    onClick={handleBulkGenerate} 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    disabled={isGenerating}
                  >
                    Generate All Requested Keys (1200 total)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will generate 100 one-time, 1000 time-limited (1 day), and 100 permanent licenses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Generated License Keys</CardTitle>
              <CardDescription>
                {generatedKeys.length ? `${generatedKeys.length} keys generated` : 'No keys generated yet'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto border rounded-md">
                {generatedKeys.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>License Key</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedKeys.slice(0, 50).map((key, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{key}</TableCell>
                        </TableRow>
                      ))}
                      {generatedKeys.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            And {generatedKeys.length - 50} more keys...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    Generate keys to see them here
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end pt-6">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={generatedKeys.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Waleed Mohamed. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseGenerator;
