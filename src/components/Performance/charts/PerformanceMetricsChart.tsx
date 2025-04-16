
import React from "react";
import { PerformanceMetrics } from "@/types/performance";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PerformanceMetricsChartProps {
  metrics: PerformanceMetrics;
}

const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({ metrics }) => {
  // Transform metrics object into an array for recharts
  const chartData = [
    {
      name: "Page Load Time",
      value: metrics.pageLoadTime,
      unit: "s",
      color: "#8884d8"
    },
    {
      name: "First Contentful Paint",
      value: metrics.firstContentfulPaint,
      unit: "s",
      color: "#82ca9d"
    },
    {
      name: "Largest Contentful Paint",
      value: metrics.largestContentfulPaint,
      unit: "s",
      color: "#ffc658"
    },
    {
      name: "Time to Interactive",
      value: metrics.timeToInteractive,
      unit: "s",
      color: "#ff8042"
    }
  ];

  const config = {
    pageLoad: { color: "#8884d8" },
    fcp: { color: "#82ca9d" },
    lcp: { color: "#ffc658" },
    tti: { color: "#ff8042" }
  };

  return (
    <ChartContainer config={config} className="w-full h-full">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#888' }} 
          angle={-45} 
          textAnchor="end" 
          height={70}
        />
        <YAxis 
          label={{ 
            value: 'Time (seconds)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }} 
        />
        <Tooltip 
          formatter={(value: number, name: string, props: any) => [`${value} ${props.payload.unit}`, name]}
        />
        <Bar 
          dataKey="value" 
          name="Value" 
          fill={(entry) => entry.color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default PerformanceMetricsChart;
