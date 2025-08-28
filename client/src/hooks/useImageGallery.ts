import { useState, useCallback, useMemo } from 'react';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  width?: number;
  height?: number;
}

interface UseImageGalleryOptions {
  enableKeyboardNavigation?: boolean;
  enableInfiniteScroll?: boolean;
  itemsPerPage?: number;
}

interface UseImageGalleryReturn {
  images: ImageItem[];
  filteredImages: ImageItem[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  sortBy: string;
  isLoading: boolean;
  selectedImage: ImageItem | null;
  previewIndex: number;
  setImages: (images: ImageItem[]) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  selectImage: (image: ImageItem | null) => void;
  navigatePreview: (direction: 'prev' | 'next') => void;
  addImages: (newImages: ImageItem[]) => void;
  removeImage: (imageId: string) => void;
  loadNextPage: () => void;
  resetGallery: () => void;
}

export function useImageGallery(
  initialImages: ImageItem[] = [],
  options: UseImageGalleryOptions = {}
): UseImageGalleryReturn {
  const {
    enableKeyboardNavigation = true,
    enableInfiniteScroll = false,
    itemsPerPage = 20
  } = options;

  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = images;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(image =>
        image.name.toLowerCase().includes(query) ||
        image.url.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size':
          const sizeA = a.size ? parseInt(a.size) : 0;
          const sizeB = b.size ? parseInt(b.size) : 0;
          return sizeA - sizeB;
        case 'size-desc':
          const sizeA2 = a.size ? parseInt(a.size) : 0;
          const sizeB2 = b.size ? parseInt(b.size) : 0;
          return sizeB2 - sizeA2;
        case 'dimensions':
          const areaA = (a.width || 0) * (a.height || 0);
          const areaB = (b.width || 0) * (b.height || 0);
          return areaA - areaB;
        case 'dimensions-desc':
          const areaA2 = (a.width || 0) * (a.height || 0);
          const areaB2 = (b.width || 0) * (b.height || 0);
          return areaB2 - areaA2;
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchQuery, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = enableInfiniteScroll 
    ? filteredImages.slice(0, (currentPage + 1) * itemsPerPage)
    : filteredImages.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Navigation functions
  const selectImage = useCallback((image: ImageItem | null) => {
    setSelectedImage(image);
    if (image) {
      const index = filteredImages.findIndex(img => img.id === image.id);
      setPreviewIndex(index);
    }
  }, [filteredImages]);

  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!selectedImage || filteredImages.length === 0) return;

    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1 >= filteredImages.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? filteredImages.length - 1 : currentIndex - 1;
    }

    setSelectedImage(filteredImages[newIndex]);
    setPreviewIndex(newIndex);
  }, [selectedImage, filteredImages]);

  // Image management functions
  const addImages = useCallback((newImages: ImageItem[]) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    // If removed image was selected, clear selection
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  const loadNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const resetGallery = useCallback(() => {
    setSearchQuery('');
    setSortBy('name');
    setCurrentPage(0);
    setSelectedImage(null);
    setPreviewIndex(0);
  }, []);

  // Keyboard navigation effect would be handled in the component using this hook

  return {
    images,
    filteredImages: paginatedImages,
    currentPage,
    totalPages,
    searchQuery,
    sortBy,
    isLoading,
    selectedImage,
    previewIndex,
    setImages,
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    selectImage,
    navigatePreview,
    addImages,
    removeImage,
    loadNextPage,
    resetGallery
  };
}