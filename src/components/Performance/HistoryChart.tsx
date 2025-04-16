
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { TestHistoryItem } from "@/types/performance";
import { Card, CardContent } from "@/components/ui/card";

interface HistoryChartProps {
  data: TestHistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
  });

  // Format the data for the chart
  const chartData = sortedData.map(item => ({
    date: new Date(item.testDate).toLocaleDateString(),
    score: item.overallScore,
    timestamp: item.testDate
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="px-2 py-2 border shadow-sm bg-white">
          <CardContent className="p-2">
            <p className="font-medium">{new Date(data.timestamp).toLocaleString()}</p>
            <p>Score: <span className="font-bold">{data.score}</span></p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
