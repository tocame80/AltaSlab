import { useState } from 'react';
import CollectionsNav from '@/components/CollectionsNav';
import Catalog from '@/components/Catalog';
import { Collection } from '@/types';
import { useFavoritesContext } from '@/contexts/FavoritesContext';

export function ProductCatalogPage() {
  const [activeCollection, setActiveCollection] = useState<Collection>('all');
  const { favoriteCount } = useFavoritesContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Каталог продукции АЛЬТА СЛЭБ
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Широкий ассортимент SPC панелей для стен и потолков. Все товары в наличии 
            с быстрой доставкой по России. Профессиональные решения для дизайна интерьера.
          </p>
        </div>
        
        <CollectionsNav 
          activeCollection={activeCollection} 
          onCollectionChange={setActiveCollection}
          favoriteCount={favoriteCount}
        />
        <Catalog 
          activeCollection={activeCollection} 
          onResetFilters={() => {
            console.log('🔄 ProductCatalogPage: Resetting to "all" collection...');
            setActiveCollection('all');
            console.log('🔄 ProductCatalogPage: Reset complete');
          }}
          onCollectionChange={setActiveCollection}
        />
      </div>
    </div>
  );
}