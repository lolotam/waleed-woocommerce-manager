
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DownloadCloud, 
  Table, 
  FileJson, 
  FileSpreadsheet, 
  FileCheck, 
  Trash2, 
  Grid2X2, 
  Edit, 
  ExternalLink,
  ClipboardCheck
} from "lucide-react";
import { ScrapedProduct } from "@/types/scraper";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface DataManagerProps {
  scrapedProducts: ScrapedProduct[];
  setScrapedProducts: React.Dispatch<React.SetStateAction<ScrapedProduct[]>>;
  onImportProducts: (products: ScrapedProduct[]) => void;
}

const DataManager = ({ scrapedProducts, setScrapedProducts, onImportProducts }: DataManagerProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const handleSelectAll = () => {
    if (selectedIds.length === scrapedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scrapedProducts.map((product) => product.id || ""));
    }
  };
  
  const handleSelectProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleDeleteSelected = () => {
    setScrapedProducts(
      scrapedProducts.filter((product) => !selectedIds.includes(product.id || ""))
    );
    setSelectedIds([]);
    toast.success(`Deleted ${selectedIds.length} products`);
  };
  
  const filteredProducts = scrapedProducts.filter((product) => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categories?.some(category => category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all scraped products?")) {
      setScrapedProducts([]);
      setSelectedIds([]);
      toast.success("All products cleared");
    }
  };
  
  const exportToJson = () => {
    const productsToExport = selectedIds.length > 0
      ? scrapedProducts.filter((product) => selectedIds.includes(product.id || ""))
      : scrapedProducts;
    
    const dataStr = JSON.stringify(productsToExport, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileName = `scraped_products_${new Date().toISOString().split("T")[0]}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
    
    toast.success(`Exported ${productsToExport.length} products to JSON`);
  };
  
  const exportToCsv = () => {
    const productsToExport = selectedIds.length > 0
      ? scrapedProducts.filter((product) => selectedIds.includes(product.id || ""))
      : scrapedProducts;
    
    // Convert to CSV
    const headers = [
      "title", "regular_price", "sale_price", "sku", 
      "image_url", "categories", "brand", "description"
    ];
    
    let csvContent = headers.join(",") + "\n";
    
    productsToExport.forEach(product => {
      const row = [
        `"${(product.title || "").replace(/"/g, '""')}"`,
        `"${product.regular_price || ""}"`,
        `"${product.sale_price || ""}"`,
        `"${product.sku || ""}"`,
        `"${product.image_url || ""}"`,
        `"${(product.categories || []).join("|")}"`,
        `"${product.brand || ""}"`,
        `"${(product.description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scraped_products_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${productsToExport.length} products to CSV`);
  };
  
  const handleImport = () => {
    const selectedProducts = selectedIds.length > 0
      ? scrapedProducts.filter((product) => selectedIds.includes(product.id || ""))
      : scrapedProducts;
    
    onImportProducts(selectedProducts);
    toast.success(`${selectedProducts.length} products ready for import`);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  const getPlatformBadge = (platform?: string) => {
    if (!platform || platform === 'unknown') return null;
    
    const platformColors: Record<string, string> = {
      'woocommerce': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
      'shopify': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
      'amazon': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-300',
      'temu': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
      'shein': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-300',
      'aliexpress': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={platformColors[platform] || 'bg-gray-100 text-gray-800'}
      >
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-2 border-blue-100 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Table className="h-5 w-5" />
            Scraped Data Manager
          </CardTitle>
          <CardDescription>
            View, filter, and manage scraped product data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search by title, SKU, brand, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={viewMode === "table" ? "bg-blue-100 dark:bg-blue-800" : ""}
                  title="Table View"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-100 dark:bg-blue-800" : ""}
                  title="Grid View"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {scrapedProducts.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} products found
                    {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedIds.length === scrapedProducts.length ? "Deselect All" : "Select All"}
                    </Button>
                    {selectedIds.length > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteSelected}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected
                      </Button>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4 w-full md:w-auto">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="selected">Selected ({selectedIds.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    {viewMode === "table" ? (
                      <div className="rounded-md border overflow-hidden">
                        <UITable>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(product.id || "")}
                                    onChange={() => handleSelectProduct(product.id || "")}
                                    className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {product.image_url && (
                                      <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="h-10 w-10 rounded object-cover"
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{product.title}</div>
                                      {product.brand && (
                                        <div className="text-xs text-muted-foreground">
                                          {product.brand}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {product.sale_price ? (
                                    <div>
                                      <span className="text-muted-foreground line-through mr-1">
                                        ${product.regular_price}
                                      </span>
                                      <span className="text-green-600 font-medium">
                                        ${product.sale_price}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>${product.regular_price}</span>
                                  )}
                                </TableCell>
                                <TableCell>{product.sku || "-"}</TableCell>
                                <TableCell>{getPlatformBadge(product.platform)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => copyToClipboard(JSON.stringify(product, null, 2))}
                                      title="Copy as JSON"
                                    >
                                      <ClipboardCheck className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => window.open(product.source_url, "_blank")}
                                      title="View Source"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </UITable>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                          <div 
                            key={product.id}
                            className={`rounded-lg border p-4 ${
                              selectedIds.includes(product.id || "")
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(product.id || "")}
                                onChange={() => handleSelectProduct(product.id || "")}
                                className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                              />
                              {getPlatformBadge(product.platform)}
                            </div>
                            <div className="flex gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.title}
                                  className="h-20 w-20 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
                                <div className="mt-1 text-sm">
                                  {product.sale_price ? (
                                    <div>
                                      <span className="text-muted-foreground line-through mr-1">
                                        ${product.regular_price}
                                      </span>
                                      <span className="text-green-600 font-medium">
                                        ${product.sale_price}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>${product.regular_price}</span>
                                  )}
                                </div>
                                {product.brand && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Brand: {product.brand}
                                  </div>
                                )}
                                {product.sku && (
                                  <div className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end mt-2 gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(JSON.stringify(product, null, 2))}
                                title="Copy as JSON"
                                className="h-8 w-8"
                              >
                                <ClipboardCheck className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(product.source_url, "_blank")}
                                title="View Source"
                                className="h-8 w-8"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="selected" className="mt-0">
                    {selectedIds.length > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <UITable>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scrapedProducts
                              .filter((product) => selectedIds.includes(product.id || ""))
                              .map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {product.image_url && (
                                        <img
                                          src={product.image_url}
                                          alt={product.title}
                                          className="h-10 w-10 rounded object-cover"
                                        />
                                      )}
                                      <div className="font-medium">{product.title}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {product.sale_price ? (
                                      <div>
                                        <span className="text-muted-foreground line-through mr-1">
                                          ${product.regular_price}
                                        </span>
                                        <span className="text-green-600 font-medium">
                                          ${product.sale_price}
                                        </span>
                                      </div>
                                    ) : (
                                      <span>${product.regular_price}</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{product.sku || "-"}</TableCell>
                                  <TableCell>{getPlatformBadge(product.platform)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSelectProduct(product.id || "")}
                                      title="Remove from selection"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </UITable>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No products selected. Select products from the "All Products" tab.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products scraped yet. Use the Web Scraper to extract product data.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={exportToJson}
              disabled={scrapedProducts.length === 0}
            >
              <FileJson className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={exportToCsv}
              disabled={scrapedProducts.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={scrapedProducts.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
          <Button
            onClick={handleImport}
            disabled={scrapedProducts.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            Proceed to Import
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataManager;
