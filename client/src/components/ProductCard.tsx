import { Product } from '@/types';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
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
      {product.category !== 'glue' && (
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
      )}
      {product.category === 'glue' && (
        <div className="relative">
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white ${
              isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
            aria-label="Добавить в избранное"
          >
            <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
          {product.collection === 'КОМПЛЕКТУЮЩИЕ' ? product.design : product.collection}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {product.collection === 'КОМПЛЕКТУЮЩИЕ' && product.color ? product.color : product.design}
        </h3>
        <div className="text-sm text-gray-600 mb-1">
          <span className="uppercase tracking-wide text-xs">ЦЕНА</span> 
          <span className="ml-1 font-semibold transition-colors group-hover:text-[#E95D22]">
            {product.price} РУБ. ЗА М²
          </span>
        </div>
      </div>
    </div>
  );
}
