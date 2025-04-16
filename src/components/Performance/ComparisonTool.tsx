
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestSelector from "./TestSelector";
import ComparisonReport from "./ComparisonReport";
import { useTestComparison } from "@/hooks/useTestComparison";

// Mock history data for demonstration
const mockHistoryData = [
  {
    id: "test-1",
    url: "https://example.com",
    testDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 85
  },
  {
    id: "test-2",
    url: "https://example.org",
    testDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    overallScore: 78
  },
  {
    id: "test-3",
    url: "https://example.net",
    testDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    overallScore: 92
  }
];

const ComparisonTool: React.FC = () => {
  const {
    testA,
    testB,
    selectedTestIdA,
    selectedTestIdB,
    setSelectedTestIdA,
    setSelectedTestIdB,
    isLoading,
    error
  } = useTestComparison(mockHistoryData);

  const [activeTab, setActiveTab] = useState("comparison");

  const handleCompare = () => {
    setActiveTab("comparison");
  };

  const canCompare = selectedTestIdA && selectedTestIdB && selectedTestIdA !== selectedTestIdB;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestSelector
          tests={mockHistoryData}
          selectedTestId={selectedTestIdA}
          onSelectTest={setSelectedTestIdA}
          label="Test A"
        />
        <TestSelector
          tests={mockHistoryData}
          selectedTestId={selectedTestIdB}
          onSelectTest={setSelectedTestIdB}
          label="Test B"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleCompare} 
          disabled={!canCompare || isLoading}
        >
          {isLoading ? "Loading..." : "Compare Tests"}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {canCompare && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <ComparisonReport testA={testA} testB={testB} />
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Detailed test metrics comparison will be shown here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ComparisonTool;
