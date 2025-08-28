import { useState, useEffect } from 'react';
import ModernImageGallery from './ModernImageGallery';
import { useImageGallery } from '@/hooks/useImageGallery';
import { Search, SortAsc, SortDesc, Grid, List } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  width?: number;
  height?: number;
}

interface GalleryImageGridProps {
  images: string[];
  className?: string;
  title?: string;
}

export default function GalleryImageGrid({ images, className = '', title }: GalleryImageGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Convert images array to ImageItem format
  const imageItems: ImageItem[] = images.map((url, index) => {
    const fileName = url.split('/').pop() || `image-${index}`;
    return {
      id: `img-${index}-${fileName}`,
      url,
      name: fileName,
      size: undefined, // Size will be detected by ModernImageGallery
      width: undefined, // Will be detected when image loads
      height: undefined // Will be detected when image loads
    };
  });

  const {
    filteredImages,
    searchQuery,
    sortBy,
    setSearchQuery,
    setSortBy,
    resetGallery
  } = useImageGallery(imageItems, {
    enableKeyboardNavigation: true,
    enableInfiniteScroll: false,
    itemsPerPage: 50
  });

  const sortOptions = [
    { value: 'name', label: 'По имени (А-Я)' },
    { value: 'name-desc', label: 'По имени (Я-А)' },
    { value: 'size', label: 'По размеру (↑)' },
    { value: 'size-desc', label: 'По размеру (↓)' },
    { value: 'dimensions', label: 'По разрешению (↑)' },
    { value: 'dimensions-desc', label: 'По разрешению (↓)' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#2f378b]">{title}</h2>
          <div className="text-sm text-gray-600">
            {filteredImages.length} {filteredImages.length === 1 ? 'изображение' : 'изображений'}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск изображений..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
            data-testid="input-gallery-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="button-clear-search"
            >
              ×
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-gallery-sort"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-[#e90039] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Сетка"
              data-testid="button-grid-view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-[#e90039] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="Список"
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reset button */}
          {(searchQuery || sortBy !== 'name') && (
            <button
              onClick={resetGallery}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="button-reset-gallery"
            >
              Сброс
            </button>
          )}
        </div>
      </div>

      {/* Gallery */}
      {filteredImages.length > 0 ? (
        <ModernImageGallery
          images={filteredImages}
          className={viewMode === 'grid' ? '' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
          thumbnailSize={viewMode === 'grid' ? 250 : 150}
          previewSize={2000}
          enableLazyLoading={true}
          cacheLimit={100}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">
            {searchQuery ? 'Изображения не найдены' : 'Нет изображений для отображения'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[#e90039] hover:text-[#c8002f] font-medium"
              data-testid="button-clear-search-empty"
            >
              Очистить поиск
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-2">Навигация по галерее:</div>
            <div className="text-blue-800 text-sm space-y-1">
              <div>• Нажмите на изображение для просмотра в полном размере</div>
              <div>• Используйте стрелки ← → для навигации в режиме просмотра</div>
              <div>• Нажмите ESC или кликните вне изображения для закрытия</div>
              <div>• Кнопка загрузки позволяет скачать оригинал изображения</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}