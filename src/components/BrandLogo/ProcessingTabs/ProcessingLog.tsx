
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessingLogProps {
  processLog: string[];
}

const ProcessingLog = ({ processLog }: ProcessingLogProps) => {
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [processLog]);
  
  return (
    <div className="border rounded-md">
      <div className="p-3 border-b bg-muted/50">
        <h4 className="font-medium">Processing Log</h4>
      </div>
      <ScrollArea className="h-60 p-3" ref={logRef}>
        {processLog.length > 0 ? (
          <div className="space-y-1 font-mono text-sm">
            {processLog.map((log, index) => (
              <div key={index} className={log.includes("error") || log.includes("failed") ? "text-red-500" : ""}>{log}</div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">
              Processing log will appear here
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProcessingLog;
