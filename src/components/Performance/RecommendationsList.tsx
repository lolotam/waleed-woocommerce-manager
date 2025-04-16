
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PerformanceRecommendation } from "@/types/performance";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface RecommendationsListProps {
  recommendations: PerformanceRecommendation[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  // Filter recommendations by category
  const highImpactRecs = recommendations.filter(rec => rec.impact === "high");
  const mediumImpactRecs = recommendations.filter(rec => rec.impact === "medium");
  const lowImpactRecs = recommendations.filter(rec => rec.impact === "low");

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {highImpactRecs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-500 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Critical Issues
              </h3>
              {highImpactRecs.map(rec => (
                <Alert key={rec.id} variant="destructive">
                  <AlertTitle className="flex items-center gap-2">
                    {getImpactIcon(rec.impact)}
                    {rec.title}
                  </AlertTitle>
                  <AlertDescription>{rec.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {mediumImpactRecs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-amber-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Improvements Needed
              </h3>
              {mediumImpactRecs.map(rec => (
                <Alert key={rec.id}>
                  <AlertTitle className="flex items-center gap-2">
                    {getImpactIcon(rec.impact)}
                    {rec.title}
                  </AlertTitle>
                  <AlertDescription>{rec.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {lowImpactRecs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-500 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Opportunities
              </h3>
              {lowImpactRecs.map(rec => (
                <Alert key={rec.id}>
                  <AlertTitle className="flex items-center gap-2">
                    {getImpactIcon(rec.impact)}
                    {rec.title}
                  </AlertTitle>
                  <AlertDescription>{rec.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recommendations available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsList;
