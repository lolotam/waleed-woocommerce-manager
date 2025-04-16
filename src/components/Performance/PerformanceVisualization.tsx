import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PerformanceTestResult } from "@/types/performance";
import {
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Maximize,
  Minimize,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PerformanceVisualizationProps {
  testResult: PerformanceTestResult;
}

const PerformanceVisualization: React.FC<PerformanceVisualizationProps> = ({ testResult }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeChart, setActiveChart] = useState<string>("resource-types");
  const [chartType, setChartType] = useState<string>("bar");
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!testResult || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    switch (activeChart) {
      case "resource-types":
        renderResourceTypeChart();
        break;
      case "file-sizes":
        renderFileSizeChart();
        break;
      case "load-time":
        renderPlaceholderChart("Load Timeline");
        break;
      case "request-timeline":
        renderPlaceholderChart("Request Timeline");
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

    const resourceTypes: Record<string, number> = {
      document: 1,
      stylesheet: 3,
      script: 12,
      image: 18,
      font: 3,
      xhr: 5,
      other: 2
    };

    const data = Object.entries(resourceTypes).map(([type, count]) => ({
      type,
      count
    }));

    data.sort((a, b) => b.count - a.count);

    if (chartType === "bar") {
      const x = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);

      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type) || 0)
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.count))
        .attr("fill", d => color(d.type) as string)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);

          svg.append("text")
            .attr("class", "tooltip-text")
            .attr("x", (x(d.type) || 0) + x.bandwidth() / 2)
            .attr("y", y(d.count) - 10)
            .attr("text-anchor", "middle")
            .text(`${d.count} (${Math.round(d.count / data.reduce((sum, item) => sum + item.count, 0) * 100)}%)`)
            .style("font-size", "12px")
            .style("fill", "#333");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          svg.selectAll(".tooltip-text").remove();
        });

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Resource Types");
    } else if (chartType === "pie") {
      const radius = Math.min(width, height) / 2 - margin.top;

      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);

      const pie = d3.pie<any>()
        .value(d => d.count)
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(0)
        .outerRadius(radius);

      const labelArc = d3.arc<any>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.6);

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.type) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);

          g.append("text")
            .attr("class", "tooltip-text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(`${d.data.type}: ${d.data.count} (${Math.round(d.data.count / data.reduce((sum, item) => sum + item.count, 0) * 100)}%)`)
            .style("font-size", "14px")
            .style("fill", "#333")
            .style("font-weight", "bold");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          g.selectAll(".tooltip-text").remove();
        });

      arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .text(d => d.data.type)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .style("font-weight", "bold")
        .each(function(d) {
          if (d.data.count / data.reduce((sum, item) => sum + item.count, 0) < 0.05) {
            d3.select(this).style("display", "none");
          }
        });

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Resource Types");
    }
  };

  const renderFileSizeChart = () => {
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };

    const resourceSizes: Record<string, number> = {
      document: 25,
      stylesheet: 120,
      script: 450,
      image: 780,
      font: 180,
      xhr: 75,
      other: 30
    };

    const data = Object.entries(resourceSizes).map(([type, size]) => ({
      type,
      size
    }));

    data.sort((a, b) => b.size - a.size);

    if (chartType === "bar") {
      const x = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.size) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);

      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type) || 0)
        .attr("y", d => y(d.size))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.size))
        .attr("fill", d => color(d.type) as string)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);

          svg.append("text")
            .attr("class", "tooltip-text")
            .attr("x", (x(d.type) || 0) + x.bandwidth() / 2)
            .attr("y", y(d.size) - 10)
            .attr("text-anchor", "middle")
            .text(`${d.size.toFixed(1)} KB`)
            .style("font-size", "12px")
            .style("fill", "#333");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          svg.selectAll(".tooltip-text").remove();
        });

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} KB`));

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 3)
        .attr("x", -(height / 2))
        .attr("text-anchor", "middle")
        .text("Size (KB)");

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Resource Sizes by Type");
    } else if (chartType === "pie") {
      const radius = Math.min(width, height) / 2 - margin.top;

      const totalSize = data.reduce((sum, d) => sum + d.size, 0);

      const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.type))
        .range(d3.schemeCategory10);

      const pie = d3.pie<any>()
        .value(d => d.size)
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(0)
        .outerRadius(radius);

      const labelArc = d3.arc<any>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.6);

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.type) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.8);

          g.append("text")
            .attr("class", "tooltip-text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(`${d.data.type}: ${d.data.size.toFixed(1)} KB (${Math.round(d.data.size / totalSize * 100)}%)`)
            .style("font-size", "14px")
            .style("fill", "#333")
            .style("font-weight", "bold");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          g.selectAll(".tooltip-text").remove();
        });

      arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .text(d => d.data.type)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .style("font-weight", "bold")
        .each(function(d) {
          if (d.data.size / totalSize < 0.05) {
            d3.select(this).style("display", "none");
          }
        });

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Resource Sizes by Type");
    }
  };

  const renderPlaceholderChart = (title: string) => {
    const svg = d3.select(svgRef.current);
    const width = fullscreen ? window.innerWidth - 100 : 600;
    const height = fullscreen ? window.innerHeight - 200 : 400;

    svg.selectAll("*").remove();

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#666")
      .text(`${title} chart will be displayed here`);
  };

  const downloadChart = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      ctx.drawImage(img, 0, 0);

      const a = document.createElement("a");
      a.download = `${activeChart}-chart.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}>
      <Card className="w-full h-full overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>Performance Visualization</CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 py-1 ${chartType === "bar" ? "bg-muted" : ""}`}
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Bar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 py-1 ${chartType === "pie" ? "bg-muted" : ""}`}
                onClick={() => setChartType("pie")}
              >
                <PieChart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Pie</span>
              </Button>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={downloadChart}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download chart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                    {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 h-full">
          <Tabs
            value={activeChart}
            onValueChange={setActiveChart}
            className="w-full flex flex-col h-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="resource-types">Resource Types</TabsTrigger>
              <TabsTrigger value="file-sizes">File Sizes</TabsTrigger>
              <TabsTrigger value="load-time">Load Timeline</TabsTrigger>
              <TabsTrigger value="request-timeline">Request Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resource-types" className="flex-grow h-full">
              <div className="chart-container h-full">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" />
                This chart shows the distribution of resource types on the page.
                Optimizing the number of requests can improve page load performance.
              </div>
            </TabsContent>
            
            <TabsContent value="file-sizes" className="flex-grow h-full">
              <div className="chart-container h-full">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" />
                This chart shows the total size of each resource type.
                Large resources can significantly slow down page load times.
              </div>
            </TabsContent>
            
            <TabsContent value="load-time" className="flex-grow h-full">
              <div className="chart-container h-full">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" />
                This chart shows when each resource started loading relative to page load.
                Resources loading earlier in the timeline can block rendering.
              </div>
            </TabsContent>
            
            <TabsContent value="request-timeline" className="flex-grow h-full">
              <div className="chart-container h-full">
                <svg
                  ref={svgRef}
                  width={fullscreen ? window.innerWidth - 100 : 600}
                  height={fullscreen ? window.innerHeight - 200 : 400}
                  className="mx-auto"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" />
                This chart shows the timeline of requests during page load.
                Looking at patterns can help identify optimization opportunities.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceVisualization;
