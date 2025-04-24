
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (files.length > 0) {
        onImagesSelected(files);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (files.length > 0) {
        onImagesSelected(files);
        // Clear the input value to allow selecting the same file again
        e.target.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <div className="bg-muted rounded-full p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">
            {isDragging ? (
              <p className="text-primary">Drop images here</p>
            ) : (
              <p>
                Drag and drop images here or <span className="text-primary">browse</span>
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: JPEG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
