
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, Minus, CompareArrowsIcon } from "lucide-react";
import { PerformanceTestResult, TestHistoryItem } from "@/types/performance";
import apiService from "@/services/apiService";

interface ComparisonToolProps {
  historyData?: TestHistoryItem[];
}

interface ComparisonMetric {
  name: string;
  keyA: string;
  keyB: string;
  unit?: string;
  transform?: (value: number) => string | number;
  precision?: number;
  format?: 'score' | 'raw';
  isHigherBetter: boolean;
}

interface ComparisonRow {
  key: string;
  metric: string;
  valueA: string;
  valueB: string;
  difference: string;
  percentChange: string;
  status: 'better' | 'worse' | 'same';
  format?: 'score' | 'raw';
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({ historyData = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [testA, setTestA] = useState<PerformanceTestResult | null>(null);
  const [testB, setTestB] = useState<PerformanceTestResult | null>(null);
  const [testOptions, setTestOptions] = useState<TestHistoryItem[]>(historyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initialTests = searchParams.get('tests')?.split(',') || [];
  
  useEffect(() => {
    if (historyData.length > 0) {
      setTestOptions(historyData);
    } else {
      const fetchTestOptions = async () => {
        try {
          const userId = "current"; // This would normally come from auth context
          const tests = await apiService.getTestHistory(userId);
          setTestOptions(tests as TestHistoryItem[]);
        } catch (err) {
          console.error("Failed to load test history:", err);
          setError('Failed to load test history');
        }
      };
      
      fetchTestOptions();
    }
    
    // If we have test IDs from query params, load them
    if (initialTests.length >= 1) {
      loadTest(initialTests[0], 'A');
    }
    if (initialTests.length >= 2) {
      loadTest(initialTests[1], 'B');
    }
  }, [historyData]);
  
  const loadTest = async (testId: string, slot: 'A' | 'B') => {
    if (!testId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const testData = await apiService.getTestResult(testId);
      if (slot === 'A') {
        setTestA(testData as PerformanceTestResult);
      } else {
        setTestB(testData as PerformanceTestResult);
      }
    } catch (err) {
      console.error(`Failed to load test ${testId}:`, err);
      setError(`Failed to load test ${testId}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestSelect = (testId: string, slot: 'A' | 'B') => {
    loadTest(testId, slot);
    
    // Update URL params
    const tests = [...initialTests];
    const index = slot === 'A' ? 0 : 1;
    tests[index] = testId;
    
    searchParams.set('tests', tests.join(','));
    setSearchParams(searchParams);
  };
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getTextColor = (status: 'better' | 'worse' | 'same'): string => {
    if (status === 'better') return 'text-green-600';
    if (status === 'worse') return 'text-red-600';
    return 'text-gray-500';
  };
  
  const calculateDifference = (a: number, b: number, format: 'raw' | 'percent' = 'raw') => {
    if (a === undefined || b === undefined) return null;
    
    const diff = a - b;
    
    if (format === 'percent') {
      const percentDiff = b === 0 ? 100 : (diff / b) * 100;
      return {
        value: Math.abs(percentDiff).toFixed(1) + '%',
        isPositive: diff > 0
      };
    }
    
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0
    };
  };
  
  // Helper function to access nested properties
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const renderComparison = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2">Loading test data...</span>
        </div>
      );
    }
    
    if (error) {
      return <Alert><AlertDescription>{error}</AlertDescription></Alert>;
    }
    
    if (!testA || !testB) {
      return <Alert><AlertDescription>Select two tests to compare</AlertDescription></Alert>;
    }
    
    // Define metrics to compare
    const metrics: ComparisonMetric[] = [
      {
        name: 'Performance Score',
        keyA: 'scores.overall',
        keyB: 'scores.overall',
        format: 'score',
        isHigherBetter: true
      },
      {
        name: 'Load Time',
        keyA: 'metrics.pageLoadTime',
        keyB: 'metrics.pageLoadTime',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Page Size',
        keyA: 'metrics.totalPageSize',
        keyB: 'metrics.totalPageSize',
        transform: value => (value / 1024).toFixed(1),
        unit: 'KB',
        isHigherBetter: false
      },
      {
        name: 'Resource Count',
        keyA: 'metrics.numberOfRequests',
        keyB: 'metrics.numberOfRequests',
        isHigherBetter: false
      },
      {
        name: 'First Contentful Paint',
        keyA: 'metrics.firstContentfulPaint',
        keyB: 'metrics.firstContentfulPaint',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Largest Contentful Paint',
        keyA: 'metrics.largestContentfulPaint',
        keyB: 'metrics.largestContentfulPaint',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Time to Interactive',
        keyA: 'metrics.timeToInteractive',
        keyB: 'metrics.timeToInteractive',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Cumulative Layout Shift',
        keyA: 'metrics.cumulativeLayoutShift',
        keyB: 'metrics.cumulativeLayoutShift',
        precision: 3,
        isHigherBetter: false
      }
    ];
    
    // Generate comparison data
    const comparisonData: ComparisonRow[] = metrics.map(metric => {
      const valueA = getNestedValue(testA, metric.keyA);
      const valueB = getNestedValue(testB, metric.keyB);
      
      let displayValueA = valueA;
      let displayValueB = valueB;
      
      if (metric.transform) {
        displayValueA = metric.transform(valueA);
        displayValueB = metric.transform(valueB);
      } else if (metric.precision !== undefined) {
        displayValueA = valueA.toFixed(metric.precision);
        displayValueB = valueB.toFixed(metric.precision);
      }
      
      // Calculate difference
      const diff = calculateDifference(valueA, valueB);
      
      // Determine if A is better than B based on metric
      const aIsBetter = metric.isHigherBetter ? valueA > valueB : valueA < valueB;
      
      return {
        key: metric.name,
        metric: metric.name,
        valueA: `${displayValueA}${metric.unit ? ` ${metric.unit}` : ''}`,
        valueB: `${displayValueB}${metric.unit ? ` ${metric.unit}` : ''}`,
        difference: diff ? `${diff.value}${metric.unit ? ` ${metric.unit}` : ''}` : 'N/A',
        percentChange: valueB === 0 ? 'N/A' : `${((valueA - valueB) / valueB * 100).toFixed(1)}%`,
        status: aIsBetter ? 'better' : valueA === valueB ? 'same' : 'worse',
        format: metric.format
      };
    });
    
    return (
      <div className="comparison-results space-y-6">
        <div className="comparison-summary grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Test A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium break-all">{testA.url}</p>
                <p className="text-sm text-muted-foreground">
                  Tested on {new Date(testA.testDate).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Test B</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium break-all">{testB.url}</p>
                <p className="text-sm text-muted-foreground">
                  Tested on {new Date(testB.testDate).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Metric</TableHead>
              <TableHead className="w-[25%]">Test A ({new Date(testA.testDate).toLocaleDateString()})</TableHead>
              <TableHead className="w-[25%]">Test B ({new Date(testB.testDate).toLocaleDateString()})</TableHead>
              <TableHead className="w-[25%]">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell>
                  {row.format === 'score' ? (
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={parseInt(row.valueA)} 
                        className={`h-2 w-16 ${getScoreColor(parseInt(row.valueA))}`} 
                      />
                      <span>{row.valueA}</span>
                    </div>
                  ) : (
                    row.valueA
                  )}
                </TableCell>
                <TableCell>
                  {row.format === 'score' ? (
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={parseInt(row.valueB)} 
                        className={`h-2 w-16 ${getScoreColor(parseInt(row.valueB))}`} 
                      />
                      <span>{row.valueB}</span>
                    </div>
                  ) : (
                    row.valueB
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {row.status !== 'same' && (
                      row.status === 'better' ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )
                    )}
                    {row.status === 'same' && (
                      <Minus className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={getTextColor(row.status)}>
                      {row.difference} ({row.percentChange})
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  return (
    <Card className="comparison-tool">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CompareArrowsIcon className="h-5 w-5" />
          Performance Comparison
        </CardTitle>
        <CardDescription>
          Compare two performance tests to identify improvements or regressions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="test-selector grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test A:</label>
            <Select
              value={testA?.id || ''}
              onValueChange={(value) => handleTestSelect(value, 'A')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first test" />
              </SelectTrigger>
              <SelectContent>
                {testOptions.map(test => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.url.split('//')[1].split('/')[0]} - {new Date(test.testDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <CompareArrowsIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Test B:</label>
            <Select
              value={testB?.id || ''}
              onValueChange={(value) => handleTestSelect(value, 'B')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second test" />
              </SelectTrigger>
              <SelectContent>
                {testOptions.map(test => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.url.split('//')[1].split('/')[0]} - {new Date(test.testDate).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="comparison-content">
          {renderComparison()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTool;
