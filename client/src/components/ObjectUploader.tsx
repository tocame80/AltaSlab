import { useState } from "react";
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

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  allowedFileTypes = ['image/*'],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>(null);

  const handleOpenModal = async () => {
    try {
      // Clear previous instance
      if (uppy) {
        uppy.destroy();
        setUppy(null);
      }

      console.log('Creating new Uppy instance...');
      
      // Create completely fresh instance
      const newUppy = new Uppy({
        id: `uppy-${Date.now()}`, // Unique ID each time
        restrictions: {
          maxNumberOfFiles,
          maxFileSize,
          allowedFileTypes: allowedFileTypes.length > 0 ? allowedFileTypes : undefined,
        },
        autoProceed: false,
        debug: true, // Enable debug mode
      });

      // Add AWS S3 plugin separately
      newUppy.use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          console.log('Getting upload parameters for file:', file.name);
          try {
            const params = await onGetUploadParameters();
            console.log('Upload parameters received:', params);
            return params;
          } catch (error) {
            console.error('Failed to get upload parameters:', error);
            throw error;
          }
        },
      });

      // Add event listeners
      newUppy.on("complete", (result) => {
        console.log('Upload complete:', result);
        const closeModal = () => setShowModal(false);
        if (onComplete) {
          onComplete(result, closeModal);
        }
      });

      newUppy.on("error", (error) => {
        console.error('Uppy error:', error);
      });

      newUppy.on("upload-error", (file, error, response) => {
        console.error('Upload error for file:', file?.name, error, response);
      });

      newUppy.on("upload-success", (file, response) => {
        console.log('Upload success for file:', file?.name, response);
      });

      setUppy(newUppy);
      setShowModal(true);
      console.log('Modal opened with new Uppy instance');
      
    } catch (error) {
      console.error('Error creating Uppy instance:', error);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal...');
    setShowModal(false);
    
    // Cleanup with delay
    setTimeout(() => {
      if (uppy) {
        console.log('Destroying Uppy instance...');
        uppy.destroy();
        setUppy(null);
      }
    }, 200);
  };

  return (
    <div>
      <Button onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      {showModal && uppy && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={handleCloseModal}
          proudlyDisplayPoweredByUppy={false}
          closeModalOnClickOutside={false} // Prevent accidental closes
          showProgressDetails={true}
          showLinkToFileUploadResult={false}
        />
      )}
    </div>
  );
}