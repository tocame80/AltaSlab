import { FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileDisplayProps {
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  onReplace?: () => void;
  className?: string;
}

export function FileDisplay({ fileName, fileSize, fileUrl, onReplace, className }: FileDisplayProps) {
  if (!fileName && !fileUrl) {
    return null;
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  };

  const getDisplayName = (name?: string, url?: string): string => {
    if (name) {
      // Remove file extension and clean up name
      return name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
    }
    if (url) {
      // Extract filename from URL and clean it up
      const urlFileName = url.split('/').pop() || '';
      return urlFileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
    }
    return 'Документ';
  };

  const displayName = getDisplayName(fileName, fileUrl);
  const sizeText = formatFileSize(fileSize);

  return (
    <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileText className="text-red-600 mt-1" size={20} />
          <div>
            <div className="font-medium text-gray-900">{displayName}</div>
            <div className="text-sm text-gray-600">
              PDF{sizeText ? `, ${sizeText}` : ''}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
              className="h-8 px-3"
            >
              <Download size={14} className="mr-1" />
              Скачать
            </Button>
          )}
          
          {onReplace && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReplace}
              className="h-8 px-3"
            >
              <Upload size={14} className="mr-1" />
              Заменить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}