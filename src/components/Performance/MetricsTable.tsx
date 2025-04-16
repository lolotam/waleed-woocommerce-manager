
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerformanceMetrics } from "@/types/performance";

interface MetricsTableProps {
  metrics: PerformanceMetrics;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metrics }) => {
  // Format size in KB or MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const metricsData = [
    {
      name: "Page Load Time",
      value: `${metrics.pageLoadTime.toFixed(2)}s`,
      description: "Total time to load the entire page"
    },
    {
      name: "First Contentful Paint",
      value: `${metrics.firstContentfulPaint.toFixed(2)}s`,
      description: "Time until the first content is painted"
    },
    {
      name: "Largest Contentful Paint",
      value: `${metrics.largestContentfulPaint.toFixed(2)}s`,
      description: "Time until the largest content element is visible"
    },
    {
      name: "Time to Interactive",
      value: `${metrics.timeToInteractive.toFixed(2)}s`,
      description: "Time until the page becomes fully interactive"
    },
    {
      name: "Total Page Size",
      value: formatSize(metrics.totalPageSize),
      description: "Total size of all resources on the page"
    },
    {
      name: "Number of Requests",
      value: metrics.numberOfRequests.toString(),
      description: "Total number of HTTP requests made"
    },
    {
      name: "Cumulative Layout Shift",
      value: metrics.cumulativeLayoutShift.toFixed(3),
      description: "Measures visual stability during page load"
    }
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metricsData.map((metric) => (
          <TableRow key={metric.name}>
            <TableCell className="font-medium">{metric.name}</TableCell>
            <TableCell>{metric.value}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              {metric.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MetricsTable;
