
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BrandLogoUploadProps } from "@/types/brandLogo";
import { Upload, X, File as FileIcon, Image, Folder } from "lucide-react";

const BrandLogoUpload = ({ files, onFilesAdded, onRemoveFile, allowFolderUpload }: BrandLogoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    const newFiles: File[] = [];
    
    // Filter for image files only
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
      } else {
        toast.error(`${file.name} is not an image file`);
      }
    }
    
    if (newFiles.length > 0) {
      onFilesAdded(newFiles);
      toast.success(`${newFiles.length} image files added`);
    } else {
      toast.error("No valid image files found");
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const triggerFolderInput = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Drag and drop logo files here</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse for files
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, JPEG, or GIF files only
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
      
      {allowFolderUpload && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="w-full py-6" 
            onClick={triggerFolderInput}
          >
            <Folder className="mr-2 h-5 w-5" />
            Select Folder with Logo Images
          </Button>
          <input
            ref={folderInputRef}
            type="file"
            // Use attribute spread instead of direct props for non-standard attributes
            {...{
              webkitdirectory: "",
              directory: "",
              multiple: true
            }}
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Select an entire folder containing logo images
          </p>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Uploaded Files ({files.length})</h3>
            {files.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  files.forEach(file => onRemoveFile(file.name));
                  toast.info("All files removed");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Remove All
              </Button>
            )}
          </div>
          <div className="grid gap-2">
            {files.map((file) => (
              <div 
                key={file.name} 
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.name);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogoUpload;
