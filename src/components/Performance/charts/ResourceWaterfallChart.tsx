
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceTiming, ChartConfig } from "@/types/performance";

interface ResourceWaterfallChartProps {
  resources?: ResourceTiming[];
  config?: ChartConfig;
}

// Default style configuration
const defaultColors = [
  "#4f46e5", // indigo
  "#0ea5e9", // sky blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#84cc16", // lime
];

const resourceTypeColors: Record<string, string> = {
  document: "#4f46e5", // indigo
  script: "#0ea5e9", // sky blue
  stylesheet: "#10b981", // emerald
  image: "#f59e0b", // amber
  font: "#ef4444", // red
  fetch: "#8b5cf6", // violet
  xmlhttprequest: "#ec4899", // pink
  other: "#84cc16", // lime
};

const ResourceWaterfallChart: React.FC<ResourceWaterfallChartProps> = ({ resources = [], config }) => {
  // Merge default config with provided config
  const chartConfig = useMemo(() => ({
    colors: config?.colors || defaultColors,
    customHeight: config?.customHeight || 500,
  }), [config]);

  const chartData = useMemo(() => {
    if (!resources || resources.length === 0) {
      // Return mock data if no resources provided
      return Array.from({ length: 10 }, (_, i) => ({
        name: `/mock-resource-${i + 1}.${i % 2 === 0 ? 'js' : 'css'}`,
        initiatorType: i % 2 === 0 ? 'script' : 'stylesheet',
        startTime: i * 100,
        duration: Math.random() * 500 + 50,
        transferSize: Math.random() * 100000,
      }));
    }

    // Sort resources by start time
    return [...resources]
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 50) // Limit to 50 resources for performance
      .map(resource => {
        let fileName = resource.name;
        
        // Extract just the filename from the URL
        try {
          const url = new URL(resource.name);
          fileName = url.pathname.split('/').pop() || url.pathname;
        } catch (e) {
          // If it's not a valid URL, just use the last part of the path
          fileName = resource.name.split('/').pop() || resource.name;
        }
        
        // Truncate long filenames
        if (fileName.length > 25) {
          fileName = fileName.substring(0, 22) + '...';
        }
        
        return {
          ...resource,
          name: fileName,
          waitingTime: resource.startTime,
          downloadTime: resource.duration,
          // Convert to KB with 2 decimal places
          size: Math.round(resource.transferSize / 1024 * 100) / 100
        };
      });
  }, [resources]);

  const getResourceTypeColor = (type: string): string => {
    return resourceTypeColors[type.toLowerCase()] || resourceTypeColors.other;
  };

  // If no resources are provided, show a message
  if (!resources || resources.length === 0) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
        <p>No resource timing data available.</p>
        <p className="text-sm">Using sample data for preview.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;

    return (
      <div className="bg-popover p-3 rounded-lg shadow-md border text-sm">
        <p className="font-semibold">{data.name}</p>
        <p className="text-muted-foreground mb-1">Type: {data.initiatorType}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p>Start: {Math.round(data.startTime)}ms</p>
          <p>Duration: {Math.round(data.duration)}ms</p>
          <p>Size: {data.size}KB</p>
          <p>Transfer: {Math.round(data.transferSize / 1024)}KB</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height={chartConfig.customHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 30, bottom: 0 }}
          barSize={15}
          barGap={1}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis 
            type="number" 
            label={{ 
              value: 'Time (ms)', 
              position: 'insideBottom', 
              offset: -5 
            }} 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="startTime" 
            stackId="a" 
            name="Waiting Time" 
            fill="#94a3b8" 
            fillOpacity={0.6}
          />
          <Bar 
            dataKey="duration" 
            stackId="a" 
            name="Download Time" 
            fill={({ initiatorType }) => getResourceTypeColor(initiatorType)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResourceWaterfallChart;
