
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BrandLogoMappingProps } from "@/types/brandLogo";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import { categoriesApi, brandsApi } from "@/utils/api";
import { toast } from "sonner";

const BrandLogoMapping = ({ 
  files, 
  mappings, 
  onUpdateMapping, 
  targetType 
}: BrandLogoMappingProps) => {
  const [loading, setLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<{id: number, name: string}[]>([]);
  const [matchStatus, setMatchStatus] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadOptions();
  }, [targetType]);
  
  const loadOptions = async () => {
    setLoading(true);
    try {
      let data;
      if (targetType === 'brands') {
        data = await brandsApi.getAll({per_page: '100'});
      } else {
        data = await categoriesApi.getAll({per_page: '100'});
      }
      
      if (data) {
        setAvailableOptions(Array.isArray(data.data) ? data.data : []);
        
        // Check if mappings match available names
        const newMatchStatus: Record<string, boolean> = {};
        for (const filename in mappings) {
          const targetName = mappings[filename];
          const match = (Array.isArray(data.data) ? data.data : []).some(
            option => option.name.toLowerCase() === targetName.toLowerCase()
          );
          newMatchStatus[filename] = match;
        }
        setMatchStatus(newMatchStatus);
      }
    } catch (error) {
      console.error(`Error loading ${targetType}:`, error);
      toast.error(`Failed to load ${targetType}`);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredOptions = searchTerm
    ? availableOptions.filter(option => 
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableOptions;
  
  const handleSelect = (filename: string, brandId: number, brandName: string) => {
    onUpdateMapping(filename, brandName);
    setMatchStatus(prev => ({
      ...prev,
      [filename]: true
    }));
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
          onClick={loadOptions}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
      
      {files.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Name Mappings</h3>
          
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.name} className="space-y-2">
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
                      onChange={(e) => onUpdateMapping(file.name, e.target.value)}
                      placeholder="Target name"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadOptions()}
                    className="whitespace-nowrap"
                  >
                    Check Match
                  </Button>
                </div>
                
                {searchTerm || mappings[file.name] ? (
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
                ) : null}
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
