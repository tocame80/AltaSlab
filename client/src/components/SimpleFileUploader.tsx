import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SimpleFileUploaderProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { success: boolean; uploadURL?: string; error?: string }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function SimpleFileUploader({
  maxFileSize = 10485760,
  allowedFileTypes = ['application/pdf'],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: SimpleFileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input immediately to prevent issues
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file size
    if (file.size > maxFileSize) {
      onComplete?.({ success: false, error: `Файл слишком большой. Максимум ${Math.round(maxFileSize / 1024 / 1024)} МБ` });
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
      onComplete?.({ success: false, error: `Недопустимый тип файла. Разрешены: ${allowedFileTypes.join(', ')}` });
      return;
    }

    setUploading(true);

    try {
      console.log('Getting upload parameters...');
      const { url, method } = await onGetUploadParameters();
      
      console.log('Uploading file to:', url);
      const response = await fetch(url, {
        method,
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (response.ok) {
        console.log('Upload successful, URL:', url);
        onComplete?.({ success: true, uploadURL: url });
      } else {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onComplete?.({ success: false, error: error instanceof Error ? error.message : 'Ошибка загрузки' });
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (uploading) return; // Prevent multiple clicks while uploading
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