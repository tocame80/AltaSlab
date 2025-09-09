import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
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

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  allowedFileTypes = ['image/*'], // Default to images
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>(null);

  // Create Uppy instance only when modal opens
  const handleOpenModal = () => {
    // Destroy old instance if exists
    if (uppy) {
      uppy.destroy();
    }
    
    // Create fresh instance with current props
    const newUppy = new Uppy({
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
        console.log('Uppy complete event:', result);
        const closeModal = () => {
          setShowModal(false);
          // Clean up instance after closing
          setTimeout(() => {
            if (newUppy) {
              newUppy.destroy();
              setUppy(null);
            }
          }, 100);
        };
        onComplete?.(result, closeModal);
      })
      .on("error", (error) => {
        console.error('ObjectUploader error:', error);
      })
      .on("restriction-failed", (file, error) => {
        console.error('Restriction failed:', error);
      })
      .on("upload-error", (file, error, response) => {
        console.error('Upload error:', error, response);
      })
      .on("upload-success", (file, response) => {
        console.log('Upload success:', file, response);
      });
    
    setUppy(newUppy);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Clean up Uppy instance when modal closes
    setTimeout(() => {
      if (uppy) {
        uppy.destroy();
        setUppy(null);
      }
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uppy) {
        uppy.destroy();
      }
    };
  }, [uppy]);

  return (
    <div>
      <Button onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      {uppy && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={handleCloseModal}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}