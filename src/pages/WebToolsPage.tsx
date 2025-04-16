
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, BarChart } from "lucide-react";

const WebToolsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Web Tools</h1>
        <p className="text-muted-foreground">
          Advanced tools for web data extraction and performance analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Web Scraper
            </CardTitle>
            <CardDescription>
              Extract product data from e-commerce websites and import to your store
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild>
              <Link to="/scraper">Open Web Scraper</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Web Performance
            </CardTitle>
            <CardDescription>
              Analyze website performance and get optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild>
              <Link to="/web-performance">Open Performance Tools</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebToolsPage;
