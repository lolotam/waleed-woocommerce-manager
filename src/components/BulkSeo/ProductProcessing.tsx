
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateContent } from "@/utils/aiService";
import { toast } from "sonner";
import { updateProductSeo } from "@/utils/api/productsApi";
import { AIModel } from "@/utils/ai/types"; // Correct import from types

interface ProductProcessingProps {
  products: any[];
  provider: string;
  model: string;
  prompt: string;
  onComplete: (completed: any[], failed: any[]) => void;
}

interface ProcessedProduct {
  id: number | string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

const ProductProcessing = ({ 
  products, 
  provider, 
  model, 
  prompt, 
  onComplete 
}: ProductProcessingProps) => {
  const [processedProducts, setProcessedProducts] = useState<ProcessedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);

  // Initialize product list
  useEffect(() => {
    const initialProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      status: 'pending' as const
    }));
    
    setProcessedProducts(initialProducts);
    setCurrentIndex(0);
    setIsProcessing(true);
    setCompleted([]);
    setFailed([]);
  }, [products]);

  // Process products one by one
  useEffect(() => {
    const processNextProduct = async () => {
      if (currentIndex >= products.length) {
        // All products processed
        setIsProcessing(false);
        onComplete(completed, failed);
        return;
      }

      const currentProduct = products[currentIndex];
      
      // Update status to processing
      setProcessedProducts(prev => 
        prev.map((p, i) => 
          i === currentIndex ? { ...p, status: 'processing' } : p
        )
      );

      try {
        // Prepare prompt with product data
        const productPrompt = prompt
          .replace(/{{id}}/g, currentProduct.id)
          .replace(/{{title}}/g, currentProduct.title)
          .replace(/{{url}}/g, currentProduct.url);

        // Generate content
        const result = await generateContent(productPrompt, model as AIModel);
        
        // Parse result as JSON
        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          throw new Error("Failed to parse AI response as JSON. Please check your prompt template.");
        }
        
        // Update product in WooCommerce
        try {
          await updateProductSeo(currentProduct.id, parsedResult);
          
          // Update status to completed
          setProcessedProducts(prev => 
            prev.map((p, i) => 
              i === currentIndex ? { 
                ...p, 
                status: 'completed',
                result: parsedResult
              } : p
            )
          );
          
          setCompleted(prev => [...prev, {
            id: currentProduct.id,
            title: currentProduct.title,
            result: parsedResult
          }]);
        } catch (updateError) {
          throw new Error(`Content generated but failed to update product: ${updateError.message}`);
        }
      } catch (error) {
        console.error(`Error processing product ${currentProduct.id}:`, error);
        
        // Update status to failed
        setProcessedProducts(prev => 
          prev.map((p, i) => 
            i === currentIndex ? { 
              ...p, 
              status: 'failed',
              error: error.message
            } : p
          )
        );
        
        setFailed(prev => [...prev, {
          id: currentProduct.id,
          title: currentProduct.title,
          error: error.message
        }]);
        
        toast.error(`Failed to process product "${currentProduct.title}": ${error.message}`);
      }
      
      // Move to next product
      setCurrentIndex(prev => prev + 1);
    };

    if (isProcessing && currentIndex < products.length) {
      processNextProduct();
    }
  }, [currentIndex, isProcessing, products, prompt, model, completed, failed, onComplete]);

  const progress = products.length > 0 
    ? Math.round((currentIndex / products.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Processing {currentIndex} of {products.length} products
          </span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <ScrollArea className="h-[400px] border rounded-md">
        <div className="p-4 space-y-2">
          {processedProducts.map((product, index) => (
            <div key={product.id} className="py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                  {product.status === 'processing' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <Badge variant="secondary">Processing</Badge>
                    </>
                  )}
                  {product.status === 'completed' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <Badge variant="default">Completed</Badge>
                    </>
                  )}
                  {product.status === 'failed' && (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <Badge variant="destructive">Failed</Badge>
                    </>
                  )}
                  <span className="font-medium">{product.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">ID: {product.id}</span>
              </div>
              
              {product.error && (
                <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
                  {product.error}
                </div>
              )}
              
              {index < processedProducts.length - 1 && <Separator className="mt-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductProcessing;
