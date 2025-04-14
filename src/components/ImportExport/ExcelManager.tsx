
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { downloadTemplate } from "@/utils/excelService";

const ExcelManager = () => {
  const [importType, setImportType] = useState<'products' | 'brands' | 'categories'>('products');
  const [exportType, setExportType] = useState<'products' | 'brands' | 'categories'>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an Excel file
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    setUploading(true);
    
    try {
      // In a real app, this would use the importFromExcel function
      // For this demo, we'll just simulate the import
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully imported data from ${selectedFile.name}`);
      setSelectedFile(null);
      
      // Clear the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleExport = () => {
    // In a real app, this would use the exportToExcel function
    // For this demo, we'll just show a success message
    toast.success(`Exporting ${exportType}...`);
    
    // Simulate export delay
    setTimeout(() => {
      toast.success(`${exportType} exported successfully!`);
    }, 1500);
  };
  
  const handleDownloadTemplate = () => {
    downloadTemplate(importType);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground">Manage your data with Excel</p>
      </div>
      
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import from Excel</TabsTrigger>
          <TabsTrigger value="export">Export to Excel</TabsTrigger>
        </TabsList>
        
        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Data from Excel</CardTitle>
              <CardDescription>
                Upload an Excel file to import data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure your Excel file follows the required template format. 
                  Download the template below if needed.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="import-type">Import Type</Label>
                <Select 
                  value={importType} 
                  onValueChange={(value: 'products' | 'brands' | 'categories') => setImportType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select what to import" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="brands">Brands</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Excel File</Label>
                <div className="grid gap-2">
                  <Input 
                    id="file-upload" 
                    type="file" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Template
                </Button>
                
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || uploading}
                  className="gap-2"
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  {uploading ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Export Tab */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data to Excel</CardTitle>
              <CardDescription>
                Export your data to an Excel file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-type">Export Type</Label>
                <Select 
                  value={exportType} 
                  onValueChange={(value: 'products' | 'brands' | 'categories') => setExportType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select what to export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="brands">Brands</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleExport} 
                className="gap-2 mt-2"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Export to Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExcelManager;
