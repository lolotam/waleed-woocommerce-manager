
import React from "react";
import { PerformanceRecommendation } from "@/types/performance";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface RecommendationsListProps {
  recommendations: PerformanceRecommendation[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  // Sort recommendations by impact
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const impactValues = { high: 3, medium: 2, low: 1 };
    return impactValues[b.impact] - impactValues[a.impact];
  });

  const getImpactIcon = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-amber-500" />;
      case 'low':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getImpactClass = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return "border-red-200 bg-red-50";
      case 'medium':
        return "border-amber-200 bg-amber-50";
      case 'low':
        return "border-green-200 bg-green-50";
    }
  };

  return (
    <div className="space-y-4">
      {sortedRecommendations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recommendations available. Your site is performing well!
        </div>
      ) : (
        sortedRecommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`p-4 rounded-lg border ${getImpactClass(rec.impact)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">
                {getImpactIcon(rec.impact)}
              </div>
              <div className="flex-grow">
                <h3 className="font-medium mb-1">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {rec.description}
                </p>
                {rec.remediation && (
                  <div className="mt-2 text-sm border-t pt-2 border-gray-200">
                    <strong className="block mb-1">Suggested fix:</strong>
                    <p>{rec.remediation}</p>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 self-start">
                <span className="px-2 py-1 text-xs font-medium rounded-full capitalize">
                  {rec.category}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecommendationsList;
