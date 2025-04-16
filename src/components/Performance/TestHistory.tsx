
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestHistoryItem } from "@/types/performance";
import { Clock, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

const TestHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mocked data - would normally be fetched from an API
  const [historyItems, setHistoryItems] = useState<TestHistoryItem[]>([
    {
      id: "test-1",
      url: "https://example.com",
      testDate: "2025-04-15T14:30:00Z",
      overallScore: 85
    },
    {
      id: "test-2",
      url: "https://anotherdomain.com",
      testDate: "2025-04-14T10:15:00Z",
      overallScore: 72
    },
    {
      id: "test-3",
      url: "https://mywebsite.org",
      testDate: "2025-04-13T09:45:00Z",
      overallScore: 91
    }
  ]);

  const filteredItems = historyItems.filter(item => 
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Test History
        </CardTitle>
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by URL..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No test history found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-500 hover:underline"
                    >
                      {item.url}
                    </a>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(item.testDate)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">Score:</span>
                    <span className={`font-bold text-lg ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestHistory;
