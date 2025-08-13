import { Product } from '@/types';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-muted cursor-pointer">
      <div className="relative">
        <div className="w-full" style={{ aspectRatio: '2/1' }}>
          <img 
            src={product.image} 
            alt={`${product.design} - ${product.collection}`}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 left-3 w-7 h-7 rounded-full border border-white flex items-center justify-center transition-all ${
            isFavorite ? 'bg-white text-accent' : 'hover:bg-white hover:text-accent'
          }`}
          aria-label="Добавить в избранное"
        >
          <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
        </button>
        {product.isPremium && (
          <span className="absolute top-3 right-3 bg-accent text-white px-2 py-1 text-xs rounded-full">
            ПРЕМИУМ
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-muted text-xs mb-1">{product.collection}</div>
        <h3 className="text-lg font-bold text-primary mb-2">{product.design}</h3>
        <div className="text-xs text-muted mb-1">
          ЦЕНА {product.isPremium && <Star size={10} className="inline fill-current text-accent" />} {product.price} руб. за м²
        </div>
        <div className="text-xs text-muted mb-3">
          {product.format} • {product.areaPerPiece}м²/шт
        </div>
        <div className="flex gap-2">
          <button className="bg-accent hover:bg-opacity-90 text-white px-3 py-2 rounded text-xs flex-1 transition-colors">
            Узнать цену
          </button>
          <button className="border border-muted text-muted hover:border-accent hover:text-accent px-3 py-2 rounded text-xs flex-1 transition-colors">
            Образец
          </button>
        </div>
      </div>
    </div>
  );
}
