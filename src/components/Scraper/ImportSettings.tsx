
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { productsApi, extractData, extractDataWithPagination } from "@/utils/api";
import { ScrapedProduct, ImportConfig, ImportMapping } from "@/types/scraper";
import { Upload, CheckCircle, RotateCw, Settings2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ImportSettingsProps {
  products: ScrapedProduct[];
}

const ImportSettings = ({ products }: ImportSettingsProps) => {
  const [importInProgress, setImportInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    field_mapping: [
      { source_field: "title", target_field: "name" },
      { source_field: "regular_price", target_field: "regular_price" },
      { source_field: "sale_price", target_field: "sale_price" },
      { source_field: "sku", target_field: "sku" },
      { source_field: "description", target_field: "description" },
      { source_field: "categories", target_field: "categories" },
      { source_field: "brand", target_field: "tags" },
    ],
    create_categories: true,
    create_tags: true,
    download_images: true,
    update_existing: false,
    batch_size: 10
  });
  
  const handleImport = async () => {
    if (products.length === 0) {
      toast.error("No products selected for import");
      return;
    }
    
    setImportInProgress(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    
    try {
      const selectedProducts = products.filter(p => p.selected);
      const batchSize = importConfig.batch_size;
      const batches = Math.ceil(selectedProducts.length / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, selectedProducts.length);
        const batch = selectedProducts.slice(start, end);
        
        // Process batch
        for (let j = 0; j < batch.length; j++) {
          try {
            // In a real implementation, this would call the WooCommerce API
            // For demo purposes, we'll simulate a successful import with a delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setSuccessCount(prev => prev + 1);
          } catch (error) {
            console.error("Import error:", error);
            setErrorCount(prev => prev + 1);
          }
          
          // Update overall progress
          const currentProgress = Math.round(
            ((i * batchSize + j + 1) / selectedProducts.length) * 100
          );
          setProgress(currentProgress);
        }
      }
      
      toast.success(`Successfully imported ${successCount} products`);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Import failed: " + (error as Error).message);
    } finally {
      setImportInProgress(false);
    }
  };
  
  const handleFieldMappingChange = (index: number, field: 'source_field' | 'target_field', value: string) => {
    const newMapping = [...importConfig.field_mapping];
    newMapping[index] = {
      ...newMapping[index],
      [field]: value
    };
    
    setImportConfig({
      ...importConfig,
      field_mapping: newMapping
    });
  };
  
  const handleAddMapping = () => {
    setImportConfig({
      ...importConfig,
      field_mapping: [
        ...importConfig.field_mapping,
        { source_field: "", target_field: "" }
      ]
    });
  };
  
  const handleRemoveMapping = (index: number) => {
    const newMapping = [...importConfig.field_mapping];
    newMapping.splice(index, 1);
    
    setImportConfig({
      ...importConfig,
      field_mapping: newMapping
    });
  };
  
  const handleSaveConfig = () => {
    // In a real implementation, this would save the config to localStorage or a server
    toast.success("Import configuration saved");
  };
  
  const sourceFields = [
    "title", "regular_price", "sale_price", "sku", "description", 
    "short_description", "categories", "tags", "brand", "image_url", "gallery_urls"
  ];
  
  const targetFields = [
    "name", "regular_price", "sale_price", "sku", "description", 
    "short_description", "categories", "tags", "images"
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Import Settings
          </CardTitle>
          <CardDescription>
            Configure how products will be imported to WooCommerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Field Mapping</h3>
            <p className="text-sm text-muted-foreground">
              Map scraped data fields to WooCommerce product fields
            </p>
            
            {importConfig.field_mapping.map((mapping, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select 
                  value={mapping.source_field}
                  onValueChange={(value) => handleFieldMappingChange(index, 'source_field', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Source field" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceFields.map(field => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-muted-foreground">→</span>
                
                <Select 
                  value={mapping.target_field}
                  onValueChange={(value) => handleFieldMappingChange(index, 'target_field', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Target field" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetFields.map(field => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveMapping(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" size="sm" onClick={handleAddMapping}>
              + Add Field Mapping
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Import Options</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="create-categories">Create Missing Categories</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create categories if they don't exist
                  </p>
                </div>
                <Switch
                  id="create-categories"
                  checked={importConfig.create_categories}
                  onCheckedChange={(checked) => 
                    setImportConfig({...importConfig, create_categories: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="create-tags">Create Tags</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create tags from brand names and other attributes
                  </p>
                </div>
                <Switch
                  id="create-tags"
                  checked={importConfig.create_tags}
                  onCheckedChange={(checked) => 
                    setImportConfig({...importConfig, create_tags: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="download-images">Download Images</Label>
                  <p className="text-xs text-muted-foreground">
                    Download and upload images to your WooCommerce media library
                  </p>
                </div>
                <Switch
                  id="download-images"
                  checked={importConfig.download_images}
                  onCheckedChange={(checked) => 
                    setImportConfig({...importConfig, download_images: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="update-existing">Update Existing Products</Label>
                  <p className="text-xs text-muted-foreground">
                    Update products if they already exist (matched by SKU)
                  </p>
                </div>
                <Switch
                  id="update-existing"
                  checked={importConfig.update_existing}
                  onCheckedChange={(checked) => 
                    setImportConfig({...importConfig, update_existing: checked})
                  }
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Batch Processing</h3>
            
            <div className="flex items-center space-x-4">
              <Label htmlFor="batch-size" className="flex-shrink-0">
                Products per batch:
              </Label>
              <Input
                id="batch-size"
                type="number"
                className="w-24"
                value={importConfig.batch_size}
                onChange={(e) => setImportConfig({
                  ...importConfig, 
                  batch_size: Math.max(1, parseInt(e.target.value) || 1)
                })}
                min={1}
                max={50}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Smaller batches are more reliable but take longer to process.
            </p>
          </div>
          
          {importInProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Importing products...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{successCount} successful</span>
                {errorCount > 0 && (
                  <span className="text-red-600">{errorCount} failed</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSaveConfig}>
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={importInProgress || products.filter(p => p.selected).length === 0}
          >
            {importInProgress ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImportSettings;
