
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileCode2, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CompletionProgressProps {
  completed: any[];
  failed: any[];
  total: number;
}

const CompletionProgress = ({ 
  completed, 
  failed,
  total 
}: CompletionProgressProps) => {
  const navigate = useNavigate();
  
  const exportResults = () => {
    try {
      // Create results object
      const results = {
        summary: {
          total,
          completed: completed.length,
          failed: failed.length,
          timestamp: new Date().toISOString()
        },
        completedItems: completed,
        failedItems: failed
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(results, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo_generation_results_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-muted-foreground">Total Products</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {completed.length}
              </div>
              <div className="text-green-600 dark:text-green-400">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={failed.length > 0 ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : ""}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className={`text-2xl font-bold flex items-center gap-2 ${failed.length > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                {failed.length > 0 && <XCircle className="h-5 w-5" />}
                {failed.length}
              </div>
              <div className={failed.length > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                Failed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="rounded-md border">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">SEO Generation Summary</h3>
          <Button variant="outline" size="sm" onClick={exportResults} className="gap-2">
            <FileCode2 className="h-4 w-4" />
            Export Results
          </Button>
        </div>
        
        <Separator />
        
        <div className="p-4">
          {completed.length > 0 ? (
            <p>
              Successfully updated {completed.length} products with new SEO content.
              {failed.length > 0 && ` ${failed.length} products failed to update.`}
            </p>
          ) : (
            <p className="text-muted-foreground">No products were successfully processed.</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/products")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        
        <Button onClick={() => window.location.reload()}>
          Process More Products
        </Button>
      </div>
    </div>
  );
};

export default CompletionProgress;
