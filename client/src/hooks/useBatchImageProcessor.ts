import { useCallback, useRef } from 'react';

interface BatchProcessorOptions {
  batchSize?: number;
  delay?: number;
}

interface ProcessingTask {
  src: string;
  size: number;
  quality: number;
  resolve: (result: string) => void;
  reject: (error: Error) => void;
}

export function useBatchImageProcessor({ batchSize = 3, delay = 16 }: BatchProcessorOptions = {}) {
  const queueRef = useRef<ProcessingTask[]>([]);
  const processingRef = useRef(false);

  const generateThumbnail = useCallback(async (imageSrc: string, size: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: false 
          });
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const aspectRatio = img.width / img.height;
          let width = size;
          let height = size;
          
          if (aspectRatio > 1) {
            height = size / aspectRatio;
          } else {
            width = size * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          // Progressive downsampling for very large images
          if (img.width > size * 8 || img.height > size * 8) {
            const intermediateCanvas = document.createElement('canvas');
            const intermediateCtx = intermediateCanvas.getContext('2d', { willReadFrequently: true });
            
            if (intermediateCtx) {
              const intermediateSize = Math.max(width, height) * 4;
              const intermediateWidth = aspectRatio > 1 ? intermediateSize : intermediateSize * aspectRatio;
              const intermediateHeight = aspectRatio > 1 ? intermediateSize / aspectRatio : intermediateSize;
              
              intermediateCanvas.width = intermediateWidth;
              intermediateCanvas.height = intermediateHeight;
              intermediateCtx.imageSmoothingEnabled = true;
              intermediateCtx.imageSmoothingQuality = 'high';
              
              intermediateCtx.drawImage(img, 0, 0, intermediateWidth, intermediateHeight);
              ctx.drawImage(intermediateCanvas, 0, 0, width, height);
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(thumbnailDataUrl);
        } catch (error) {
          reject(error as Error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  }, []);

  const processBatch = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    try {
      const batch = queueRef.current.splice(0, batchSize);
      
      // Process batch using RequestAnimationFrame for better performance
      const processTask = async (task: ProcessingTask) => {
        return new Promise<void>((resolveFrame) => {
          requestAnimationFrame(async () => {
            try {
              const result = await generateThumbnail(task.src, task.size, task.quality);
              task.resolve(result);
            } catch (error) {
              task.reject(error as Error);
            } finally {
              resolveFrame();
            }
          });
        });
      };

      // Process tasks sequentially with frame delays
      for (const task of batch) {
        await processTask(task);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
    } finally {
      processingRef.current = false;
      
      // Schedule next batch if queue is not empty
      if (queueRef.current.length > 0) {
        setTimeout(() => processBatch(), delay);
      }
    }
  }, [batchSize, delay, generateThumbnail]);

  const addToQueue = useCallback((src: string, size: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      queueRef.current.push({ src, size, quality, resolve, reject });
      
      // Start processing if not already running
      if (!processingRef.current) {
        processBatch();
      }
    });
  }, [processBatch]);

  const getQueueSize = useCallback(() => queueRef.current.length, []);

  return {
    addToQueue,
    getQueueSize
  };
}