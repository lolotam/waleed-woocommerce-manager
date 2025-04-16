
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExcelUploader from "@/components/BulkSeo/ExcelUploader";
import PromptSettings from "@/components/BulkSeo/PromptSettings";
import ProductProcessing from "@/components/BulkSeo/ProductProcessing";
import CompletionProgress from "@/components/BulkSeo/CompletionProgress";

const BulkProductSeoPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("gpt4o");
  const [prompt, setPrompt] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Product SEO Generator</h1>
        <p className="text-muted-foreground">
          Generate SEO content for multiple products using AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Products</TabsTrigger>
          <TabsTrigger value="prompt">Configure Prompt</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Product Data</CardTitle>
              <CardDescription>
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
              <CardTitle>Configure AI Prompt</CardTitle>
              <CardDescription>
                Choose AI provider and enter the prompt for generating SEO content
              </CardDescription>
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
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Products</CardTitle>
              <CardDescription>
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
              <CardTitle>Results</CardTitle>
              <CardDescription>
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
