
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestHistoryItem } from "@/types/performance";

interface TestSelectorProps {
  tests: TestHistoryItem[];
  selectedTestId: string | null;
  onSelectTest: (testId: string) => void;
  label: string;
}

const TestSelector: React.FC<TestSelectorProps> = ({ 
  tests, 
  selectedTestId, 
  onSelectTest,
  label
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor={`test-selector-${label}`}>Select Test</Label>
          <Select
            value={selectedTestId || ""}
            onValueChange={onSelectTest}
          >
            <SelectTrigger id={`test-selector-${label}`}>
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {tests.length === 0 ? (
                <SelectItem value="no-tests" disabled>
                  No tests available
                </SelectItem>
              ) : (
                tests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {new URL(test.url).hostname} ({new Date(test.testDate).toLocaleDateString()})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestSelector;
