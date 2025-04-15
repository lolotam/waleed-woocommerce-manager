
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrapedProduct } from "@/types/scraper";
import { FileSpreadsheet, ArrowRight, Trash2, Edit, Check, X } from "lucide-react";
import { exportToExcel } from "@/utils/excelService";

interface DataManagerProps {
  scrapedProducts: ScrapedProduct[];
  setScrapedProducts: React.Dispatch<React.SetStateAction<ScrapedProduct[]>>;
  onImportProducts: (products: ScrapedProduct[]) => void;
}

const DataManager = ({ 
  scrapedProducts, 
  setScrapedProducts, 
  onImportProducts 
}: DataManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ScrapedProduct>>({});
  
  const handleSelectAll = (checked: boolean) => {
    setScrapedProducts(
      scrapedProducts.map(product => ({
        ...product,
        selected: checked
      }))
    );
  };
  
  const handleSelectProduct = (id: string, checked: boolean) => {
    setScrapedProducts(
      scrapedProducts.map(product => 
        product.id === id ? { ...product, selected: checked } : product
      )
    );
  };
  
  const handleDeleteSelected = () => {
    const selectedCount = scrapedProducts.filter(p => p.selected).length;
    if (!selectedCount) {
      toast.error("No products selected");
      return;
    }
    
    setScrapedProducts(scrapedProducts.filter(p => !p.selected));
    toast.success(`Deleted ${selectedCount} products`);
  };
  
  const handleEdit = (product: ScrapedProduct) => {
    setEditingProductId(product.id);
    setEditForm({ ...product });
  };
  
  const handleSaveEdit = () => {
    if (!editingProductId) return;
    
    setScrapedProducts(
      scrapedProducts.map(product => 
        product.id === editingProductId ? { ...product, ...editForm } : product
      )
    );
    
    setEditingProductId(null);
    setEditForm({});
    toast.success("Product updated");
  };
  
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm({});
  };
  
  const handleExportToExcel = () => {
    try {
      const selectedProducts = scrapedProducts.filter(p => p.selected);
      if (selectedProducts.length === 0) {
        toast.error("No products selected for export");
        return;
      }
      
      exportToExcel(selectedProducts, 'products');
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data: " + (error as Error).message);
    }
  };
  
  const handleContinue = () => {
    const selectedProducts = scrapedProducts.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to continue");
      return;
    }
    
    onImportProducts(selectedProducts);
  };
  
  const filteredProducts = scrapedProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedCount = scrapedProducts.filter(p => p.selected).length;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Manager</CardTitle>
          <CardDescription>
            Manage and edit scraped product data before importing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                checked={scrapedProducts.length > 0 && scrapedProducts.every(p => p.selected)}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All ({scrapedProducts.length})
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedCount === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedCount})
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportToExcel}
                disabled={selectedCount === 0}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </div>
          </div>
          
          <div>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox 
                          checked={product.selected} 
                          onCheckedChange={(checked) => 
                            handleSelectProduct(product.id!, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <Input 
                            value={editForm.title || ''} 
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          />
                        ) : (
                          product.title
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <div className="space-y-1">
                            <Input 
                              value={editForm.regular_price || ''} 
                              onChange={(e) => setEditForm({...editForm, regular_price: e.target.value})}
                              placeholder="Regular price"
                              className="w-24"
                            />
                            <Input 
                              value={editForm.sale_price || ''} 
                              onChange={(e) => setEditForm({...editForm, sale_price: e.target.value})}
                              placeholder="Sale price"
                              className="w-24"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">${product.regular_price}</div>
                            {product.sale_price && (
                              <div className="text-sm text-green-600">${product.sale_price}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <Input 
                            value={editForm.sku || ''} 
                            onChange={(e) => setEditForm({...editForm, sku: e.target.value})}
                          />
                        ) : (
                          product.sku || "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <Input 
                            value={editForm.categories?.join(', ') || ''} 
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              categories: e.target.value.split(',').map(c => c.trim())
                            })}
                          />
                        ) : (
                          product.categories?.join(', ') || "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <Input 
                            value={editForm.brand || ''} 
                            onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                          />
                        ) : (
                          product.brand || "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <div className="flex space-x-1">
                            <Button size="icon" variant="outline" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={handleCancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm ? "No matching products found" : "No products available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleContinue} disabled={selectedCount === 0}>
            Continue to Import
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataManager;
