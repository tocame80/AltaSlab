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
        <img 
          src={product.image} 
          alt={`${product.design} - ${product.collection}`}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-4 left-4 w-8 h-8 rounded-full border border-white flex items-center justify-center transition-all ${
            isFavorite ? 'bg-white text-accent' : 'hover:bg-white hover:text-accent'
          }`}
          aria-label="Добавить в избранное"
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
        {product.isPremium && (
          <span className="absolute top-4 right-4 bg-accent text-white px-3 py-1 text-sm rounded-full">
            ПРЕМИУМ
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="text-muted text-sm mb-2">{product.collection}</div>
        <h3 className="text-2xl font-bold text-primary mb-4">{product.design}</h3>
        <div className="text-sm text-muted mb-2">
          {product.format} • {product.areaPerPiece}м²/шт
        </div>
        <div className="text-sm text-muted mb-4">
          {product.piecesPerPackage}шт/уп • {product.areaPerPackage}м²/уп
        </div>
        <div className={`font-medium ${product.isPremium ? 'text-accent' : 'text-muted'}`}>
          ЦЕНА {product.isPremium && <Star size={12} className="inline fill-current" />} {product.price} руб. за м²
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button className="btn-primary px-4 py-2 rounded text-sm flex-1">
            Узнать цену
          </button>
          <button className="border border-muted text-muted hover:border-secondary hover:text-secondary px-4 py-2 rounded text-sm flex-1 transition-colors">
            Заказать образец
          </button>
        </div>
      </div>
    </div>
  );
}
