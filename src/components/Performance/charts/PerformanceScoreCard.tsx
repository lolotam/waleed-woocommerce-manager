
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceScoreCardProps {
  title: string;
  score: number;
}

const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({ title, score }) => {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  // Determine background color for the gauge
  const getScoreBackgroundColor = () => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Calculate the circle path for the score gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
        <div className="relative flex items-center justify-center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted opacity-20"
            />
            {/* Foreground circle representing the score */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={getScoreBackgroundColor()}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className={`absolute text-2xl font-bold ${getScoreColor()}`}>
            {score}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceScoreCard;
