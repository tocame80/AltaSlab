import { useState, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>,
    closeModal: () => void
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  allowedFileTypes = ['image/*'],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showUploader, setShowUploader] = useState(false);
  const uppyRef = useRef<Uppy | null>(null);

  const initializeUppy = () => {
    if (uppyRef.current) {
      uppyRef.current.destroy();
    }

    const uppy = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: allowedFileTypes.length > 0 ? allowedFileTypes : undefined,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        console.log('Upload complete:', result);
        const closeModal = () => setShowUploader(false);
        if (onComplete) {
          onComplete(result, closeModal);
        }
      })
      .on("error", (error) => {
        console.error('Upload error:', error);
      });

    uppyRef.current = uppy;
    return uppy;
  };

  const handleToggleUploader = () => {
    if (!showUploader) {
      initializeUppy();
      setShowUploader(true);
    } else {
      setShowUploader(false);
      if (uppyRef.current) {
        uppyRef.current.destroy();
        uppyRef.current = null;
      }
    }
  };

  return (
    <div>
      <Button onClick={handleToggleUploader} className={buttonClassName}>
        {children}
      </Button>

      {showUploader && uppyRef.current && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Загрузка файла</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <Dashboard
              uppy={uppyRef.current}
              proudlyDisplayPoweredByUppy={false}
              height={400}
              width="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
}