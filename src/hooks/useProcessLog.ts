
import { useState, useEffect } from "react";
import { ProcessedItem } from "@/types/brandLogo";
import { detectPermissionError } from "@/utils/errorUtils";

export interface ProcessLogReturnType {
  processLog: string[];
  processedItems: ProcessedItem[];
  hasPermissionError: boolean;
  addLogEntry: (message: string) => void;
  clearLog: () => void;
}

export function useProcessLog(): ProcessLogReturnType {
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const addLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[LOG ${timestamp}] ${message}`);
    
    setProcessLog(prev => [...prev, `[${timestamp}] ${message}`]);

    // Check for permission errors
    if (detectPermissionError(message)) {
      console.log("Permission error detected in log:", message);
      setHasPermissionError(true);
    }
  };
  
  const clearLog = () => {
    setProcessLog([]);
    setProcessedItems([]);
    setHasPermissionError(false);
  };

  return {
    processLog,
    processedItems,
    hasPermissionError,
    addLogEntry,
    clearLog
  };
}

export default useProcessLog;
