
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Settings,
  User,
  Search,
  Download,
  Link,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TestHistoryItem } from "@/types/performance";

interface UserDashboardProps {
  history?: TestHistoryItem[];
  loading?: boolean;
  stats?: {
    totalTests: number;
    testsThisMonth: number;
    avgPerformance: number;
    avgLoadTime: number;
    avgPageSize: number;
  };
  trends?: {
    performanceChange: number;
    loadTimeChange: number;
    pageSizeChange: number;
  };
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return "bg-green-500 hover:bg-green-600";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600";
  return "bg-red-500 hover:bg-red-600";
};

const getScoreTextColor = (score: number): string => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
};

const UserDashboard: React.FC<UserDashboardProps> = ({
  history = [],
  loading = false,
  stats = {
    totalTests: 42,
    testsThisMonth: 12,
    avgPerformance: 78,
    avgLoadTime: 1850,
    avgPageSize: 1.25,
  },
  trends = {
    performanceChange: 5.2,
    loadTimeChange: -120,
    pageSizeChange: -0.15,
  },
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock test data if none provided
  const testData = history.length > 0 
    ? history 
    : Array.from({ length: 5 }, (_, i) => ({
        id: `test-${i}`,
        url: `https://example${i}.com`,
        testDate: new Date(Date.now() - i * 86400000).toISOString(), // Past days
        overallScore: Math.floor(Math.random() * 30) + 70, // Score between 70-100
      }));

  const filteredTests = testData.filter(test => 
    test.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Track and analyze web performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate("/web-performance")}>
            New Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tests Run */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tests Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                +{stats.testsThisMonth} this month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{stats.avgPerformance}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                /100
              </div>
            </div>
            <div className="flex items-center mt-1">
              {trends.performanceChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={
                trends.performanceChange > 0
                  ? "text-green-500 text-sm"
                  : "text-red-500 text-sm"
              }>
                {trends.performanceChange > 0 ? "+" : ""}
                {trends.performanceChange.toFixed(1)} points
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Load Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{stats.avgLoadTime}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                ms
              </div>
            </div>
            <div className="flex items-center mt-1">
              {trends.loadTimeChange < 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={
                trends.loadTimeChange < 0
                  ? "text-green-500 text-sm"
                  : "text-red-500 text-sm"
              }>
                {trends.loadTimeChange < 0 ? "" : "+"}
                {trends.loadTimeChange.toFixed(0)} ms
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Page Size */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Page Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{stats.avgPageSize.toFixed(1)}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                MB
              </div>
            </div>
            <div className="flex items-center mt-1">
              {trends.pageSizeChange < 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={
                trends.pageSizeChange < 0
                  ? "text-green-500 text-sm"
                  : "text-red-500 text-sm"
              }>
                {trends.pageSizeChange < 0 ? "" : "+"}
                {trends.pageSizeChange.toFixed(2)} MB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Tests</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Tests</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Score</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[100px]">Device</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading test data...
                      </TableCell>
                    </TableRow>
                  ) : filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No tests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getScoreColor(test.overallScore)}`}>
                            {test.overallScore}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {new URL(test.url).hostname}
                            <a 
                              href={test.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                              <Link className="h-4 w-4" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(test.testDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Desktop
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/test/${test.id}`)}>
                                View Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/compare?tests=${test.id}`)}>
                                Compare
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" /> Download PDF
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>No favorite tests yet.</p>
                <p className="text-sm mt-1">Mark tests as favorites to see them here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>No scheduled tests.</p>
                <p className="text-sm mt-1">Schedule regular tests to monitor performance over time.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
