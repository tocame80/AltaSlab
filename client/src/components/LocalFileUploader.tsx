import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface LocalFileUploaderProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onUploadComplete?: (result: { success: boolean; fileName?: string; fileSize?: number; error?: string }) => void;
  uploadEndpoint: string;
  buttonClassName?: string;
  children: ReactNode;
}

export function LocalFileUploader({
  maxFileSize = 10485760,
  allowedFileTypes = ['application/pdf'],
  onUploadComplete,
  uploadEndpoint,
  buttonClassName,
  children,
}: LocalFileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input immediately to prevent issues
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file size
    if (file.size > maxFileSize) {
      onUploadComplete?.({ 
        success: false, 
        error: `Файл слишком большой. Максимум ${formatFileSize(maxFileSize)}` 
      });
      return;
    }

    // Validate file type
    const fileType = file.type;
    const isValidType = allowedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -2));
      }
      return fileType === type;
    });

    if (!isValidType) {
      onUploadComplete?.({ 
        success: false, 
        error: `Недопустимый тип файла. Разрешены: ${allowedFileTypes.join(', ')}` 
      });
      return;
    }

    setUploading(true);

    try {
      console.log('Uploading file locally:', file.name);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Local upload successful:', result);
        
        onUploadComplete?.({ 
          success: true, 
          fileName: result.fileName || file.name,
          fileSize: file.size
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadComplete?.({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFileTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button 
        onClick={handleButtonClick} 
        className={buttonClassName}
        disabled={uploading}
      >
        {uploading ? 'Загрузка...' : children}
      </Button>
    </div>
  );
}