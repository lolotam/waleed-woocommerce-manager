
import React, { useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for the waterfall chart
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

const mockWaterfallData = generateMockWaterfallData();

const ResourceWaterfallChart = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "html": return "#4299e1";
      case "css": return "#48bb78";
      case "javascript": return "#ecc94b";
      case "image": return "#ed8936";
      case "font": return "#9f7aea";
      case "api": return "#f56565";
      default: return "#a0aec0";
    }
  };
  
  const filteredData = mockWaterfallData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Pre-process the data to include color information
  const coloredData = filteredData.map(item => ({
    ...item,
    color: getResourceTypeColor(item.type)
  }));
  
  const config = {
    html: { color: "#4299e1" },
    css: { color: "#48bb78" },
    javascript: { color: "#ecc94b" },
    image: { color: "#ed8936" },
    font: { color: "#9f7aea" },
    api: { color: "#f56565" }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{data.domain}</p>
          <div className="text-xs mt-2 grid grid-cols-2 gap-x-4">
            <span>Type:</span> 
            <span className="font-medium">{data.type}</span>
            
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

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChartContainer config={config} className="w-full h-[1500px]">
          <BarChart
            layout="vertical"
            data={coloredData}
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
            <Bar
              dataKey="duration"
              background={{ fill: '#eee' }}
              radius={[0, 4, 4, 0]}
              fillOpacity={0.8}
              stroke="none"
              fill="#8884d8"
              // Use fillOpacity attribute to make fill work with colors from data
              getBar={(props) => {
                const { fill, x, y, width, height, background, radius, index, ...others } = props;
                const item = coloredData[index];
                return (
                  <path
                    {...others}
                    fill={item.color}
                    d={`M${x},${y + height}h${width}a${radius[0]},${radius[0]},0,0,1,${radius[0]},${-radius[0]}v${height - radius[0] - radius[1]}a${radius[1]},${radius[1]},0,0,1,${radius[1]},${-radius[1]}h${-width}Z`}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default ResourceWaterfallChart;
