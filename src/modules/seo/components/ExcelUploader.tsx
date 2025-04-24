
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileSpreadsheet, Upload, FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  onProductsUploaded: (products: any[]) => void;
}

const ExcelUploader = ({ onProductsUploaded }: ExcelUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            toast.error('Excel file is empty');
            setUploading(false);
            return;
          }
          
          // Validate required columns
          const requiredColumns = ['id', 'title', 'url'];
          const firstRow = jsonData[0] as Record<string, any>;
          const hasRequiredColumns = requiredColumns.every(col => 
            Object.keys(firstRow).map(k => k.toLowerCase()).includes(col.toLowerCase())
          );
          
          if (!hasRequiredColumns) {
            toast.error('Excel file must contain columns: id, title, url');
            setUploading(false);
            return;
          }
          
          // Process and normalize data
          const products = jsonData.map((row: any) => {
            // Find the actual column names regardless of case
            const idKey = Object.keys(row).find(k => k.toLowerCase() === 'id') || 'id';
            const titleKey = Object.keys(row).find(k => k.toLowerCase() === 'title') || 'title';
            const urlKey = Object.keys(row).find(k => k.toLowerCase() === 'url') || 'url';
            
            return {
              id: row[idKey],
              title: row[titleKey],
              url: row[urlKey],
            };
          });
          
          toast.success(`Loaded ${products.length} products from Excel file`);
          onProductsUploaded(products);
          
          // Clear file input
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          setSelectedFile(null);
        } catch (error) {
          console.error('Excel parsing error:', error);
          toast.error(`Excel parsing failed: ${error.message || 'Unknown error'}`);
        }
        
        setUploading(false);
      };
      
      reader.onerror = (error) => {
        toast.error('File reading failed');
        setUploading(false);
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('Excel upload error:', error);
      toast.error(`Excel upload failed: ${error.message || 'Unknown error'}`);
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create template with the required columns
      const template = [
        { id: '', title: '', url: '' }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(template);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      
      XLSX.writeFile(workbook, 'product_seo_template.xlsx');
      toast.success('Template downloaded');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error(`Template download failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Required Format</AlertTitle>
        <AlertDescription>
          Your Excel file must include columns for 'id', 'title', and 'url'.
          Download the template below for the correct format.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
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
          <FileSpreadsheet className="h-4 w-4" />
          Download Template
        </Button>
        
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Processing...' : 'Upload Products'}
        </Button>
      </div>
    </div>
  );
};

export default ExcelUploader;
