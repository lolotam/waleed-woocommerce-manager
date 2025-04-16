import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestHistoryItem, PerformanceTestResult } from "@/types/performance";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HistoricalComparisonChartProps {
  historyData: TestHistoryItem[];
  currentTestId?: string;
  isLoading?: boolean;
}

type MetricOption = {
  value: string;
  label: string;
};

const metricOptions: MetricOption[] = [
  { value: 'overallScore', label: 'Overall Score' },
  { value: 'speed', label: 'Speed Score' },
  { value: 'optimization', label: 'Optimization Score' },
  { value: 'accessibility', label: 'Accessibility Score' },
  { value: 'pageLoadTime', label: 'Page Load Time (s)' },
  { value: 'totalPageSize', label: 'Page Size (MB)' },
  { value: 'firstContentfulPaint', label: 'First Contentful Paint (s)' },
  { value: 'largestContentfulPaint', label: 'Largest Contentful Paint (s)' }
];

const HistoricalComparisonChart: React.FC<HistoricalComparisonChartProps> = ({ 
  historyData = [], 
  currentTestId,
  isLoading = false
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overallScore');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Loading historical data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  if (historyData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not enough historical data</AlertTitle>
            <AlertDescription>
              Run at least one more test to see historical trends
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Format the data for the chart
  const chartData = historyData.map(item => {
    const date = new Date(item.testDate);
    return {
      id: item.id,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      dateTime: date,
      isCurrent: item.id === currentTestId,
      overallScore: item.overallScore,
      // Other metrics would come from the full test result
    };
  });

  // Sort by date
  chartData.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const selectedMetricLabel = metricOptions.find(m => m.value === selectedMetric)?.label || '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </div>
        <Select 
          defaultValue={selectedMetric} 
          onValueChange={setSelectedMetric}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metricOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value, index) => 
                  index === 0 || index === chartData.length - 1 || index === Math.floor(chartData.length / 2) 
                    ? value 
                    : ''
                } 
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value) => [`${value}`, selectedMetricLabel]} 
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name={selectedMetricLabel}
                stroke="#7c3aed"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return payload.isCurrent ? (
                    <svg>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#ef4444" 
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                      <text x={cx} y={cy + 20} textAnchor="middle" fill="#ef4444" fontSize="12">
                        Current
                      </text>
                    </svg>
                  ) : (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="#7c3aed" 
                      stroke="#7c3aed"
                      strokeWidth={1}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricalComparisonChart;
