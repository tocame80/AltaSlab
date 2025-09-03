import { useState, useEffect, useRef } from 'react';
import { useImageCache } from '@/hooks/useImageCache';

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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { getCachedImage, setCachedImage, getCacheKey } = useImageCache();



  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      if (!src) return;

      // Check if this is a placeholder image (imported module)
      const isPlaceholder = src.includes('placeholder.jpg') || src.includes('/assets/products/placeholder.jpg');
      
      if (isPlaceholder) {
        // For placeholder images, use them directly without server processing
        setThumbnailUrl(src);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      const cacheKey = getCacheKey(src, size, quality) + '_server_v1';
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
        // Use server-side thumbnail generation
        const thumbnailUrl = `/api/thumbnail?src=${encodeURIComponent(src)}&size=${size}&quality=${quality}`;
        
        // Test if the thumbnail loads successfully
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setCachedImage(cacheKey, thumbnailUrl, size * size * 0.1); // Server thumbnails are much smaller
            setThumbnailUrl(thumbnailUrl);
            setIsLoading(false);
            onLoad?.();
          }
        };
        img.onerror = () => {
          if (isMounted) {
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        };
        img.src = thumbnailUrl;
        
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
      <div className={`bg-white flex items-center justify-center ${className}`} style={{ backgroundColor: 'white' }}>
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
      <div className={`bg-white flex items-center justify-center ${className}`} style={{ backgroundColor: 'white' }}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-[#e90039]"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white ${className}`} style={{ backgroundColor: 'white' }}>
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