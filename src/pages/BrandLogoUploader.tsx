import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings } from "lucide-react";
import BrandLogoUpload from "@/components/BrandLogo/BrandLogoUpload";
import BrandLogoMapping from "@/components/BrandLogo/BrandLogoMapping";
import BrandLogoProcessing from "@/components/BrandLogo/BrandLogoProcessing";
import BrandLogoConfig from "@/components/BrandLogo/BrandLogoConfig";
import { BrandLogoConfigType, ProcessedItem } from "@/types/brandLogo";
import { mediaApi } from "@/utils/api";
import { getWooCommerceConfig } from "@/utils/api/woocommerceCore";
import { useNavigate, useLocation } from "react-router-dom";

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
  
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isConfigured, setIsConfigured] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lastNavigationTime, setLastNavigationTime] = useState(0);
  
  useEffect(() => {
    const wcConfig = getWooCommerceConfig();
    const isConfigValid = Boolean(
      (wcConfig.authMethod === 'app_password' && wcConfig.wpUsername && wcConfig.wpAppPassword) ||
      (wcConfig.authMethod === 'consumer_keys' && wcConfig.consumerKey && wcConfig.consumerSecret) ||
      (wcConfig.authMethod === 'oauth' && wcConfig.consumerKey && wcConfig.consumerSecret)
    ) && Boolean(wcConfig.url);
    
    setIsConfigured(isConfigValid);
    
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['upload', 'mapping', 'processing'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!isConfigValid) {
      setActiveTab('upload');
    }
    
    const savedConfig = localStorage.getItem('brand_logo_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({
          ...prev, 
          targetType: parsedConfig.targetType || prev.targetType,
          addToDescription: parsedConfig.addToDescription !== undefined ? parsedConfig.addToDescription : prev.addToDescription,
          fuzzyMatching: parsedConfig.fuzzyMatching !== undefined ? parsedConfig.fuzzyMatching : prev.fuzzyMatching,
          saveConfigurations: parsedConfig.saveConfigurations !== undefined ? parsedConfig.saveConfigurations : prev.saveConfigurations,
          allowFolderUpload: parsedConfig.allowFolderUpload !== undefined ? parsedConfig.allowFolderUpload : prev.allowFolderUpload
        }));
      } catch (error) {
        console.error("Error loading saved configuration:", error);
      }
    }
  }, [location.search]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const now = Date.now();
    if (now - lastNavigationTime > 300) {
      navigate(`/brand-logo-uploader?tab=${value}`, { replace: true });
      setLastNavigationTime(now);
    }
  };
  
  const handleFilesAdded = (files: File[]) => {
    setUploadedFiles(prev => {
      const existingFileNames = new Set(prev.map(f => f.name));
      const uniqueNewFiles = files.filter(file => !existingFileNames.has(file.name));
      
      if (uniqueNewFiles.length < files.length) {
        toast.info(`${files.length - uniqueNewFiles.length} duplicate files were skipped`);
      }
      
      return [...prev, ...uniqueNewFiles];
    });
    
    const newMappings = {...mappings};
    files.forEach(file => {
      const name = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
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
    
    if (config.saveConfigurations) {
      const { targetType, addToDescription, fuzzyMatching, saveConfigurations, allowFolderUpload } = {
        ...config,
        ...newConfig
      };
      
      localStorage.setItem('brand_logo_config', JSON.stringify({
        targetType,
        addToDescription,
        fuzzyMatching,
        saveConfigurations,
        allowFolderUpload
      }));
    }
  };
  
  const handleStartProcessing = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files to process");
      return;
    }
    
    setIsProcessing(true);
    setProcessTracking({success: 0, failed: 0, total: uploadedFiles.length});
    
    if (config.saveConfigurations) {
      const { targetType, addToDescription, fuzzyMatching, saveConfigurations, allowFolderUpload } = config;
      localStorage.setItem('brand_logo_config', JSON.stringify({
        targetType,
        addToDescription,
        fuzzyMatching,
        saveConfigurations,
        allowFolderUpload
      }));
    }
    
    try {
      for (const file of uploadedFiles) {
        const targetName = mappings[file.name];
        
        try {
          const pendingItem: ProcessedItem = {
            filename: file.name,
            targetName,
            status: 'pending'
          };
          setProcessedItems(prev => [...prev, pendingItem]);
          
          const result = await mediaApi.uploadAndAssignLogo(file, targetName, config.targetType, {
            addToDescription: config.addToDescription,
            fuzzyMatching: config.fuzzyMatching
          });
          
          setProcessTracking(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          
          setProcessedItems(prev => 
            prev.map(item => 
              item.filename === file.name && item.status === 'pending'
                ? { ...item, status: 'success' }
                : item
            )
          );
          
          if (result.message && result.message.includes('matched from')) {
            toast.success(result.message);
          } else {
            toast.success(`Processed ${file.name}`);
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          
          setProcessTracking(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          
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
          
          toast.error(`Failed to process ${file.name}: ${error.message || 'Unknown error'}`);
        }
      }
      
      toast.success(`Processing complete! ${processTracking.success} successful, ${processTracking.failed} failed`);
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(`Processing failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logo Uploader</h1>
        <p className="text-muted-foreground">
          Upload logo images and assign them to matching brands or categories
        </p>
      </div>
      
      {!isConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>WooCommerce Configuration Required</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>WooCommerce connection not configured properly</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="ml-2"
            >
              <Settings className="mr-2 h-4 w-4" />
              Go to Settings
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Upload Settings</CardTitle>
          <CardDescription>Configure how logos are processed and uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandLogoConfig 
            config={config} 
            onUpdateConfig={handleUpdateConfig} 
          />
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Logos</TabsTrigger>
          <TabsTrigger value="mapping" disabled={uploadedFiles.length === 0}>Brand Mapping</TabsTrigger>
          <TabsTrigger value="processing" disabled={uploadedFiles.length === 0}>Processing</TabsTrigger>
        </TabsList>
        
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
      
      {activeTab !== 'config' && processTracking.failed > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication/Permission Issues</AlertTitle>
          <AlertDescription className="text-sm">
            <p>If you're seeing permission errors, check that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your WooCommerce user has Administrator privileges</li>
              <li>Your Application Username and Password have been created correctly</li>
              <li>Consumer Key and Secret have correct permissions</li>
              <li>The API is enabled in WooCommerce settings</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BrandLogoUploader;
