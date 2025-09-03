import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageCache } from '@/hooks/useImageCache';
import { useBatchImageProcessor } from '@/hooks/useBatchImageProcessor';
import { getCachedImageSize } from '@/assets/products/imageMap';

interface OptimizedThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  quality?: number;
  onError?: () => void;
  onLoad?: () => void;
}

export default function OptimizedThumbnail({
  src,
  alt,
  className = '',
  size = 200,
  quality = 0.85,
  onError,
  onLoad
}: OptimizedThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLargeImage, setIsLargeImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { getCachedImage, setCachedImage, getCacheKey } = useImageCache();
  const { addToQueue } = useBatchImageProcessor({ batchSize: 1, delay: 200 });



  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      if (!src) return;

      // First, check image size to determine optimal processing parameters
      try {
        const sizeInfo = await getCachedImageSize(src);
        if (isMounted) {
          setIsLargeImage(sizeInfo.isLarge);
        }
        
        // Adjust parameters for large images
        const actualSize = sizeInfo.isLarge ? Math.min(size, 60) : size;
        const actualQuality = sizeInfo.isLarge ? 0.5 : quality;
        
        const cacheKey = getCacheKey(src, actualSize, actualQuality) + '_v3';
        const cachedUrl = getCachedImage(cacheKey);

        if (cachedUrl) {
          setThumbnailUrl(cachedUrl);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        setIsLoading(true);
        setHasError(false);

        const thumbnail = await addToQueue(src, actualSize, actualQuality);
        if (isMounted) {
          setCachedImage(cacheKey, thumbnail, actualSize * actualSize * 0.5);
          setThumbnailUrl(thumbnail);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.warn('OptimizedThumbnail failed to generate thumbnail:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadThumbnail();

    return () => {
      isMounted = false;
    };
  }, [src, size, quality, getCacheKey, getCachedImage, setCachedImage, onLoad, onError]);

  if (hasError) {
    return (
      <div className={`bg-white flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400 p-2">
          <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Ошибка</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-[#e90039]"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white relative ${className}`}>
      <img
        ref={imageRef}
        src={thumbnailUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ backgroundColor: 'white' }}
      />
      {isLargeImage && (
        <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 rounded">
          HD
        </div>
      )}
    </div>
  );
}