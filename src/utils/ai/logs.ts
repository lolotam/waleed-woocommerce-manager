
/**
 * AI Service Logs Management
 */
import { toast } from "sonner";
import { AIModel, LogEntry } from './types';
import { MODEL_CONFIGS } from './config';

// Save log entry to localStorage
export const saveLogEntry = (prompt: string, result: string, model: AIModel) => {
  const logs = JSON.parse(localStorage.getItem('ai_logs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    prompt,
    result,
    model,
    modelDescription: MODEL_CONFIGS[model]?.description || model
  });
  localStorage.setItem('ai_logs', JSON.stringify(logs));
};

export const getAllLogs = (): LogEntry[] => {
  return JSON.parse(localStorage.getItem('ai_logs') || '[]');
};

export const exportLogsToExcel = () => {
  const logs = getAllLogs();
  // In a real app, we'd use a library like xlsx to export to Excel
  // For this demo, we'll just download a JSON file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "ai_generation_logs.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
