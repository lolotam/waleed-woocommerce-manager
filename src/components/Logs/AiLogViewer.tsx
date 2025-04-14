
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownToLine, Search } from "lucide-react";
import { exportLogsToExcel, getAllLogs } from "@/utils/aiService";

interface LogEntry {
  timestamp: string;
  prompt: string;
  result: string;
  model: string;
}

const AiLogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Load logs from localStorage
  useEffect(() => {
    setLogs(getAllLogs());
  }, []);

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Toggle expanded view for a log
  const toggleExpand = (timestamp: string) => {
    const logId = timestamp;
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Format model name for display
  const formatModelName = (model: string) => {
    switch (model) {
      case 'gpt4o': return 'OpenAI GPT-4o';
      case 'claude3': return 'Claude 3 Sonnet';
      case 'gemini': return 'Google Gemini 1.5';
      default: return model;
    }
  };

  // Export logs to Excel
  const handleExport = () => {
    exportLogsToExcel();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Generation Logs</h1>
          <p className="text-muted-foreground">History of AI content generations</p>
        </div>
        <Button onClick={handleExport}>
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generation History ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{formatModelName(log.model)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">
                          {log.prompt}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpand(log.timestamp)}
                        >
                          {expandedLogId === log.timestamp ? 'Hide' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedLogId === log.timestamp && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-gray-50 dark:bg-gray-800 p-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-1">Prompt:</h3>
                              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm whitespace-pre-wrap">
                                {log.prompt}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium mb-1">Result:</h3>
                              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm whitespace-pre-wrap">
                                {log.result}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    {searchQuery ? 'No logs match your search query.' : 'No AI generation logs found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiLogViewer;
