
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerformanceTestResult } from "@/types/performance";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface ComparisonReportProps {
  testA: PerformanceTestResult | null;
  testB: PerformanceTestResult | null;
}

const ComparisonReport: React.FC<ComparisonReportProps> = ({ testA, testB }) => {
  if (!testA || !testB) return null;

  // Calculate differences for metrics
  const getPercentageDiff = (valueA: number, valueB: number) => {
    if (valueA === 0) return valueB === 0 ? 0 : 100;
    return ((valueB - valueA) / valueA) * 100;
  };

  const formatDiff = (diff: number, higherIsBetter = true) => {
    const formattedDiff = Math.abs(diff).toFixed(1);
    if (diff === 0) return <Minus className="inline h-4 w-4 text-gray-500" />;
    
    if (diff > 0) {
      return higherIsBetter ? (
        <span className="text-green-600 flex items-center">
          <ArrowUp className="mr-1 h-4 w-4" />
          {formattedDiff}%
        </span>
      ) : (
        <span className="text-red-600 flex items-center">
          <ArrowUp className="mr-1 h-4 w-4" />
          {formattedDiff}%
        </span>
      );
    } else {
      return higherIsBetter ? (
        <span className="text-red-600 flex items-center">
          <ArrowDown className="mr-1 h-4 w-4" />
          {formattedDiff}%
        </span>
      ) : (
        <span className="text-green-600 flex items-center">
          <ArrowDown className="mr-1 h-4 w-4" />
          {formattedDiff}%
        </span>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparison Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                <TableHead>Test A</TableHead>
                <TableHead>Test B</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Overall Score</TableCell>
                <TableCell>{testA.scores.overall}</TableCell>
                <TableCell>{testB.scores.overall}</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.scores.overall, testB.scores.overall))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Speed Score</TableCell>
                <TableCell>{testA.scores.speed}</TableCell>
                <TableCell>{testB.scores.speed}</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.scores.speed, testB.scores.speed))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Page Load Time</TableCell>
                <TableCell>{testA.metrics.pageLoadTime.toFixed(2)}s</TableCell>
                <TableCell>{testB.metrics.pageLoadTime.toFixed(2)}s</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.metrics.pageLoadTime, testB.metrics.pageLoadTime), false)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Largest Contentful Paint</TableCell>
                <TableCell>{testA.metrics.largestContentfulPaint.toFixed(2)}s</TableCell>
                <TableCell>{testB.metrics.largestContentfulPaint.toFixed(2)}s</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.metrics.largestContentfulPaint, testB.metrics.largestContentfulPaint), false)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Page Size</TableCell>
                <TableCell>{testA.metrics.totalPageSize} MB</TableCell>
                <TableCell>{testB.metrics.totalPageSize} MB</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.metrics.totalPageSize, testB.metrics.totalPageSize), false)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Number of Requests</TableCell>
                <TableCell>{testA.metrics.numberOfRequests}</TableCell>
                <TableCell>{testB.metrics.numberOfRequests}</TableCell>
                <TableCell>
                  {formatDiff(getPercentageDiff(testA.metrics.numberOfRequests, testB.metrics.numberOfRequests), false)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonReport;
