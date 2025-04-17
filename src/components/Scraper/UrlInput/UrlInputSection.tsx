
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import PlatformDetector from '../PlatformDetector';
import { ScraperPlatform } from '@/types/scraper';

interface UrlInputSectionProps {
  url: string;
  onUrlChange: (url: string) => void;
  onPlatformDetect: (platform: ScraperPlatform) => void;
}

const UrlInputSection = ({ url, onUrlChange, onPlatformDetect }: UrlInputSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Website URL</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            placeholder="https://example.com/products/..."
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <Button 
            variant="outline" 
            onClick={() => onUrlChange("")}
            disabled={!url}
            className="shrink-0"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <PlatformDetector url={url} onDetect={onPlatformDetect} />
    </div>
  );
};

export default UrlInputSection;
