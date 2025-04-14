
/**
 * Excel Service for importing and exporting data
 */
import * as XLSX from 'xlsx';
import { toast } from "sonner";

// Define templates for different export types
const TEMPLATES = {
  products: [
    'product_id', 'product_title', 'sku', 'regular_price', 'sale_price', 
    'stock_quantity', 'short_description', 'description', 'categories', 
    'tags', 'brand_name', 'image_url', 'gallery_urls', 'meta_title', 
    'meta_description', 'focus_keyword'
  ],
  brands: [
    'id', 'name', 'slug', 'description', 'image_url', 
    'meta_title', 'meta_description', 'focus_keyword'
  ],
  categories: [
    'id', 'name', 'slug', 'description', 'parent', 'image_url', 
    'meta_title', 'meta_description', 'focus_keyword'
  ]
};

// Export data to Excel
export const exportToExcel = (data: any[], type: 'products' | 'brands' | 'categories'): void => {
  try {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));
    
    // Generate filename with timestamp
    const fileName = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write to file and trigger download
    XLSX.writeFile(workbook, fileName);
    toast.success(`${type} exported successfully`);
  } catch (error) {
    console.error('Excel export error:', error);
    toast.error(`Excel export failed: ${error.message}`);
  }
};

// Import data from Excel
export const importFromExcel = async (file: File, type: 'products' | 'brands' | 'categories'): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            toast.error('Excel file is empty');
            reject(new Error('Excel file is empty'));
            return;
          }
          
          // Validate required columns
          const requiredColumns = TEMPLATES[type];
          const headerRow = Object.keys(jsonData[0]);
          
          const missingColumns = requiredColumns.filter(col => !headerRow.includes(col));
          if (missingColumns.length > 0) {
            toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
            reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
            return;
          }
          
          toast.success(`Imported ${jsonData.length} ${type}`);
          resolve(jsonData);
        } catch (error) {
          console.error('Excel parsing error:', error);
          toast.error(`Excel parsing failed: ${error.message}`);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        toast.error('File reading failed');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Excel import error:', error);
      toast.error(`Excel import failed: ${error.message}`);
      reject(error);
    }
  });
};

// Download template
export const downloadTemplate = (type: 'products' | 'brands' | 'categories'): void => {
  try {
    // Create empty row with all columns
    const template = [
      TEMPLATES[type].reduce((obj, key) => {
        obj[key] = '';
        return obj;
      }, {})
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    XLSX.writeFile(workbook, `${type}_template.xlsx`);
    toast.success(`${type} template downloaded`);
  } catch (error) {
    console.error('Template download error:', error);
    toast.error(`Template download failed: ${error.message}`);
  }
};

export default {
  exportToExcel,
  importFromExcel,
  downloadTemplate
};
