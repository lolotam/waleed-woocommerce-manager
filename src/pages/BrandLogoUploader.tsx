
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandLogoConfig from "@/components/BrandLogo/BrandLogoConfig";
import BrandLogoUpload from "@/components/BrandLogo/BrandLogoUpload";
import BrandLogoMapping from "@/components/BrandLogo/BrandLogoMapping";
import BrandLogoProcessing from "@/components/BrandLogo/BrandLogoProcessing";
import { BrandLogoConfigType, ProcessedItem } from "@/types/brandLogo";
import { mediaApi } from "@/utils/api";

const BrandLogoUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [processTracking, setProcessTracking] = useState<{
    success: number;
    failed: number;
    total: number;
  }>({ success: 0, failed: 0, total: 0 });
  
  const [config, setConfig] = useState<BrandLogoConfigType>({
    targetType: "brands", // brands or categories
    addToDescription: false,
    fuzzyMatching: true,
    saveConfigurations: true,
    allowFolderUpload: true
  });
  
  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('brand_logo_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({...prev, ...parsedConfig}));
      } catch (error) {
        console.error("Error loading saved configuration:", error);
      }
    }
  }, []);
  
  const handleFilesAdded = (files: File[]) => {
    setUploadedFiles(prev => {
      // Filter out any duplicates
      const existingFileNames = new Set(prev.map(f => f.name));
      const uniqueNewFiles = files.filter(file => !existingFileNames.has(file.name));
      
      if (uniqueNewFiles.length < files.length) {
        toast.info(`${files.length - uniqueNewFiles.length} duplicate files were skipped`);
      }
      
      return [...prev, ...uniqueNewFiles];
    });
    
    // Generate initial mappings based on filenames
    const newMappings = {...mappings};
    files.forEach(file => {
      const name = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
      // Don't overwrite existing mappings
      if (!newMappings[file.name]) {
        newMappings[file.name] = name;
      }
    });
    setMappings(newMappings);
  };
  
  const handleUpdateMapping = (filename: string, brandName: string) => {
    setMappings(prev => ({
      ...prev,
      [filename]: brandName
    }));
  };
  
  const handleRemoveFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== filename));
    setMappings(prev => {
      const newMappings = {...prev};
      delete newMappings[filename];
      return newMappings;
    });
    toast.info(`Removed ${filename}`);
  };
  
  const handleUpdateConfig = (newConfig: Partial<BrandLogoConfigType>) => {
    setConfig(prev => ({...prev, ...newConfig}));
  };
  
  const addLogEntry = (message: string) => {
    setProcessLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const handleStartProcessing = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files to process");
      return;
    }
    
    setIsProcessing(true);
    setProcessTracking({success: 0, failed: 0, total: uploadedFiles.length});
    setProcessLog([]);
    setProcessedItems([]);
    
    // Save configuration if enabled
    if (config.saveConfigurations) {
      localStorage.setItem('brand_logo_config', JSON.stringify(config));
    }
    
    addLogEntry(`Starting to process ${uploadedFiles.length} files`);
    
    try {
      // Process files one by one
      for (const file of uploadedFiles) {
        const targetName = mappings[file.name];
        
        try {
          addLogEntry(`Processing ${file.name} → ${targetName}`);
          
          // Track the file as pending
          const pendingItem: ProcessedItem = {
            filename: file.name,
            targetName,
            status: 'pending'
          };
          setProcessedItems(prev => [...prev, pendingItem]);
          
          // Call the API to upload and assign the logo
          await mediaApi.uploadAndAssignLogo(file, targetName, config.targetType, {
            addToDescription: config.addToDescription
          });
          
          setProcessTracking(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          
          // Update item status to success
          setProcessedItems(prev => 
            prev.map(item => 
              item.filename === file.name && item.status === 'pending'
                ? { ...item, status: 'success' }
                : item
            )
          );
          
          addLogEntry(`✅ Successfully processed ${file.name}`);
          toast.success(`Processed ${file.name}`);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          
          setProcessTracking(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          
          // Update item status to failed
          setProcessedItems(prev => 
            prev.map(item => 
              item.filename === file.name && item.status === 'pending'
                ? { 
                    ...item, 
                    status: 'failed',
                    message: error.message || 'Unknown error' 
                  }
                : item
            )
          );
          
          addLogEntry(`❌ Failed to process ${file.name}: ${error.message || 'Unknown error'}`);
          toast.error(`Failed to process ${file.name}: ${error.message || 'Unknown error'}`);
        }
      }
      
      addLogEntry(`Processing complete! ${processTracking.success} successful, ${processTracking.failed} failed`);
      toast.success(`Processing complete! ${processTracking.success} successful, ${processTracking.failed} failed`);
    } catch (error) {
      console.error("Processing error:", error);
      addLogEntry(`Processing failed: ${error.message || 'Unknown error'}`);
      toast.error(`Processing failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand Logo Uploader</h1>
        <p className="text-muted-foreground">
          Upload logo images and assign them to matching brands or categories
        </p>
      </div>
      
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="upload">Upload Logos</TabsTrigger>
          <TabsTrigger value="mapping">Brand Mapping</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure connection settings for your WooCommerce store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandLogoConfig 
                config={config} 
                onUpdateConfig={handleUpdateConfig} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Logo Files</CardTitle>
              <CardDescription>
                Upload PNG logo files to match with your brands or categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandLogoUpload
                files={uploadedFiles}
                onFilesAdded={handleFilesAdded}
                onRemoveFile={handleRemoveFile}
                allowFolderUpload={config.allowFolderUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Brand Name Mapping</CardTitle>
              <CardDescription>
                Match filenames to brand names in your WooCommerce store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandLogoMapping
                files={uploadedFiles}
                mappings={mappings}
                onUpdateMapping={handleUpdateMapping}
                targetType={config.targetType}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
              <CardDescription>
                Upload logos to your media library and assign them to brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandLogoProcessing
                files={uploadedFiles}
                mappings={mappings}
                isProcessing={isProcessing}
                processed={processTracking}
                onStartProcessing={handleStartProcessing}
                config={config}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandLogoUploader;
