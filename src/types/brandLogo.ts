export interface BrandLogoConfigType {
  targetType: "brands" | "categories";
  addToDescription: boolean;
  fuzzyMatching: boolean;
  saveConfigurations: boolean;
  allowFolderUpload: boolean;
  url?: string;
  authMethod?: 'consumer_keys' | 'app_password' | 'oauth';
  wpUsername?: string;
  wpAppPassword?: string;
  consumerKey?: string;
  consumerSecret?: string;
}

export interface BrandLogoConfigProps {
  config: BrandLogoConfigType;
  onUpdateConfig: (config: Partial<BrandLogoConfigType>) => void;
}

export interface BrandLogoUploadProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (filename: string) => void;
  allowFolderUpload: boolean;
}

export interface BrandLogoMappingProps {
  files: File[];
  mappings: Record<string, string>;
  onUpdateMapping: (filename: string, brandName: string) => void;
  targetType: "brands" | "categories";
}

export interface BrandLogoProcessingProps {
  files: File[];
  mappings: Record<string, string>;
  isProcessing: boolean;
  processed: {
    success: number;
    failed: number;
    total: number;
  };
  onStartProcessing: () => void;
  config: BrandLogoConfigType;
}

export interface ProcessedItem {
  filename: string;
  targetName: string;
  status: 'pending' | 'success' | 'failed';
  message?: string;
}

export interface ProcessingControlsProps {
  isProcessing: boolean;
  hasFiles: boolean;
  hasLogs: boolean;
  onStartProcessing: () => void;
  onClearLog: () => void;
}

export interface ProgressIndicatorProps {
  processed: {
    success: number;
    failed: number;
    total: number;
  };
}

export interface ProcessingLogProps {
  processLog: string[];
}

export interface ProcessedItemsProps {
  processedItems: ProcessedItem[];
}

export interface ProcessingSummaryProps {
  config: BrandLogoConfigType;
  filesCount: number;
}

export interface PermissionErrorAlertProps {
  hasError: boolean;
  onTabChange: (tab: string) => void;
}

// Types for processing state
export interface ProcessingState {
  isProcessing: boolean;
  processed: {
    success: number;
    failed: number;
    total: number;
  };
}

// Types for the REST API test results
export interface RestApiTestResult {
  accessible: boolean;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  isJsonResponse?: boolean;
  error?: string;
  networkError?: boolean;
}
