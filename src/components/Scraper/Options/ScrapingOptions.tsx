
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Clock, RotateCw } from "lucide-react";
import ScrapingModeSelector from '../ScrapingModeSelector';
import ProxySettings from '../ProxySettings';
import { ScrapingOptions as ScrapingOptionsType, ScrapingMode } from '../types/scraperTypes';

interface ScrapingOptionsProps {
  options: ScrapingOptionsType;
  onOptionsChange: (options: Partial<ScrapingOptionsType>) => void;
}

const ScrapingOptions = ({ options, onOptionsChange }: ScrapingOptionsProps) => {
  return (
    <div className="space-y-6">
      <ScrapingModeSelector 
        value={options.mode} 
        onChange={(mode: ScrapingMode) => onOptionsChange({ mode })} 
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
            
            <div className="space-y-2 mt-2">
              <Label htmlFor="scroll-behavior" className="text-sm">Scroll Behavior:</Label>
              <div className="flex items-center space-x-4 pl-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="scroll-none" 
                    name="scrollBehavior" 
                    value="none"
                    checked={options.scrollBehavior === 'none'} 
                    onChange={() => onOptionsChange({ scrollBehavior: 'none' })}
                  />
                  <Label htmlFor="scroll-none" className="text-sm">Standard Pagination</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="scroll-bottom" 
                    name="scrollBehavior" 
                    value="bottom"
                    checked={options.scrollBehavior === 'bottom'} 
                    onChange={() => onOptionsChange({ scrollBehavior: 'bottom' })}
                  />
                  <Label htmlFor="scroll-bottom" className="text-sm">Scroll to Bottom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="scroll-infinite" 
                    name="scrollBehavior" 
                    value="infinite"
                    checked={options.scrollBehavior === 'infinite'} 
                    onChange={() => onOptionsChange({ scrollBehavior: 'infinite' })}
                  />
                  <Label htmlFor="scroll-infinite" className="text-sm">Infinite Scroll</Label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-amber-600" />
              Anti-Bot & Protection Handling
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bypass-protection"
                  checked={options.bypassProtection}
                  onCheckedChange={(bypassProtection) => onOptionsChange({ bypassProtection })}
                />
                <Label htmlFor="bypass-protection">Bypass bot protection (recommended for complex sites)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="emulate-user"
                  checked={options.emulateUser}
                  onCheckedChange={(emulateUser) => onOptionsChange({ emulateUser })}
                />
                <Label htmlFor="emulate-user">Emulate human-like behavior (random delays, mouse movements)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="retry-count">Max retries for failed pages:</Label>
                <Input
                  id="retry-count"
                  type="number"
                  className="w-16"
                  value={options.maxRetries}
                  onChange={(e) => onOptionsChange({ maxRetries: parseInt(e.target.value) })}
                  min={0}
                  max={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Request Timing
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="request-delay">Request Delay: {options.requestDelay}ms</Label>
                </div>
                <Slider
                  id="request-delay"
                  min={0}
                  max={5000}
                  step={100}
                  value={[options.requestDelay]}
                  onValueChange={([requestDelay]) => onOptionsChange({ requestDelay })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Faster (0ms)</span>
                  <span>Random (1-2s)</span>
                  <span>Safer (5s)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="random-delay"
                  checked={options.randomizeDelay}
                  onCheckedChange={(randomizeDelay) => onOptionsChange({ randomizeDelay })}
                />
                <Label htmlFor="random-delay">Use randomized delays between requests</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-2 border-t pt-3 mt-3 border-gray-200 dark:border-gray-800">
          <h3 className="font-medium text-sm">Performance & Cache</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-cache"
              checked={options.enableCache}
              onCheckedChange={(enableCache) => onOptionsChange({ enableCache })}
            />
            <Label htmlFor="enable-cache">Enable result caching (faster for repeated scrapes)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="concurrent-requests"
              checked={options.concurrentRequests > 1}
              onCheckedChange={(enabled) => onOptionsChange({ 
                concurrentRequests: enabled ? 3 : 1 
              })}
            />
            <Label htmlFor="concurrent-requests">
              Enable concurrent requests 
              {options.concurrentRequests > 1 && ` (${options.concurrentRequests})`}
            </Label>
          </div>
          
          {options.concurrentRequests > 1 && (
            <div className="pl-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="concurrent-count">Concurrent connections:</Label>
                <Input
                  id="concurrent-count"
                  type="number"
                  className="w-16"
                  value={options.concurrentRequests}
                  onChange={(e) => onOptionsChange({ 
                    concurrentRequests: parseInt(e.target.value) 
                  })}
                  min={1}
                  max={10}
                />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Warning: Higher values may trigger rate limiting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapingOptions;
