import { Product } from '@/types';
import { Heart, Download, Calculator, ShoppingCart, Truck, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

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

  const gallery = product.gallery || [product.image];
  const currentImage = gallery[currentImageIndex];

  // Simulate availability data if not provided
  const availability = product.availability || {
    inStock: Math.random() > 0.3,
    deliveryTime: Math.random() > 0.5 ? '1-3 дня' : '5-7 дней',
    quantity: Math.floor(Math.random() * 50) + 10
  };

  const getCollectionDisplayName = () => {
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
        <div className="relative w-full aspect-[3/2] lg:aspect-[2/1]">
          <img 
            src={product.image} 
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Favorite button */}
          <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
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

          {/* Image Overlay - only for darkening effect on hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
          </div>

          {/* Status Badges */}
          <div className="absolute top-2 left-2 lg:top-3 lg:left-3 flex flex-col gap-1 lg:gap-2">
            {product.isPremium && (
              <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold rounded-full">
                ПРЕМИУМ
              </span>
            )}
            {availability.inStock ? (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle size={10} />
                <span className="hidden sm:inline">В НАЛИЧИИ</span>
                <span className="sm:hidden">В НАЛ.</span>
              </span>
            ) : (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Clock size={10} />
                <span className="hidden sm:inline">ПОД ЗАКАЗ</span>
                <span className="sm:hidden">ЗАК.</span>
              </span>
            )}
          </div>

          {/* Product Info Overlay - Bottom Left - Three Lines */}
          <div className="absolute bottom-0 left-0 p-2 lg:p-3 transition-all duration-300">
            <div>
              {/* Line 1: Collection */}
              <div className="text-gray-600 hover:text-[#E95D22] text-[10px] lg:text-xs font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {getCollectionDisplayName()}
              </div>
              
              {/* Line 2: Color */}
              <div className="text-gray-900 hover:text-[#E95D22] text-xs lg:text-sm font-semibold mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {product.color}
              </div>
              
              {/* Line 3: Price per m² */}
              {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                <div className="text-gray-900 hover:text-[#E95D22] text-xs lg:text-sm font-bold drop-shadow-lg transition-colors duration-300 cursor-pointer">
                  {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽/м²
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Overlay - Bottom Right - Three Lines */}
          <div className="absolute bottom-0 right-0 p-2 lg:p-3 transition-all duration-300">
            <div className="text-right">
              {/* Line 1: Size */}
              <div className="text-gray-600 hover:text-[#E95D22] text-[10px] lg:text-xs font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {product.format}
              </div>
              
              {/* Line 2: Area/Quantity per package */}
              <div className="text-gray-900 hover:text-[#E95D22] text-xs lg:text-sm font-semibold mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' 
                  ? `${product.areaPerPackage} м²` 
                  : `${product.piecesPerPackage} шт`
                }
              </div>
              
              {/* Line 3: Price per package */}
              <div className="text-gray-900 hover:text-[#E95D22] text-xs lg:text-sm font-bold drop-shadow-lg transition-colors duration-300 cursor-pointer">
                {product.price.toLocaleString('ru-RU')} ₽ {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'за шт.' : 'за упак.'}
              </div>
            </div>
          </div>


        </div>
      </div>


    </div>
  );
}
