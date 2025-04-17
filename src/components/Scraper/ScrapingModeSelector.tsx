
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Zap, Shield, Sparkles } from "lucide-react";

interface ScrapingModeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ScrapingModeSelector = ({ value, onChange }: ScrapingModeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Scraping Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scraping-mode">Select Scraping Mode</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="scraping-mode">
              <SelectValue placeholder="Select scraping mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" className="flex items-center">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  Auto (Recommended)
                </div>
              </SelectItem>
              <SelectItem value="simple">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Simple Request
                </div>
              </SelectItem>
              <SelectItem value="headless">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-blue-500" />
                  Headless Browser
                </div>
              </SelectItem>
              <SelectItem value="authenticated">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Authenticated Session
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md bg-muted p-3">
          <h4 className="text-sm font-medium mb-1">Mode Description:</h4>
          <p className="text-xs text-muted-foreground">
            {value === 'auto' && "Automatically selects the best mode based on the target website's characteristics"}
            {value === 'simple' && "Fast and lightweight, ideal for static websites without heavy JavaScript"}
            {value === 'headless' && "Uses a headless browser to render JavaScript and handle dynamic content"}
            {value === 'authenticated' && "Maintains session cookies and handles login for protected websites"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingModeSelector;
