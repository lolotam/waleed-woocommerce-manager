
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  Download, 
  Maximize,
  Minimize,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PerformanceTestResult } from "@/types/performance";

interface PerformanceVisualizationProps {
  testResult: PerformanceTestResult | null;
}

const PerformanceVisualization: React.FC<PerformanceVisualizationProps> = ({ testResult }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeChart, setActiveChart] = useState('resource-types');
  const [chartType, setChartType] = useState('bar');
  const [fullscreen, setFullscreen] = useState(false);
  
  useEffect(() => {
    if (!testResult || !svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create new chart based on selected type
    switch (activeChart) {
      case 'resource-types':
        renderResourceTypeChart();
        break;
      case 'file-sizes':
        renderFileSizeChart();
        break;
      case 'load-time':
        renderLoadTimeChart();
        break;
      case 'request-timeline':
        renderRequestTimelineChart();
        break;
      default:
        renderResourceTypeChart();
    }
  }, [testResult, activeChart, chartType, fullscreen]);
  
  const renderResourceTypeChart = () => {
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    
    if (!testResult?.resources) return;
    
    // Group resources by type
    const resourceTypes: Record<string, number> = {};
    testResult.resources.forEach(res => {
      const type = res.initiatorType || 'other';
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;
    });
    
    // Convert to array
    const data = Object.entries(resourceTypes).map(([type, count]) => ({
      type,
      count
    }));
    
    // Sort by count
    data.sort((a, b) => b.count - a.count);
    
    if (chartType === 'bar') {
      // Create scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([margin.left, width - margin.right])
        .padding(0.1);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);
      
      // Color scale
      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);
      
      // Add bars
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type) || 0)
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.count))
        .attr('fill', d => color(d.type))
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          
          svg.append('text')
            .attr('class', 'tooltip-text')
            .attr('x', (x(d.type) || 0) + x.bandwidth() / 2)
            .attr('y', y(d.count) - 10)
            .attr('text-anchor', 'middle')
            .text(`${d.count} (${Math.round(d.count / testResult.resources.length * 100)}%)`)
            .style('font-size', '12px')
            .style('fill', '#333');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          svg.selectAll('.tooltip-text').remove();
        });
      
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
      
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
      
      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Resource Types');
    } else if (chartType === 'pie') {
      // Create pie chart
      const radius = Math.min(width, height) / 2 - margin.top;
      
      // Color scale
      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);
      
      // Create pie layout
      const pie = d3.pie<{ type: string, count: number }>()
        .value(d => d.count)
        .sort(null);
      
      const arc = d3.arc<d3.PieArcDatum<{ type: string, count: number }>>()
        .innerRadius(0)
        .outerRadius(radius);
      
      const labelArc = d3.arc<d3.PieArcDatum<{ type: string, count: number }>>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.6);
      
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
      // Add pie slices
      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');
      
      arcs.append('path')
        .attr('d', d => arc(d) || "")
        .attr('fill', d => color(d.data.type))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          
          // Add tooltip
          g.append('text')
            .attr('class', 'tooltip-text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(`${d.data.type}: ${d.data.count} (${Math.round(d.data.count / testResult.resources.length * 100)}%)`)
            .style('font-size', '14px')
            .style('fill', '#333')
            .style('font-weight', 'bold');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          g.selectAll('.tooltip-text').remove();
        });
      
      // Add labels
      arcs.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '0.35em')
        .text(d => d.data.type)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#fff')
        .style('font-weight', 'bold')
        .each(function(d) {
          // Hide labels for small slices
          if (d.data.count / testResult.resources.length < 0.05) {
            d3.select(this).style('display', 'none');
          }
        });
      
      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Resource Types');
    }
  };
  
  const renderFileSizeChart = () => {
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    
    if (!testResult?.resources) return;
    
    // Group resources by type and calculate total size
    const resourceSizes: Record<string, number> = {};
    testResult.resources.forEach(res => {
      const type = res.initiatorType || 'other';
      const size = res.transferSize || 0;
      
      resourceSizes[type] = (resourceSizes[type] || 0) + size;
    });
    
    // Convert to array
    const data = Object.entries(resourceSizes).map(([type, size]) => ({
      type,
      size: size / 1024 // Convert to KB
    }));
    
    // Sort by size
    data.sort((a, b) => b.size - a.size);
    
    if (chartType === 'bar') {
      // Create scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([margin.left, width - margin.right])
        .padding(0.1);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.size) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);
      
      // Color scale
      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);
      
      // Add bars
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type) || 0)
        .attr('y', d => y(d.size))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.size))
        .attr('fill', d => color(d.type))
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          
          svg.append('text')
            .attr('class', 'tooltip-text')
            .attr('x', (x(d.type) || 0) + x.bandwidth() / 2)
            .attr('y', y(d.size) - 10)
            .attr('text-anchor', 'middle')
            .text(`${d.size.toFixed(1)} KB`)
            .style('font-size', '12px')
            .style('fill', '#333');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          svg.selectAll('.tooltip-text').remove();
        });
      
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
      
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} KB`));
      
      // Add y-axis label
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left / 3)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .text('Size (KB)');
      
      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Resource Sizes by Type');
    } else if (chartType === 'pie') {
      // Create pie chart for file sizes
      const radius = Math.min(width, height) / 2 - margin.top;
      
      // Total size for percentage calculations
      const totalSize = data.reduce((sum, d) => sum + d.size, 0);
      
      // Color scale
      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);
      
      // Create pie layout
      const pie = d3.pie<{ type: string, size: number }>()
        .value(d => d.size)
        .sort(null);
      
      const arc = d3.arc<d3.PieArcDatum<{ type: string, size: number }>>()
        .innerRadius(0)
        .outerRadius(radius);
      
      const labelArc = d3.arc<d3.PieArcDatum<{ type: string, size: number }>>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.6);
      
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
      // Add pie slices
      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');
      
      arcs.append('path')
        .attr('d', d => arc(d) || "")
        .attr('fill', d => color(d.data.type))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          
          // Add tooltip
          g.append('text')
            .attr('class', 'tooltip-text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(`${d.data.type}: ${d.data.size.toFixed(1)} KB (${Math.round(d.data.size / totalSize * 100)}%)`)
            .style('font-size', '14px')
            .style('fill', '#333')
            .style('font-weight', 'bold');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          g.selectAll('.tooltip-text').remove();
        });
      
      // Add labels
      arcs.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '0.35em')
        .text(d => d.data.type)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#fff')
        .style('font-weight', 'bold')
        .each(function(d) {
          // Hide labels for small slices
          if (d.data.size / totalSize < 0.05) {
            d3.select(this).style('display', 'none');
          }
        });
      
      // Add legend for larger charts
      if (fullscreen) {
        const legend = svg.append('g')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 12)
          .attr('text-anchor', 'start')
          .selectAll('g')
          .data(data)
          .enter().append('g')
          .attr('transform', (d, i) => `translate(${width - margin.right + 20},${margin.top + i * 20})`);
        
        legend.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', d => color(d.type));
        
        legend.append('text')
          .attr('x', 20)
          .attr('y', 9.5)
          .attr('dy', '0.32em')
          .text(d => `${d.type}: ${d.size.toFixed(1)} KB`);
      }
      
      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Resource Sizes by Type');
    }
  };
  
  // Stub implementations for other chart types
  const renderLoadTimeChart = () => {
    // For now, just render a placeholder text
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Load Time Chart - Coming Soon');
  };
  
  const renderRequestTimelineChart = () => {
    // For now, just render a placeholder text
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Request Timeline Chart - Coming Soon');
  };
  
  const downloadChart = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      ctx.drawImage(img, 0, 0);
      
      const a = document.createElement('a');
      a.download = `${activeChart}-chart.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  if (!testResult) {
    return <div>No test data available for visualization</div>;
  }
  
  return (
    <Card className={`${fullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Performance Visualization</h3>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value)}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="bar" aria-label="Bar Chart">
                        <BarChart className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Bar Chart</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="pie" aria-label="Pie Chart">
                        <PieChart className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Pie Chart</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="line" aria-label="Line Chart">
                        <LineChart className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Line Chart</TooltipContent>
                  </Tooltip>
                </ToggleGroup>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={downloadChart}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download chart</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                      {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <Tabs value={activeChart} onValueChange={setActiveChart}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="resource-types">Resource Types</TabsTrigger>
              <TabsTrigger value="file-sizes">File Sizes</TabsTrigger>
              <TabsTrigger value="load-time">Load Timeline</TabsTrigger>
              <TabsTrigger value="request-timeline">Request Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resource-types">
              <div className="chart-container relative mt-4">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="chart-description mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" /> This chart shows the distribution of resource types on the page. 
                Optimizing the number of requests can improve page load performance.
              </div>
            </TabsContent>
            
            <TabsContent value="file-sizes">
              <div className="chart-container relative mt-4">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="chart-description mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" /> This chart shows the total size of each resource type. 
                Large resources can significantly slow down page load times.
              </div>
            </TabsContent>
            
            <TabsContent value="load-time">
              <div className="chart-container relative mt-4">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="chart-description mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" /> This chart shows when each resource started loading relative to page load.
                Resources loading earlier in the timeline can block rendering.
              </div>
            </TabsContent>
            
            <TabsContent value="request-timeline">
              <div className="chart-container relative mt-4">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="chart-description mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" /> This chart shows the timeline of requests during page load.
                Looking at patterns can help identify optimization opportunities.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceVisualization;
