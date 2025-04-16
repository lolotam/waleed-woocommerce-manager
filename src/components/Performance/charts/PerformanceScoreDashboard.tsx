
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart, Clock, Download, FileText, Rocket } from "lucide-react";
import { PerformanceTestResult, CrawlerResult, LighthouseMetrics } from "@/types/performance";

interface PerformanceScoreDashboardProps {
  testResult?: PerformanceTestResult | null;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return "bg-green-500"; // Green
  if (score >= 70) return "bg-yellow-500"; // Yellow
  return "bg-red-500"; // Red
};

const getScoreTextColor = (score: number): string => {
  if (score >= 90) return "text-green-500"; // Green
  if (score >= 70) return "text-yellow-500"; // Yellow
  return "text-red-500"; // Red
};

const LighthouseScore = ({ 
  score, 
  label 
}: { 
  score: number; 
  label: string;
}) => (
  <div className="flex flex-col items-center">
    <div className={`relative inline-flex h-24 w-24 items-center justify-center rounded-full border-4 ${getScoreColor(score)}`}>
      <span className="text-2xl font-bold">{score}</span>
    </div>
    <span className="mt-2 text-sm font-medium">{label}</span>
  </div>
);

const StatisticCard = ({ 
  title, 
  value, 
  suffix, 
  icon: Icon 
}: { 
  title: string; 
  value: number | string; 
  suffix?: string; 
  icon: React.ElementType;
}) => (
  <div className="flex flex-col">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="flex items-center mt-1">
      <Icon className="h-4 w-4 mr-1 text-muted-foreground" />
      <span className="text-2xl font-semibold">
        {value}
        {suffix && <span className="text-base ml-1 font-normal text-muted-foreground">{suffix}</span>}
      </span>
    </div>
  </div>
);

const PerformanceScoreDashboard: React.FC<PerformanceScoreDashboardProps> = ({ testResult }) => {
  if (!testResult) return <div>No test results available.</div>;
  
  const { scores, metrics } = testResult;
  
  // Mock lighthouse scores since our model doesn't have these directly
  const lighthouseScores: LighthouseMetrics = {
    performance: scores.speed,
    accessibility: scores.accessibility,
    'best-practices': scores.optimization,
    seo: Math.round((scores.accessibility + scores.optimization) / 2) // Derived metric
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main score card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                <svg className="w-40 h-40">
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="12"
                  />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    fill="none" 
                    stroke={getScoreTextColor(scores.overall).replace('text-', 'stroke-')} 
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 70 * scores.overall / 100} ${2 * Math.PI * 70 * (1 - scores.overall / 100)}`}
                    strokeDashoffset={Math.PI * 70 / 2}
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreTextColor(scores.overall)}`}>{scores.overall}</span>
                  <span className="text-sm text-muted-foreground mt-1">Score</span>
                </div>
              </div>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="text-sm text-muted-foreground space-y-1 w-full">
              <div>Tested URL: {testResult.url}</div>
              <div>Test date: {new Date(testResult.testDate).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Core metrics card */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Core Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <StatisticCard 
                title="Page Load Time" 
                value={metrics.pageLoadTime.toFixed(1)} 
                suffix="s" 
                icon={Clock} 
              />
              <StatisticCard 
                title="First Contentful Paint" 
                value={metrics.firstContentfulPaint.toFixed(1)} 
                suffix="s" 
                icon={Clock} 
              />
              <StatisticCard 
                title="Resources" 
                value={metrics.numberOfRequests} 
                icon={FileText} 
              />
              <StatisticCard 
                title="Page Size" 
                value={metrics.totalPageSize.toFixed(1)} 
                suffix="MB" 
                icon={Download} 
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Speed</span>
                  <span className={`text-sm font-semibold ${getScoreTextColor(scores.speed)}`}>{scores.speed}</span>
                </div>
                <Progress 
                  value={scores.speed} 
                  className={getScoreColor(scores.speed)} 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Optimization</span>
                  <span className={`text-sm font-semibold ${getScoreTextColor(scores.optimization)}`}>{scores.optimization}</span>
                </div>
                <Progress 
                  value={scores.optimization} 
                  className={getScoreColor(scores.optimization)} 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Accessibility</span>
                  <span className={`text-sm font-semibold ${getScoreTextColor(scores.accessibility)}`}>{scores.accessibility}</span>
                </div>
                <Progress 
                  value={scores.accessibility} 
                  className={getScoreColor(scores.accessibility)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lighthouse scores */}
      <Card>
        <CardHeader>
          <CardTitle>Lighthouse Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <LighthouseScore score={lighthouseScores.performance} label="Performance" />
            <LighthouseScore score={lighthouseScores.accessibility} label="Accessibility" />
            <LighthouseScore score={lighthouseScores["best-practices"]} label="Best Practices" />
            <LighthouseScore score={lighthouseScores.seo} label="SEO" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceScoreDashboard;
