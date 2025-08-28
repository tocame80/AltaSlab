import { Product } from '@/types';
import { Heart, Download, Calculator, ShoppingCart, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getProductMainImage, getProductGallery } from '@/assets/products/imageMap';
import OptimizedThumbnail from '@/components/OptimizedThumbnail';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export default function ProductCard({ product, isFavorite = false, onToggleFavorite, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleImageNavigation = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const gallery = product.gallery || [product.image];
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  // Use imageMap functions to get correct images for this product
  const getProductImages = () => {
    // Use productCode instead of id for image mapping
    const productCode = (product as any).productCode;
    const productId = productCode?.replace('SPC', '') || product.id?.replace('SPC', '') || product.id;
    
    // For profiles, use color-specific main image
    if (product.collection.toLowerCase().includes('профиль')) {
      const mainImage = getProductMainImage(productId, product.collection, product.color);
      return [mainImage];
    }
    
    // Check if API returned USE_IMAGEMAP signal
    if (product.image?.startsWith('USE_IMAGEMAP:') || product.gallery?.[0]?.startsWith('USE_IMAGEMAP:')) {
      // Always use imageMap functions for local images
      return getProductGallery(productId, product.collection);
    }
    
    // Also use imageMap by default for any product
    return getProductGallery(productId, product.collection);
  };
  
  const gallery = getProductImages();
  const currentImage = gallery[currentImageIndex];


  const getCollectionDisplayName = () => {
    // For profiles, show specific profile type from product name
    if (product.collection.toLowerCase().includes('профиль')) {
      const name = product.name.toLowerCase();
      if (name.includes('под рассеивателем')) return 'Профиль под рассеивателем';
      if (name.includes('соединительный')) return 'Профиль соединительный';
      if (name.includes('торцевой')) return 'Профиль торцевой';
      if (name.includes('угловой')) return 'Профиль угловой';
      return 'Профиль';
    }
    
    if (product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') {
      return product.name.toLowerCase().includes('профиль') ? 'ПРОФИЛИ' : 'КЛЕЙ';
    }
    return product.collection;
  };

  const getProductDisplayName = () => {
    if (product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') {
      if (product.name.toLowerCase().includes('профиль')) {
        const name = product.name;
        if (name.includes('под рассеивателем')) return `Профиль под рассеивателем ${product.color}`;
        if (name.includes('соединительный')) return `Профиль соединительный ${product.color}`;
        if (name.includes('торцевой')) return `Профиль торцевой ${product.color}`;
        if (name.includes('угловой')) return `Профиль угловой ${product.color}`;
        return `Профиль ${product.color}`;
      }
      return 'Клей Альта Стик';
    }
    return product.design;
  };

  const getPanelSize = () => {
    // Only show size badges for panels (not accessories)
    if (product.collection.toLowerCase().includes('профиль') || product.collection === 'Клей') {
      return null;
    }
    
    // Determine size based on format
    if (product.format === '300х600х2,4мм' || product.format === '300×600×2,4мм') {
      return 'M';
    } else if (product.format === '600х1200х2,4мм' || product.format === '600×1200×2,4мм') {
      return 'XL';
    }
    
    return null;
  };

  return (
    <div 
      className="group product-card bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Image Gallery */}
        <div className="relative w-full aspect-[3/2] lg:aspect-[2/1] bg-white">
          <OptimizedThumbnail
            src={currentImage}
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            size={300}
            quality={0.85}
          />
          
          {/* Navigation arrows - только если больше одного изображения */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => handleImageNavigation(e, 'prev')}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white shadow-lg ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                data-testid="button-prev-card-image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => handleImageNavigation(e, 'next')}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white shadow-lg ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                data-testid="button-next-card-image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          
          {/* Image counter - показываем только если больше одного изображения */}
          {gallery.length > 1 && (
            <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {currentImageIndex + 1} / {gallery.length}
            </div>
          )}
          
          {/* Favorite button */}
          <div className="absolute top-2 right-2 lg:top-3 lg:right-3 z-10">
            {isFavorite ? (
              // Always visible when favorited
              <button
                onClick={handleFavoriteClick}
                className="w-7 h-7 lg:w-8 lg:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white shadow-md text-red-500 hover:text-red-600"
                aria-label="Убрать из избранного"
                data-testid="button-remove-favorite"
              >
                <Heart size={12} className="lg:w-[14px] lg:h-[14px] fill-current" />
              </button>
            ) : (
              // Visible on hover for desktop, always visible on mobile
              <button
                onClick={handleFavoriteClick}
                className={`w-7 h-7 lg:w-8 lg:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white shadow-md text-gray-600 hover:text-red-500 ${
                  isHovered ? 'opacity-100' : 'opacity-60 lg:opacity-0'
                }`}
                aria-label="Добавить в избранное"
                data-testid="button-add-favorite"
              >
                <Heart size={12} className="lg:w-[14px] lg:h-[14px]" />
              </button>
            )}
          </div>

          {/* Image Overlay - only for darkening effect on hover when image is loaded */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
          </div>

          {/* Size Badges */}
          <div className="absolute top-2 left-2 lg:top-3 lg:left-3 flex flex-col gap-1 lg:gap-2">
            {getPanelSize() && (
              <span className={`px-3 py-1 text-white text-sm font-bold rounded-full ${
                getPanelSize() === 'M' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}>
                {getPanelSize()}
              </span>
            )}
          </div>

          {/* Product Info Overlay - Bottom Left - Collection and Color */}
          <div className="absolute bottom-0 left-0 p-2 lg:p-3 transition-all duration-300">
            <div>
              {/* Line 1: Collection */}
              <div className="text-gray-600 hover:text-[#e90039] text-[10px] lg:text-xs font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {getCollectionDisplayName()}
              </div>
              
              {/* Line 2: Color */}
              <div className="text-gray-900 hover:text-[#e90039] text-xs lg:text-sm font-semibold mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {product.collection === 'Клей' && product.color === 'Стандарт' ? 'Альта Стик' : product.color}
              </div>
            </div>
          </div>

          {/* Additional Info Overlay - Bottom Right - Size, Area and Price */}
          <div className="absolute bottom-0 right-0 p-2 lg:p-3 transition-all duration-300">
            <div className="text-right">
              {/* Line 1: Size + m² per package for panels, length for profiles */}
              <div className="text-gray-600 hover:text-[#e90039] text-[10px] lg:text-xs font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {(() => {
                  if (product.collection.toLowerCase().includes('профиль')) {
                    return '2,7м';
                  } else if (product.collection === 'Клей') {
                    return '900 гр / 600 мл';
                  } else {
                    // For panels: show format + area per package
                    return product.areaPerPackage ? `${product.format} ${product.areaPerPackage}м²/уп` : product.format;
                  }
                })()}
              </div>
              
              {/* Line 2: Price per package */}
              <div className="text-gray-900 hover:text-[#e90039] text-xs lg:text-sm font-bold drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {(() => {
                  if (product.collection.toLowerCase().includes('профиль')) {
                    // For profiles: show price per piece
                    return `${product.price.toLocaleString('ru-RU')} ₽ за шт.`;
                  } else if (product.collection === 'Клей') {
                    // For glue: show per unit
                    return `${product.price.toLocaleString('ru-RU')} ₽ за шт.`;
                  } else {
                    // For panels: show per package
                    return `${product.price.toLocaleString('ru-RU')} ₽ за упак.`;
                  }
                })()}
              </div>
            </div>
          </div>


        </div>
      </div>


    </div>
  );
}
