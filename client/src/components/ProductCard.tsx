import { Product } from '@/types';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export default function ProductCard({ product, isFavorite = false, onToggleFavorite, onClick }: ProductCardProps) {
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

  return (
    <div 
      className="group product-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="w-full" style={{ aspectRatio: '2/1' }}>
          <img 
            src={product.image} 
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          aria-label="Добавить в избранное"
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>
      <div className="p-4">
        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
          {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
            (product.name.toLowerCase().includes('профиль') ? 'ПРОФИЛИ' : 'КЛЕЙ') : 
            product.collection}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
            (product.name.toLowerCase().includes('профиль') ? 
              (() => {
                const name = product.name;
                if (name.includes('под рассеивателем')) return `Профиль под рассеивателем ${product.color}`;
                if (name.includes('соединительный')) return `Профиль соединительный ${product.color}`;
                if (name.includes('торцевой')) return `Профиль торцевой ${product.color}`;
                if (name.includes('угловой')) return `Профиль угловой ${product.color}`;
                return `Профиль ${product.color}`;
              })() : 
              'Клей Альта Стик'
            ) : 
            product.design}
        </h3>
        <div className="text-sm text-gray-600 mb-2">
          {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
            `${product.format} (${product.piecesPerPackage}шт/уп)` :
            `${product.format} ${product.areaPerPackage}м²/уп (${product.piecesPerPackage}шт/уп)`
          }
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
          <div>
            <span className="uppercase tracking-wide text-xs">ЦЕНА</span> 
            <span className="ml-1 font-semibold transition-colors group-hover:text-[#E95D22]">
              {product.price} РУБ. {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'ЗА ШТ.' : 'ЗА УПАК.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
