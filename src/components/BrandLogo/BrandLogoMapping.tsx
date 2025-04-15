import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BrandLogoMappingProps } from "@/types/brandLogo";
import { Search, CheckCircle2, AlertCircle, RefreshCw, Download } from "lucide-react";
import { categoriesApi, brandsApi } from "@/utils/api";
import { toast } from "sonner";

const BrandLogoMapping = ({ 
  files, 
  mappings, 
  onUpdateMapping, 
  targetType 
}: BrandLogoMappingProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<{id: number, name: string}[]>([]);
  const [matchStatus, setMatchStatus] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  // Load brands/categories when component mounts or target type changes
  useEffect(() => {
    if (files.length > 0) {
      loadOptions(1, true);
    }
  }, [targetType, files]);
  
  // Load brands/categories from API with pagination
  const loadOptions = async (pageNum = 1, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = {
        per_page: '100', // Maximum allowed per page
        page: pageNum.toString(),
      };
      
      let data;
      let total = 0;
      
      if (targetType === 'brands') {
        data = await brandsApi.getAll(params);
        total = data.totalItems || 0;
      } else {
        data = await categoriesApi.getAll(params);
        total = data.totalItems || 0;
      }
      
      if (data) {
        const options = Array.isArray(data.data) ? data.data : [];
        
        // If reset is true, replace the existing options, otherwise append
        if (reset) {
          setAvailableOptions(options);
          setLoadedCount(options.length);
        } else {
          setAvailableOptions(prev => [...prev, ...options]);
          setLoadedCount(prev => prev + options.length);
        }
        
        setTotalCount(total);
        setPage(pageNum);
        
        // Check if mappings match available names
        updateMatchStatus(reset ? options : [...availableOptions, ...options]);
        
        toast.success(`Loaded ${options.length} ${targetType} (${options.length} of ${total})`);
      }
    } catch (error) {
      console.error(`Error loading ${targetType}:`, error);
      toast.error(`Failed to load ${targetType}. ${error.message || ''}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load all items - recursively fetch all pages
  const loadAllOptions = async () => {
    if (loadingAll) return;
    
    setLoadingAll(true);
    try {
      let allOptions: {id: number, name: string}[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      let totalItems = 0;
      
      // First reset the state
      setAvailableOptions([]);
      setLoadedCount(0);
      
      toast.info(`Starting to load all ${targetType}...`);
      
      while (hasMorePages) {
        const params = {
          per_page: '100', // Maximum allowed per page
          page: currentPage.toString(),
        };
        
        let data;
        
        if (targetType === 'brands') {
          data = await brandsApi.getAll(params);
        } else {
          data = await categoriesApi.getAll(params);
        }
        
        const options = Array.isArray(data.data) ? data.data : [];
        if (options.length === 0) {
          hasMorePages = false;
        } else {
          allOptions = [...allOptions, ...options];
          currentPage++;
          totalItems = data.totalItems || 0;
          
          // Update state after each page to show progress
          setAvailableOptions(allOptions);
          setLoadedCount(allOptions.length);
          setTotalCount(totalItems);
          setPage(currentPage);
          
          toast.success(`Loaded ${allOptions.length} of ${totalItems} ${targetType}`);
        }
      }
      
      // Final update with all options
      setAvailableOptions(allOptions);
      setLoadedCount(allOptions.length);
      
      // Check if mappings match available names
      updateMatchStatus(allOptions);
      
      toast.success(`Successfully loaded all ${allOptions.length} ${targetType}`);
    } catch (error) {
      console.error(`Error loading all ${targetType}:`, error);
      toast.error(`Failed to load all ${targetType}. ${error.message || ''}`);
    } finally {
      setLoadingAll(false);
    }
  };
  
  // Load more items
  const loadMore = () => {
    if (loadedCount < totalCount) {
      loadOptions(page + 1);
    }
  };
  
  // Update match status based on available options
  const updateMatchStatus = (options: {id: number, name: string}[]) => {
    const newMatchStatus: Record<string, boolean> = {};
    
    for (const filename in mappings) {
      const targetName = mappings[filename];
      if (targetName) {
        // Case-insensitive matching
        const match = options.some(
          option => option.name.toLowerCase() === targetName.toLowerCase()
        );
        newMatchStatus[filename] = match;
      } else {
        newMatchStatus[filename] = false;
      }
    }
    
    setMatchStatus(newMatchStatus);
  };
  
  // Check if a specific mapping matches an available option
  const checkMapping = (filename: string, targetName: string) => {
    const match = availableOptions.some(
      option => option.name.toLowerCase() === targetName.toLowerCase()
    );
    
    setMatchStatus(prev => ({
      ...prev,
      [filename]: match
    }));
    
    return match;
  };
  
  // Filter options based on search term
  const filteredOptions = searchTerm
    ? availableOptions.filter(option => 
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableOptions;
  
  // Handle selection of an option for a file
  const handleSelect = (filename: string, brandId: number, brandName: string) => {
    onUpdateMapping(filename, brandName);
    setMatchStatus(prev => ({
      ...prev,
      [filename]: true
    }));
  };
  
  // Handle updating the mapping manually through input
  const handleManualMapping = (filename: string, value: string) => {
    onUpdateMapping(filename, value);
    
    if (value) {
      checkMapping(filename, value);
    } else {
      setMatchStatus(prev => ({
        ...prev,
        [filename]: false
      }));
    }
  };
  
  // Auto-generate mappings based on filenames with improved matching
  const autoGenerateMappings = () => {
    files.forEach(file => {
      // Extract name from filename (remove extension and clean up)
      let nameWithoutExtension = file.name
        .replace(/\.(png|jpg|jpeg|gif)$/i, '')
        .replace(/[_-]/g, ' ')
        .trim();
      
      // Capitalize words
      const formattedName = nameWithoutExtension
        .replace(/\b\w/g, c => c.toUpperCase());
      
      // Try to find a close match in available options
      let bestMatch = null;
      let bestMatchName = formattedName;
      
      for (const option of availableOptions) {
        // Check for exact match (case-insensitive)
        if (option.name.toLowerCase() === formattedName.toLowerCase()) {
          bestMatch = option;
          bestMatchName = option.name;
          break;
        }
        
        // Simple partial matching
        if (option.name.toLowerCase().includes(formattedName.toLowerCase()) ||
            formattedName.toLowerCase().includes(option.name.toLowerCase())) {
          bestMatch = option;
          bestMatchName = option.name;
          // Don't break here to allow finding better matches
        }
      }
      
      onUpdateMapping(file.name, bestMatchName);
      checkMapping(file.name, bestMatchName);
    });
    
    toast.success("Generated mappings from filenames");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${targetType}...`}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => loadOptions(1, true)}
          disabled={loading || loadingAll}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
        <Button
          variant="outline"
          onClick={loadAllOptions}
          disabled={loading || loadingAll}
        >
          {loadingAll ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-2">Load All {targetType}</span>
        </Button>
        <Button
          variant="secondary"
          onClick={autoGenerateMappings}
          disabled={files.length === 0 || availableOptions.length === 0}
        >
          Auto-Match
        </Button>
      </div>
      
      {loadedCount > 0 && loadedCount < totalCount && !loadingAll && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Loaded {loadedCount} of {totalCount} {targetType}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : `Load More ${targetType}`}
          </Button>
        </div>
      )}
      
      {files.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Name Mappings</h3>
          
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.name} className="space-y-2 border rounded-md p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  {matchStatus[file.name] !== undefined && (
                    matchStatus[file.name] ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">Match found</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">No match</span>
                      </div>
                    )
                  )}
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={mappings[file.name] || ''}
                      onChange={(e) => handleManualMapping(file.name, e.target.value)}
                      placeholder="Target name"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => checkMapping(file.name, mappings[file.name] || '')}
                    className="whitespace-nowrap"
                  >
                    Check Match
                  </Button>
                </div>
                
                {(searchTerm || mappings[file.name]) && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      <div className="grid gap-1">
                        {filteredOptions.map(option => (
                          <Button
                            key={option.id}
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleSelect(file.name, option.id, option.name)}
                          >
                            {option.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2 px-3">
                        No matching {targetType} found
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            Upload some logo files first
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandLogoMapping;
