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
        <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
          <img 
            src={currentImage} 
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Image Overlay Controls */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* Gallery Navigation */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => handleImageNavigation(e, 'prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white"
                  aria-label="Предыдущее изображение"
                >
                  ◀
                </button>
                <button
                  onClick={(e) => handleImageNavigation(e, 'next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white"
                  aria-label="Следующее изображение"
                >
                  ▶
                </button>
              </>
            )}

            {/* Quick Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white"
                aria-label="Увеличить изображение"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white"
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

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 ${
              isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
            aria-label="Добавить в избранное"
          >
            <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
          </button>

          {/* Gallery Dots */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-6">
        {/* Collection & SKU */}
        <div className="flex justify-between items-start mb-3">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            {getCollectionDisplayName()}
          </div>
          <div className="text-gray-400 text-xs font-mono">
            {product.barcode}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {getProductDisplayName()}
        </h3>

        {/* Technical Specifications Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs font-medium mb-1">ФОРМАТ</div>
            <div className="font-semibold text-gray-900">
              {product.format}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs font-medium mb-1">УПАКОВКА</div>
            <div className="font-semibold text-gray-900">
              {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
                `${product.piecesPerPackage} шт` :
                `${product.areaPerPackage}м² (${product.piecesPerPackage}шт)`
              }
            </div>
          </div>
        </div>

        {/* Availability & Delivery */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Доставка: {availability.deliveryTime}</span>
          </div>
          {availability.inStock && availability.quantity && (
            <span className="text-xs text-gray-500">
              Остаток: {availability.quantity}+ шт
            </span>
          )}
        </div>

        {/* Pricing Section */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {product.price.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-sm text-gray-500">
                {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'за шт.' : 'за упак.'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                  <>
                    {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽/м²
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="flex-1 bg-[#E95D22] text-white py-2 px-4 rounded-lg font-semibold transition-all hover:bg-[#d54a1a] flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              В корзину
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg transition-all hover:bg-gray-200 flex items-center justify-center"
              aria-label="Калькулятор материалов"
            >
              <Calculator size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg transition-all hover:bg-gray-200 flex items-center justify-center"
              aria-label="Скачать документы"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
