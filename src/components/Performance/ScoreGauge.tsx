
import React from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "small" | "medium" | "large";
  label?: string;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  size = "medium",
  label 
}) => {
  // Calculate color based on score
  const getColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  // Calculate size classes
  const getSizeClasses = () => {
    switch(size) {
      case "small":
        return {
          container: "w-20 h-20",
          scoreText: "text-xl",
          label: "text-xs"
        };
      case "large":
        return {
          container: "w-36 h-36",
          scoreText: "text-4xl",
          label: "text-sm"
        };
      default:
        return {
          container: "w-28 h-28",
          scoreText: "text-2xl",
          label: "text-xs"
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClass = getColor(score);
  
  // Calculate circumference and offset for the circle
  const radius = size === "large" ? 60 : size === "small" ? 32 : 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={cn("relative flex items-center justify-center rounded-full", sizeClasses.container)}>
        {/* Background circle */}
        <svg className="absolute w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={colorClass}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        {/* Score text */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizeClasses.scoreText, colorClass)}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className={cn("mt-2 text-center font-medium text-muted-foreground", sizeClasses.label)}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreGauge;
