
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ScrapingModeSelector from '../ScrapingModeSelector';
import ProxySettings from '../ProxySettings';
import { ScrapingOptions as ScrapingOptionsType } from '../types/scraperTypes';

interface ScrapingOptionsProps {
  options: ScrapingOptionsType;
  onOptionsChange: (options: Partial<ScrapingOptionsType>) => void;
}

const ScrapingOptions = ({ options, onOptionsChange }: ScrapingOptionsProps) => {
  return (
    <div className="space-y-6">
      <ScrapingModeSelector 
        value={options.mode} 
        onChange={(mode) => onOptionsChange({ mode })} 
      />
      
      <ProxySettings 
        enabled={options.useProxy}
        onEnabledChange={(enabled) => onOptionsChange({ useProxy: enabled })}
      />
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="category-page"
            checked={options.isCategory}
            onCheckedChange={(isCategory) => onOptionsChange({ isCategory })}
          />
          <Label htmlFor="category-page">This is a category page</Label>
        </div>
        
        {options.isCategory && (
          <div className="space-y-2 pl-6 border-l-2 border-blue-100 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Switch
                id="scrape-all"
                checked={options.scrapeAll}
                onCheckedChange={(scrapeAll) => onOptionsChange({ scrapeAll })}
              />
              <Label htmlFor="scrape-all">Scrape all products (including pagination)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="max-products">Maximum products:</Label>
              <Input
                id="max-products"
                type="number"
                className="w-24"
                value={options.maxProducts}
                onChange={(e) => onOptionsChange({ maxProducts: parseInt(e.target.value) })}
                min={1}
                max={1000}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapingOptions;
