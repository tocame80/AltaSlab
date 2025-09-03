import { useState, useEffect, useRef, useCallback } from 'react';
import { useImageCache } from '@/hooks/useImageCache';
import { useBatchImageProcessor } from '@/hooks/useBatchImageProcessor';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { getCachedImage, setCachedImage, getCacheKey } = useImageCache();
  const { addToQueue } = useBatchImageProcessor({ batchSize: 1, delay: 200 });



  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      if (!src) return;

      const cacheKey = getCacheKey(src, size, quality) + '_v2'; // Force cache invalidation for white background
      const cachedUrl = getCachedImage(cacheKey);

      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const thumbnail = await addToQueue(src, size, quality);
        if (isMounted) {
          setCachedImage(cacheKey, thumbnail, size * size * 0.5); // Estimate size
          setThumbnailUrl(thumbnail);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.warn('OptimizedThumbnail failed to generate thumbnail:', error);
        // Don't fallback to original image - show error state instead
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
  }, [src, size, quality, addToQueue, getCacheKey, getCachedImage, setCachedImage, onLoad, onError]);

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
    <div className={`bg-white ${className}`}>
      <img
        ref={imageRef}
        src={thumbnailUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ backgroundColor: 'white' }}
      />
    </div>
  );
}