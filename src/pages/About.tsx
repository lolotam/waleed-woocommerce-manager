
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Github, Globe, Heart, Code, CalendarClock } from "lucide-react";
import { getLicenseInfo } from "@/utils/licenseManager";
import { useEffect, useState } from "react";

const About = () => {
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [hardwareId, setHardwareId] = useState<string>('');
  
  useEffect(() => {
    const info = getLicenseInfo();
    setLicenseInfo(info);
    
    if (info) {
      setHardwareId(info.deviceId);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground">Application information and developer contact</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>Details about this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Application Name</h3>
              <p className="text-muted-foreground">Waleed Smart WooCommerce</p>
            </div>
            
            <div>
              <h3 className="font-medium">Version</h3>
              <p className="text-muted-foreground">1.0.0</p>
            </div>
            
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-muted-foreground">
                AI-powered WooCommerce management web application with product, brand, and category management.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span>Visit Website</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Developer Information</CardTitle>
            <CardDescription>Contact details for the developer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Developer</h3>
              <p className="text-muted-foreground">Waleed Mohamed</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href="mailto:dr.vet.waleedtam@gmail.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                dr.vet.waleedtam@gmail.com
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href="tel:+96555683677" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                +96555683677
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>License Information</CardTitle>
            <CardDescription>Details about your license</CardDescription>
          </CardHeader>
          <CardContent>
            {licenseInfo ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="font-medium">License Type</h3>
                  <p className="text-muted-foreground capitalize">{licenseInfo.type} License</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Active</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Activation Date</h3>
                  <p className="text-muted-foreground">
                    {new Date(licenseInfo.activationDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="md:col-span-3">
                  <h3 className="font-medium">Device ID</h3>
                  <p className="text-muted-foreground text-sm break-all font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                    {hardwareId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No license information available.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/license'}>
                  Activate License
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="border-t pt-6 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Heart className="h-3 w-3 text-red-500" />
          <span>Made with love by Waleed Mohamed</span>
          <Code className="h-3 w-3 ml-1" />
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>&copy; {new Date().getFullYear()} All rights reserved</span>
        </p>
      </div>
    </div>
  );
};

export default About;
