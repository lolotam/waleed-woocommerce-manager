
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandLogoConfigProps } from "@/types/brandLogo";

const BrandLogoConfig = ({ config, onUpdateConfig }: BrandLogoConfigProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="target-type">Target Taxonomy</Label>
        <Select 
          value={config.targetType} 
          onValueChange={(value: "brands" | "categories") => onUpdateConfig({ targetType: value })}
        >
          <SelectTrigger id="target-type">
            <SelectValue placeholder="Select target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brands">Product Brands</SelectItem>
            <SelectItem value="categories">Product Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="add-description">Add to Description</Label>
          <p className="text-sm text-muted-foreground">
            Include logo in the brand/category description
          </p>
        </div>
        <Switch
          id="add-description"
          checked={config.addToDescription}
          onCheckedChange={(checked) => onUpdateConfig({ addToDescription: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="fuzzy-matching">Fuzzy Name Matching</Label>
          <p className="text-sm text-muted-foreground">
            Use fuzzy matching for special characters and spacing
          </p>
        </div>
        <Switch
          id="fuzzy-matching"
          checked={config.fuzzyMatching}
          onCheckedChange={(checked) => onUpdateConfig({ fuzzyMatching: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="save-config">Save Configuration</Label>
          <p className="text-sm text-muted-foreground">
            Remember settings between sessions
          </p>
        </div>
        <Switch
          id="save-config"
          checked={config.saveConfigurations}
          onCheckedChange={(checked) => onUpdateConfig({ saveConfigurations: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="allow-folder">Allow Folder Upload</Label>
          <p className="text-sm text-muted-foreground">
            Enable uploading entire folders of logos
          </p>
        </div>
        <Switch
          id="allow-folder"
          checked={config.allowFolderUpload}
          onCheckedChange={(checked) => onUpdateConfig({ allowFolderUpload: checked })}
        />
      </div>
    </div>
  );
};

export default BrandLogoConfig;
