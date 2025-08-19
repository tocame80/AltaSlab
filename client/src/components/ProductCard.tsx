import { Product } from '@/types';
import { Heart, Download, Eye, Calculator, ShoppingCart, Truck, CheckCircle, Clock, Maximize2 } from 'lucide-react';
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
        <div className="relative w-full aspect-[2/1]">
          <img 
            src={product.image} 
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Image Overlay Controls */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* Quick Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleFavoriteClick}
                className={`w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white ${
                  isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
                }`}
                aria-label="Добавить в избранное"
              >
                <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white text-gray-600 hover:text-blue-500"
                aria-label="Увеличить изображение"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white text-gray-600 hover:text-green-500"
                aria-label="AR просмотр"
              >
                <Eye size={14} />
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isPremium && (
              <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold rounded-full">
                ПРЕМИУМ
              </span>
            )}
            {availability.inStock ? (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle size={10} />
                В НАЛИЧИИ
              </span>
            ) : (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Clock size={10} />
                ПОД ЗАКАЗ
              </span>
            )}
          </div>

          {/* Product Info Overlay - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/70 to-transparent p-4">
            <div>
              {/* Collection */}
              <div className="text-gray-600 text-xs font-medium mb-1">
                {getCollectionDisplayName()}
              </div>
              
              {/* Color */}
              <div className="text-gray-900 text-sm font-semibold mb-1">
                {product.color}
              </div>
              
              {/* Price per m² */}
              {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                <div className="text-gray-900 text-lg font-bold">
                  {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽/м²
                </div>
              )}
            </div>
          </div>


        </div>
      </div>


    </div>
  );
}
