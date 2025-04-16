
import React, { useState } from "react";
import { Check, AlertTriangle, XCircle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { PerformanceRecommendation, PerformanceTestResult, ResourceTiming } from "@/types/performance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface RecommendationsPanelProps {
  recommendations: PerformanceRecommendation[];
  testResult?: PerformanceTestResult;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  recommendations, 
  testResult 
}) => {
  // Sort recommendations by impact (high to low)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  // Group recommendations by category for easier access
  const groupedRecommendations = {
    high: sortedRecommendations.filter(rec => rec.impact === 'high'),
    medium: sortedRecommendations.filter(rec => rec.impact === 'medium'),
    low: sortedRecommendations.filter(rec => rec.impact === 'low')
  };

  // Generate some mock passed checks if none provided
  const passedChecks = testResult?.passedChecks || [
    {
      id: "passed1",
      title: "Properly sized images",
      description: "All images are properly sized for their display dimensions."
    },
    {
      id: "passed2",
      title: "Use of HTTPS",
      description: "Website is served over a secure HTTPS connection."
    },
    {
      id: "passed3",
      title: "Proper document encoding",
      description: "Document uses proper character encoding and doctype."
    }
  ];

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">High Impact</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Impact</Badge>;
      case 'low': return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low Impact</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  // Mock resources for recommendations that don't have them
  const getMockResourcesForRecommendation = (recommendation: PerformanceRecommendation): ResourceTiming[] => {
    // Return mock resources based on recommendation type
    switch (recommendation.category) {
      case 'speed':
        return [
          {
            name: '/main.js',
            initiatorType: 'script',
            startTime: 120,
            duration: 450,
            transferSize: 245000,
            decodedBodySize: 650000
          },
          {
            name: '/vendor.js',
            initiatorType: 'script',
            startTime: 150,
            duration: 320,
            transferSize: 180000,
            decodedBodySize: 420000
          }
        ];
      case 'optimization':
        return [
          {
            name: '/hero-image.jpg',
            initiatorType: 'image',
            startTime: 200,
            duration: 350,
            transferSize: 1200000,
            decodedBodySize: 1200000
          },
          {
            name: '/banner.png',
            initiatorType: 'image',
            startTime: 220,
            duration: 280,
            transferSize: 850000,
            decodedBodySize: 850000
          }
        ];
      default:
        return [];
    }
  };

  // Generate mock remediation text if none is provided
  const getRemediationText = (recommendation: PerformanceRecommendation) => {
    if (recommendation.remediation) return recommendation.remediation;
    
    switch (recommendation.category) {
      case 'speed':
        return "Implement code splitting, lazy loading, and minification to reduce JavaScript bundle sizes. Consider using modern compression algorithms.";
      case 'optimization':
        return "Use modern image formats like WebP, properly size images, and implement lazy loading for images below the fold.";
      case 'accessibility':
        return "Add proper alt text to images, ensure sufficient color contrast, and make sure all interactive elements are keyboard accessible.";
      case 'best-practices':
        return "Follow web standards and best practices. Use semantic HTML and ensure all resources load properly.";
      default:
        return "Follow web performance best practices to address this issue.";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Performance Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="issues">
          <TabsList className="mb-4">
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues to Fix
            </TabsTrigger>
            <TabsTrigger value="passed" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Passed Checks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues">
            {recommendations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Check className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium">No issues detected!</p>
                <p>Your website appears to be well optimized.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedRecommendations.high.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Critical Issues
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {groupedRecommendations.high.map(recommendation => (
                        <AccordionItem key={recommendation.id} value={recommendation.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2 text-left font-medium">
                                {getImpactIcon(recommendation.impact)}
                                {recommendation.title}
                              </div>
                              {getImpactLabel(recommendation.impact)}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 pt-2 px-2">
                            <div className="space-y-4">
                              <p className="text-muted-foreground">{recommendation.description}</p>
                              
                              {/* Affected Resources Table */}
                              {(recommendation.resources || getMockResourcesForRecommendation(recommendation)).length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Affected Resources:</h4>
                                  <div className="border rounded-md">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Resource</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead className="text-right">Size</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(recommendation.resources || getMockResourcesForRecommendation(recommendation)).map((resource, i) => {
                                          let displayName = resource.name;
                                          try {
                                            const url = new URL(resource.name);
                                            displayName = url.pathname.split('/').pop() || url.pathname;
                                          } catch (e) {
                                            displayName = resource.name.split('/').pop() || resource.name;
                                          }
                                          
                                          return (
                                            <TableRow key={i}>
                                              <TableCell className="font-medium">{displayName}</TableCell>
                                              <TableCell>{resource.initiatorType}</TableCell>
                                              <TableCell className="text-right">
                                                {(resource.transferSize / 1024).toFixed(1)} KB
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                              
                              {/* How to Fix Section */}
                              <div>
                                <h4 className="font-medium mb-2">How to Fix:</h4>
                                <p className="text-muted-foreground">{getRemediationText(recommendation)}</p>
                              </div>
                              
                              <Button size="sm" variant="outline" className="mt-2">
                                Learn More
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
                
                {groupedRecommendations.medium.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-yellow-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Improvements Needed
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {groupedRecommendations.medium.map(recommendation => (
                        <AccordionItem key={recommendation.id} value={recommendation.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2 text-left font-medium">
                                {getImpactIcon(recommendation.impact)}
                                {recommendation.title}
                              </div>
                              {getImpactLabel(recommendation.impact)}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 pt-2 px-2">
                            <div className="space-y-4">
                              <p className="text-muted-foreground">{recommendation.description}</p>
                              
                              {/* How to Fix Section */}
                              <div>
                                <h4 className="font-medium mb-2">How to Fix:</h4>
                                <p className="text-muted-foreground">{getRemediationText(recommendation)}</p>
                              </div>
                              
                              <Button size="sm" variant="outline" className="mt-2">
                                Learn More
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
                
                {groupedRecommendations.low.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-500 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Opportunities
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {groupedRecommendations.low.map(recommendation => (
                        <AccordionItem key={recommendation.id} value={recommendation.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2 text-left font-medium">
                                {getImpactIcon(recommendation.impact)}
                                {recommendation.title}
                              </div>
                              {getImpactLabel(recommendation.impact)}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 pt-2 px-2">
                            <div className="space-y-4">
                              <p className="text-muted-foreground">{recommendation.description}</p>
                              
                              {/* How to Fix Section */}
                              <div>
                                <h4 className="font-medium mb-2">How to Fix:</h4>
                                <p className="text-muted-foreground">{getRemediationText(recommendation)}</p>
                              </div>
                              
                              <Button size="sm" variant="outline" className="mt-2">
                                Learn More
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="passed">
            <div className="space-y-3">
              {passedChecks.length > 0 ? (
                <div className="space-y-4">
                  {passedChecks.map(check => (
                    <div key={check.id} className="flex items-start gap-3 p-3 border rounded-md bg-green-50">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{check.title}</h4>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No passed checks available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;
