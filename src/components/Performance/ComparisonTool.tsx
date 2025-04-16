
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GitCompareIcon, PlusIcon, MinusIcon } from "lucide-react";
import apiService, { TestResult } from '@/services/apiService';
import { TestHistoryItem, PerformanceTestResult } from '@/types/performance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ComparisonTool = () => {
  const [testA, setTestA] = useState<TestResult | null>(null);
  const [testB, setTestB] = useState<TestResult | null>(null);
  const [testOptions, setTestOptions] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTests = queryParams.get('tests')?.split(',') || [];
  
  useEffect(() => {
    const fetchTestOptions = async () => {
      try {
        const userId = localStorage.getItem('user_id') || 'current-user';
        const tests = await apiService.getTestHistory(userId, { limit: 20 });
        setTestOptions(tests);
        
        // If we have test IDs from query params, load them
        if (initialTests.length >= 1) {
          loadTest(initialTests[0], 'A');
        }
        if (initialTests.length >= 2) {
          loadTest(initialTests[1], 'B');
        }
      } catch (err) {
        setError('Failed to load test history');
      }
    };
    
    fetchTestOptions();
  }, []);
  
  const loadTest = async (testId: string, slot: 'A' | 'B') => {
    if (!testId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const testData = await apiService.getTestResult(testId);
      if (slot === 'A') {
        setTestA(testData);
      } else {
        setTestB(testData);
      }
    } catch (err) {
      setError(`Failed to load test ${testId}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestSelect = (testId: string, slot: 'A' | 'B') => {
    loadTest(testId, slot);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const calculateDifference = (a: number | undefined, b: number | undefined, format: 'raw' | 'percent' = 'raw') => {
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
  
  const renderComparison = () => {
    if (loading) {
      return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    }
    
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!testA || !testB) {
      return (
        <Alert>
          <AlertDescription>Select two tests to compare</AlertDescription>
        </Alert>
      );
    }
    
    // Define metrics to compare
    const metrics = [
      {
        name: 'Performance Score',
        keyA: 'lighthouse.performance',
        keyB: 'lighthouse.performance',
        format: 'score',
        isHigherBetter: true
      },
      {
        name: 'Load Time',
        keyA: 'metrics.loadTime',
        keyB: 'metrics.loadTime',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Page Size',
        keyA: 'metrics.totalSize',
        keyB: 'metrics.totalSize',
        transform: (value: number) => (value / 1024).toFixed(1),
        unit: 'KB',
        isHigherBetter: false
      },
      {
        name: 'Resource Count',
        keyA: 'metrics.resourceCount',
        keyB: 'metrics.resourceCount',
        isHigherBetter: false
      },
      {
        name: 'Time to First Byte',
        keyA: 'metrics.ttfb',
        keyB: 'metrics.ttfb',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'First Contentful Paint',
        keyA: 'metrics.fcp',
        keyB: 'metrics.fcp',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Largest Contentful Paint',
        keyA: 'metrics.lcp',
        keyB: 'metrics.lcp',
        unit: 'ms',
        isHigherBetter: false
      },
      {
        name: 'Cumulative Layout Shift',
        keyA: 'metrics.cls',
        keyB: 'metrics.cls',
        precision: 3,
        isHigherBetter: false
      }
    ];
    
    // Helper function to access nested properties
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };
    
    // Generate comparison data
    const comparisonData = metrics.map(metric => {
      const valueA = testA.results ? getNestedValue(testA.results, metric.keyA) : undefined;
      const valueB = testB.results ? getNestedValue(testB.results, metric.keyB) : undefined;
      
      let displayValueA = valueA;
      let displayValueB = valueB;
      
      if (metric.transform && valueA !== undefined && valueB !== undefined) {
        displayValueA = metric.transform(valueA);
        displayValueB = metric.transform(valueB);
      } else if (metric.precision !== undefined && valueA !== undefined && valueB !== undefined) {
        displayValueA = valueA.toFixed(metric.precision);
        displayValueB = valueB.toFixed(metric.precision);
      }
      
      // Calculate difference
      const diff = calculateDifference(valueA, valueB);
      
      // Determine if A is better than B based on metric
      const aIsBetter = valueA !== undefined && valueB !== undefined ? 
        (metric.isHigherBetter ? valueA > valueB : valueA < valueB) : false;
      
      return {
        key: metric.name,
        metric: metric.name,
        valueA: displayValueA !== undefined ? displayValueA + (metric.unit ? ` ${metric.unit}` : '') : 'N/A',
        valueB: displayValueB !== undefined ? displayValueB + (metric.unit ? ` ${metric.unit}` : '') : 'N/A',
        difference: diff ? `${diff.value}${metric.unit ? ` ${metric.unit}` : ''}` : 'N/A',
        percentChange: valueB === 0 || valueB === undefined || valueA === undefined ? 
          'N/A' : `${((valueA - valueB) / valueB * 100).toFixed(1)}%`,
        status: aIsBetter ? 'better' : (valueA === valueB ? 'same' : 'worse'),
        format: metric.format
      };
    });
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Test A</CardTitle>
              <CardDescription>
                <span className="font-medium">{testA.url}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tested on {new Date(testA.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Test B</CardTitle>
              <CardDescription>
                <span className="font-medium">{testB.url}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tested on {new Date(testB.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Metric</TableHead>
                <TableHead className="w-[25%]">Test A ({new Date(testA.timestamp).toLocaleDateString()})</TableHead>
                <TableHead className="w-[25%]">Test B ({new Date(testB.timestamp).toLocaleDateString()})</TableHead>
                <TableHead className="w-[25%]">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.key} className={`comparison-row ${row.status}`}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell>
                    {row.format === 'score' ? (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={parseInt(row.valueA)} 
                          className="w-12 h-12 rounded-full" 
                        />
                        <span>{row.valueA}</span>
                      </div>
                    ) : row.valueA}
                  </TableCell>
                  <TableCell>
                    {row.format === 'score' ? (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={parseInt(row.valueB)} 
                          className="w-12 h-12 rounded-full" 
                        />
                        <span>{row.valueB}</span>
                      </div>
                    ) : row.valueB}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {row.status !== 'same' && (
                        <span className={`inline-flex ${row.status === 'better' ? 'text-green-500' : 'text-red-500'}`}>
                          {row.status === 'better' ? <PlusIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                        </span>
                      )}
                      <span className={`
                        ${row.status === 'better' ? 'text-green-500' : ''}
                        ${row.status === 'worse' ? 'text-red-500' : ''}
                      `}>
                        {row.difference} ({row.percentChange})
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Compare results from two different performance tests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="md:col-span-3">
            <label className="text-sm font-medium block mb-2">Test A:</label>
            <Select
              value={testA?.testId}
              onValueChange={(value) => handleTestSelect(value, 'A')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first test" />
              </SelectTrigger>
              <SelectContent>
                {testOptions.map(test => (
                  <SelectItem key={test.testId} value={test.testId}>
                    {new URL(test.url).hostname} - {new Date(test.timestamp).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center">
            <GitCompareIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="md:col-span-3">
            <label className="text-sm font-medium block mb-2">Test B:</label>
            <Select
              value={testB?.testId}
              onValueChange={(value) => handleTestSelect(value, 'B')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second test" />
              </SelectTrigger>
              <SelectContent>
                {testOptions.map(test => (
                  <SelectItem key={test.testId} value={test.testId}>
                    {new URL(test.url).hostname} - {new Date(test.timestamp).toLocaleDateString()}
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
