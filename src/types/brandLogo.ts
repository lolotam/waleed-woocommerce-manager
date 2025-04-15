
export interface BrandLogoConfigType {
  targetType: "brands" | "categories";
  addToDescription: boolean;
  fuzzyMatching: boolean;
  saveConfigurations: boolean;
  allowFolderUpload: boolean;
}

export interface ProcessedItem {
  filename: string;
  status: "pending" | "success" | "failed";
  targetName: string;
  message?: string;
  mediaId?: number;
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
