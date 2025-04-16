
import React, { useState, useMemo } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { Search, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourceTiming } from "@/types/performance";

interface ResourceWaterfallChartProps {
  resources?: ResourceTiming[];
}

// Fallback to mock data if no resources are provided
const generateMockWaterfallData = () => {
  const resourceTypes = ["html", "css", "javascript", "image", "font", "api"];
  const domains = ["example.com", "cdn.example.com", "api.example.com", "fonts.googleapis.com", "analytics.com"];
  
  const data = [];
  let startTime = 0;
  
  for (let i = 0; i < 30; i++) {
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const size = Math.random() * 500 + 10; // in KB
    const duration = Math.random() * 500 + 10; // in ms
    
    // Add some variation to start times, with some resources loading in parallel
    if (i > 0 && Math.random() > 0.7) {
      startTime += Math.random() * 50;
    }
    
    data.push({
      id: i,
      name: `${resourceType}-${i}.${resourceType === "image" ? "png" : resourceType}`,
      domain,
      type: resourceType,
      startTime,
      duration,
      endTime: startTime + duration,
      size
    });
    
    if (i > 0 && Math.random() > 0.3) {
      startTime += duration * (Math.random() * 0.5);
    }
  }
  
  return data.sort((a, b) => a.startTime - b.startTime);
};

// Transform ResourceTiming data to waterfall format
const transformResourceData = (resources: ResourceTiming[]) => {
  return resources.map((resource, index) => {
    // Extract domain from resource name
    let domain = "unknown";
    try {
      const urlObj = new URL(resource.name);
      domain = urlObj.hostname;
    } catch {
      // If name is not a valid URL, try to extract domain-like part
      const parts = resource.name.split('/');
      if (parts.length > 1) {
        domain = parts[0];
      }
    }

    // Map initiatorType to our type categories
    let type = resource.initiatorType.toLowerCase();
    if (type === "img" || type === "image") type = "image";
    else if (type === "script") type = "javascript";
    else if (type === "link" && resource.name.includes(".css")) type = "css";
    else if (type === "document") type = "html";
    else if (type === "xmlhttprequest" || type === "fetch") type = "api";
    else if (resource.name.includes("font") || type.includes("font")) type = "font";

    return {
      id: index,
      name: resource.name.split('/').pop() || resource.name,
      domain,
      type,
      startTime: resource.startTime,
      duration: resource.duration,
      endTime: resource.startTime + resource.duration,
      size: resource.transferSize / 1024 // Convert bytes to KB
    };
  }).sort((a, b) => a.startTime - b.startTime);
};

const ResourceWaterfallChart: React.FC<ResourceWaterfallChartProps> = ({ resources = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"startTime" | "duration" | "size">("startTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Define resource type colors with proper chart config format
  const resourceTypeColors = {
    html: { color: "#4299e1" },     // Blue
    css: { color: "#48bb78" },      // Green
    javascript: { color: "#ecc94b" }, // Yellow
    image: { color: "#ed8936" },    // Orange
    font: { color: "#9f7aea" },     // Purple
    api: { color: "#f56565" },      // Red
    other: { color: "#a0aec0" }     // Gray
  };
  
  // Use provided resources or fallback to mock data
  const waterfallData = useMemo(() => 
    resources.length > 0 
      ? transformResourceData(resources) 
      : generateMockWaterfallData(),
    [resources]
  );
  
  // Apply filters and sorting
  const processedData = useMemo(() => {
    let data = [...waterfallData];
    
    // Apply search filter
    if (searchQuery) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      data = data.filter(item => item.type === filterType);
    }
    
    // Apply sorting
    data.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOrder) {
        case "startTime":
          comparison = a.startTime - b.startTime;
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return data;
  }, [waterfallData, searchQuery, filterType, sortOrder, sortDirection]);
  
  // Calculate waterfall statistics
  const stats = useMemo(() => {
    if (!processedData.length) return { total: 0, avgDuration: 0, maxDuration: 0 };
    
    const total = processedData.length;
    const totalDuration = processedData.reduce((sum, item) => sum + item.duration, 0);
    const avgDuration = Math.round(totalDuration / total);
    const maxDuration = Math.max(...processedData.map(item => item.duration));
    
    return { total, avgDuration, maxDuration };
  }, [processedData]);
  
  // Get distinct resource types for filtering
  const resourceTypes = useMemo(() => {
    const types = new Set(waterfallData.map(item => item.type));
    return ["all", ...Array.from(types)];
  }, [waterfallData]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  const handleSortChange = (value: "startTime" | "duration" | "size") => {
    if (sortOrder === value) {
      toggleSortDirection();
    } else {
      setSortOrder(value);
      setSortDirection("asc");
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border rounded shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{data.domain}</p>
          <div className="text-xs mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Type:</span> 
            <span className="font-medium">
              <Badge className="font-normal" 
                style={{ backgroundColor: resourceTypeColors[data.type]?.color || resourceTypeColors.other.color }}>
                {data.type}
              </Badge>
            </span>
            
            <span>Start Time:</span> 
            <span className="font-medium">{data.startTime.toFixed(0)} ms</span>
            
            <span>Duration:</span> 
            <span className="font-medium">{data.duration.toFixed(0)} ms</span>
            
            <span>Size:</span> 
            <span className="font-medium">{data.size.toFixed(1)} KB</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const SortIcon = ({ currentSort, sortField }: { currentSort: string, sortField: string }) => {
    if (currentSort !== sortField) return null;
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={filterType} 
              onValueChange={(value) => setFilterType(value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Sort by:</div>
            <div className="flex gap-1">
              <Button 
                variant={sortOrder === "startTime" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange("startTime")}
                className="text-xs h-8"
              >
                Start Time
                <SortIcon currentSort={sortOrder} sortField="startTime" />
              </Button>
              <Button 
                variant={sortOrder === "duration" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange("duration")}
                className="text-xs h-8"
              >
                Duration
                <SortIcon currentSort={sortOrder} sortField="duration" />
              </Button>
              <Button 
                variant={sortOrder === "size" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange("size")}
                className="text-xs h-8"
              >
                Size
                <SortIcon currentSort={sortOrder} sortField="size" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            Showing <span className="font-medium">{processedData.length}</span> of <span className="font-medium">{waterfallData.length}</span> resources
          </div>
          <div className="flex gap-4">
            <div className="text-muted-foreground">
              Avg duration: <span className="font-medium">{stats.avgDuration} ms</span>
            </div>
            <div className="text-muted-foreground">
              Max duration: <span className="font-medium">{stats.maxDuration} ms</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChartContainer 
          className="w-full"
          style={{ height: Math.max(500, 30 * processedData.length) }}
        >
          <BarChart
            layout="vertical"
            data={processedData}
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={stats.avgDuration} stroke="#888" strokeDasharray="3 3" />
            <Bar
              dataKey="duration"
              background={{ fill: '#eee' }}
              radius={[0, 4, 4, 0]}
              fillOpacity={0.8}
              stroke="none"
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={resourceTypeColors[entry.type]?.color || resourceTypeColors.other.color} 
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      
      <div className="mt-3 flex justify-center">
        <div className="flex gap-4 text-xs">
          {Object.entries(resourceTypeColors).filter(([key]) => key !== 'other').map(([type, config]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: config.color }}
              />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceWaterfallChart;
