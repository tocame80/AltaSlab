import { useState, useRef, useEffect } from "react";
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
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
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
  const uppyRef = useRef<Uppy | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initialize or reinitialize Uppy when key props change
  useEffect(() => {
    // Clean up previous instance
    if (uppyRef.current) {
      uppyRef.current.destroy();
    }

    // Create new Uppy instance
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
        console.log('Uppy complete event:', result);
        const closeModal = () => setShowModal(false);
        onCompleteRef.current?.(result, closeModal);
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

    uppyRef.current = uppy;

    // Cleanup function
    return () => {
      if (uppyRef.current) {
        uppyRef.current.destroy();
        uppyRef.current = null;
      }
    };
  }, [onGetUploadParameters, maxNumberOfFiles, maxFileSize, allowedFileTypes]);

  const handleOpenModal = () => {
    if (!uppyRef.current) return;
    
    // Clear any previous files before opening modal
    uppyRef.current.getFiles().forEach(file => {
      uppyRef.current?.removeFile(file.id);
    });
    setShowModal(true);
  };

  // Don't render if Uppy is not ready
  if (!uppyRef.current) {
    return (
      <Button disabled className={buttonClassName}>
        {children}
      </Button>
    );
  }

  return (
    <div>
      <Button onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppyRef.current}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}