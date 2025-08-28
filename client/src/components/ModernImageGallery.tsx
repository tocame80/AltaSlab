import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Maximize2, Download, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  width?: number;
  height?: number;
}

interface ModernImageGalleryProps {
  images: ImageItem[];
  className?: string;
  thumbnailSize?: number;
  previewSize?: number;
  enableLazyLoading?: boolean;
  cacheLimit?: number;
}

interface ProcessedImage {
  thumbnail: string;
  preview: string;
  original: string;
  metadata: {
    width: number;
    height: number;
    size: number;
  };
}

class ImageCache {
  private cache = new Map<string, ProcessedImage>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, value: ProcessedImage): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): ProcessedImage | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export default function ModernImageGallery({
  images,
  className = '',
  thumbnailSize = 250,
  previewSize = 2000,
  enableLazyLoading = true,
  cacheLimit = 100
}: ModernImageGalleryProps) {
  const [processedImages, setProcessedImages] = useState<Map<string, ProcessedImage>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  
  const cacheRef = useRef(new ImageCache(cacheLimit));
  const observerRef = useRef<IntersectionObserver | null>(null);
  const processingQueueRef = useRef<Set<string>>(new Set());

  // Debounced resize handler
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      // Re-process visible images if screen size changed significantly
      const newVisibleImages = new Set(visibleImages);
      newVisibleImages.forEach(imageId => {
        const cached = cacheRef.current.get(imageId);
        if (cached) {
          setProcessedImages(prev => new Map(prev).set(imageId, cached));
        }
      });
    }, 300);
  }, [visibleImages]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Canvas-based image processing with optimization
  const processImage = useCallback(async (imageItem: ImageItem): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas for thumbnail
          const thumbnailCanvas = document.createElement('canvas');
          const thumbnailCtx = thumbnailCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: false 
          });
          
          if (!thumbnailCtx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Configure canvas for high quality
          thumbnailCtx.imageSmoothingEnabled = true;
          thumbnailCtx.imageSmoothingQuality = 'high';

          // Calculate dimensions maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          let thumbWidth = thumbnailSize;
          let thumbHeight = thumbnailSize;
          
          if (aspectRatio > 1) {
            thumbHeight = thumbnailSize / aspectRatio;
          } else {
            thumbWidth = thumbnailSize * aspectRatio;
          }

          // Progressive downsampling for better quality on large images
          
          if (img.width > thumbnailSize * 4 || img.height > thumbnailSize * 4) {
            // First pass: downsample to intermediate size
            const intermediateCanvas = document.createElement('canvas');
            const intermediateCtx = intermediateCanvas.getContext('2d', { willReadFrequently: true });
            
            if (intermediateCtx) {
              const intermediateSize = Math.max(thumbWidth, thumbHeight) * 2;
              const intermediateAspectWidth = aspectRatio > 1 ? intermediateSize : intermediateSize * aspectRatio;
              const intermediateAspectHeight = aspectRatio > 1 ? intermediateSize / aspectRatio : intermediateSize;
              
              intermediateCanvas.width = intermediateAspectWidth;
              intermediateCanvas.height = intermediateAspectHeight;
              intermediateCtx.imageSmoothingEnabled = true;
              intermediateCtx.imageSmoothingQuality = 'high';
              
              intermediateCtx.drawImage(img, 0, 0, intermediateAspectWidth, intermediateAspectHeight);
              
              // Second pass: final downsample
              thumbnailCanvas.width = thumbWidth;
              thumbnailCanvas.height = thumbHeight;
              thumbnailCtx.drawImage(intermediateCanvas, 0, 0, thumbWidth, thumbHeight);
            } else {
              // Fallback: direct downsample
              thumbnailCanvas.width = thumbWidth;
              thumbnailCanvas.height = thumbHeight;
              thumbnailCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
            }
          } else {
            // Direct downsample for smaller images
            thumbnailCanvas.width = thumbWidth;
            thumbnailCanvas.height = thumbHeight;
            thumbnailCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
          }

          // Create preview canvas
          const previewCanvas = document.createElement('canvas');
          const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
          
          if (!previewCtx) {
            reject(new Error('Failed to get preview canvas context'));
            return;
          }

          previewCtx.imageSmoothingEnabled = true;
          previewCtx.imageSmoothingQuality = 'high';

          // Calculate preview dimensions
          const maxDimension = Math.min(previewSize, Math.max(img.width, img.height));
          let previewWidth = img.width;
          let previewHeight = img.height;
          
          if (img.width > maxDimension || img.height > maxDimension) {
            if (img.width > img.height) {
              previewWidth = maxDimension;
              previewHeight = (img.height * maxDimension) / img.width;
            } else {
              previewHeight = maxDimension;
              previewWidth = (img.width * maxDimension) / img.height;
            }
          }

          previewCanvas.width = previewWidth;
          previewCanvas.height = previewHeight;
          previewCtx.drawImage(img, 0, 0, previewWidth, previewHeight);

          const processed: ProcessedImage = {
            thumbnail: thumbnailCanvas.toDataURL('image/jpeg', 0.9),
            preview: previewCanvas.toDataURL('image/jpeg', 0.95),
            original: imageItem.url,
            metadata: {
              width: img.width,
              height: img.height,
              size: imageItem.size ? parseInt(imageItem.size) : 0
            }
          };

          resolve(processed);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageItem.url;
    });
  }, [thumbnailSize, previewSize]);

  // Batch processing with RequestAnimationFrame
  const processBatch = useCallback(async (imageIds: string[]) => {
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < imageIds.length; i += batchSize) {
      batches.push(imageIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const promises = batch.map(async (imageId) => {
        if (processingQueueRef.current.has(imageId)) return;
        
        processingQueueRef.current.add(imageId);
        setLoadingImages(prev => new Set(prev).add(imageId));

        try {
          const imageItem = images.find(img => img.id === imageId);
          if (!imageItem) return;

          // Check cache first
          if (cacheRef.current.has(imageId)) {
            const cached = cacheRef.current.get(imageId)!;
            setProcessedImages(prev => new Map(prev).set(imageId, cached));
            return;
          }

          const processed = await processImage(imageItem);
          cacheRef.current.set(imageId, processed);
          
          setProcessedImages(prev => new Map(prev).set(imageId, processed));
        } catch (error) {
          console.error(`Failed to process image ${imageId}:`, error);
        } finally {
          processingQueueRef.current.delete(imageId);
          setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(imageId);
            return newSet;
          });
        }
      });

      await Promise.all(promises);
    }
  }, [images, processImage]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading) {
      // Process all images immediately if lazy loading is disabled
      const allImageIds = images.map(img => img.id);
      setVisibleImages(new Set(allImageIds));
      processBatch(allImageIds);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleImages = new Set(visibleImages);
        const imagesToProcess: string[] = [];
        
        entries.forEach((entry) => {
          const imageId = entry.target.getAttribute('data-image-id');
          if (imageId && entry.isIntersecting) {
            newVisibleImages.add(imageId);
            if (!processedImages.has(imageId) && !loadingImages.has(imageId)) {
              imagesToProcess.push(imageId);
            }
          }
        });

        if (imagesToProcess.length > 0) {
          setVisibleImages(newVisibleImages);
          processBatch(imagesToProcess);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableLazyLoading, images, visibleImages, processedImages, loadingImages, processBatch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigatePreview('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigatePreview('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = images.findIndex(img => img.id === selectedImage?.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= images.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1;
    }
    
    setSelectedImage(images[newIndex]);
    setPreviewIndex(newIndex);
  }, [images, selectedImage]);

  const handleImageClick = useCallback((imageItem: ImageItem) => {
    setSelectedImage(imageItem);
    setPreviewIndex(images.findIndex(img => img.id === imageItem.id));
  }, [images]);

  const handleDownload = useCallback((imageItem: ImageItem) => {
    const link = document.createElement('a');
    link.href = imageItem.url;
    link.download = imageItem.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Ref callback for intersection observer
  const imageRef = useCallback((node: HTMLDivElement | null, imageId: string) => {
    if (node && observerRef.current && enableLazyLoading) {
      node.setAttribute('data-image-id', imageId);
      observerRef.current.observe(node);
    }
  }, [enableLazyLoading]);

  const memoizedGalleryGrid = useMemo(() => (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {images.map((imageItem) => {
        const processed = processedImages.get(imageItem.id);
        const isLoading = loadingImages.has(imageItem.id);

        return (
          <div
            key={imageItem.id}
            ref={(node) => imageRef(node, imageItem.id)}
            className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                <Loader className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            )}

            {/* Image */}
            {processed && (
              <img
                src={processed.thumbnail}
                alt={imageItem.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleImageClick(imageItem)}
                loading="lazy"
              />
            )}

            {/* Controls overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(imageItem);
                  }}
                  className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                  aria-label={`Просмотреть ${imageItem.name}`}
                  data-testid={`button-view-${imageItem.id}`}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(imageItem);
                  }}
                  className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                  aria-label={`Скачать ${imageItem.name}`}
                  data-testid={`button-download-${imageItem.id}`}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="font-medium truncate">{imageItem.name}</p>
              {processed && (
                <p className="text-gray-300">
                  {processed.metadata.width}×{processed.metadata.height}
                  {processed.metadata.size > 0 && (
                    <span className="ml-2">{formatFileSize(processed.metadata.size)}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ), [images, processedImages, loadingImages, className, imageRef, handleImageClick, handleDownload, formatFileSize]);

  return (
    <>
      {memoizedGalleryGrid}

      {/* Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedImage(null);
            }
          }}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              aria-label="Закрыть превью"
              data-testid="button-close-preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Предыдущее изображение"
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => navigatePreview('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Следующее изображение"
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Preview image */}
            <div className="max-w-full max-h-full flex items-center justify-center">
              {(() => {
                const processed = processedImages.get(selectedImage.id);
                return processed ? (
                  <img
                    src={processed.preview}
                    alt={selectedImage.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      maxWidth: 'calc(100vw - 8rem)',
                      maxHeight: 'calc(100vh - 8rem)'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="w-8 h-8 animate-spin text-white" />
                  </div>
                );
              })()}
            </div>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedImage.name}</h3>
                  {(() => {
                    const processed = processedImages.get(selectedImage.id);
                    return processed && (
                      <p className="text-gray-300 text-sm">
                        {processed.metadata.width}×{processed.metadata.height} пикселей
                        {processed.metadata.size > 0 && (
                          <span className="ml-2">• {formatFileSize(processed.metadata.size)}</span>
                        )}
                      </p>
                    );
                  })()}
                </div>
                
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  data-testid="button-download-original"
                >
                  <Download className="w-4 h-4" />
                  Скачать оригинал
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}