
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExcelUploader from "@/components/BulkSeo/ExcelUploader";
import PromptSettings from "@/components/BulkSeo/PromptSettings";
import ProductProcessing from "@/components/BulkSeo/ProductProcessing";
import CompletionProgress from "@/components/BulkSeo/CompletionProgress";
import { getAiConfig } from "@/utils/ai/config";
import PromptSelector from "@/components/BulkSeo/PromptSelector";
import { SavedPrompt } from "@/hooks/usePrompts";
import { Helmet } from "react-helmet";
import { useIsMobile } from "@/hooks/use-mobile";

const BulkProductSeoPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("gpt4o");
  const [prompt, setPrompt] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);
  const [productType, setProductType] = useState<string>("general");
  const [aiRole, setAiRole] = useState<string>("seo_expert");
  const isMobile = useIsMobile();

  // Load configs from settings
  useEffect(() => {
    const config = getAiConfig();
    // Set default provider based on which API key is available
    if (config.openaiApiKey) {
      setSelectedProvider("openai");
      setSelectedModel(config.defaultModel);
    } else if (config.claudeApiKey) {
      setSelectedProvider("anthropic");
      setSelectedModel("claude35_sonnet");
    } else if (config.geminiApiKey) {
      setSelectedProvider("google");
      setSelectedModel("gemini_pro");
    }

    // Set default model from config
    if (config.defaultModel) {
      setSelectedModel(config.defaultModel);
    }
  }, []);

  const handleProductsUploaded = (products: any[]) => {
    setUploadedProducts(products);
    if (products.length > 0) {
      setActiveTab("prompt");
    }
  };

  const handleStartProcessing = () => {
    if (!prompt || prompt.trim() === "") {
      return;
    }
    
    setProcessing(true);
    setActiveTab("processing");
  };

  const handlePromptSelected = (savedPrompt: SavedPrompt) => {
    setPrompt(savedPrompt.promptText);
    setProductType(savedPrompt.productType);
    setAiRole(savedPrompt.aiRole);
  };

  return (
    <div className="mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-2 md:px-6">
      <Helmet>
        <title>Bulk Product SEO Generator | WooCommerce AI Tools</title>
      </Helmet>
      
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Bulk Product SEO Generator</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Generate SEO content for multiple products using AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto flex overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <TabsTrigger 
            value="upload" 
            className="flex-1 md:flex-none text-sm md:text-base py-2"
          >
            Upload Products
          </TabsTrigger>
          <TabsTrigger 
            value="prompt" 
            className="flex-1 md:flex-none text-sm md:text-base py-2"
          >
            Configure Prompt
          </TabsTrigger>
          <TabsTrigger 
            value="processing" 
            className="flex-1 md:flex-none text-sm md:text-base py-2"
          >
            Processing
          </TabsTrigger>
          <TabsTrigger 
            value="results" 
            className="flex-1 md:flex-none text-sm md:text-base py-2"
          >
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Upload Product Data</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Upload an Excel file with product IDs, titles, and URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelUploader onProductsUploaded={handleProductsUploaded} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                <div>
                  <CardTitle className="text-lg md:text-xl">Configure AI Prompt</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Choose AI provider and enter the prompt for generating SEO content
                  </CardDescription>
                </div>
                <PromptSelector onPromptSelect={handlePromptSelected} />
              </div>
            </CardHeader>
            <CardContent>
              <PromptSettings 
                provider={selectedProvider}
                onProviderChange={setSelectedProvider}
                model={selectedModel}
                onModelChange={setSelectedModel}
                prompt={prompt}
                onPromptChange={setPrompt}
                onStartProcessing={handleStartProcessing}
                productsCount={uploadedProducts.length}
                productType={productType}
                onProductTypeChange={setProductType}
                aiRole={aiRole}
                onAiRoleChange={setAiRole}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Processing Products</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Generating SEO content for your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductProcessing 
                products={uploadedProducts}
                provider={selectedProvider}
                model={selectedModel}
                prompt={prompt}
                onComplete={(completed, failed) => {
                  setCompleted(completed);
                  setFailed(failed);
                  setProcessing(false);
                  setActiveTab("results");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Results</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Summary of SEO content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionProgress
                completed={completed}
                failed={failed}
                total={uploadedProducts.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkProductSeoPage;
