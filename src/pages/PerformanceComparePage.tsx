
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ComparisonTool from "@/components/Performance/ComparisonTool";

const PerformanceComparePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/web-performance")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Performance Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Performance Test Comparison</h1>
      </div>
      
      <ComparisonTool />
    </div>
  );
};

export default PerformanceComparePage;
