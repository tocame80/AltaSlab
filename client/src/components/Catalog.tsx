import { useState, useMemo } from 'react';
import { products } from '@/data/products';
import { Collection } from '@/types';
import ProductCard from './ProductCard';
import { ChevronDown } from 'lucide-react';

interface CatalogProps {
  activeCollection: Collection;
}

export default function Catalog({ activeCollection }: CatalogProps) {
  const [filters, setFilters] = useState({
    collection: '',
    color: '',
    size: '',
  });
  const [additionalFilters, setAdditionalFilters] = useState({
    novelties: false,
    favorites: false,
    discount: false,
    inStock: false,
  });
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by collection
    if (activeCollection !== 'all' && activeCollection !== 'favorites') {
      filtered = filtered.filter(product => product.category === activeCollection);
    }

    // Apply filters
    if (filters.collection) {
      filtered = filtered.filter(product => product.collection === filters.collection);
    }
    if (filters.color) {
      filtered = filtered.filter(product => 
        product.color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }
    if (filters.size) {
      filtered = filtered.filter(product => product.format === filters.size);
    }

    // Apply additional filters
    if (additionalFilters.novelties) {
      filtered = filtered.filter(product => product.isPremium);
    }
    if (additionalFilters.favorites) {
      // For demo purposes, show all products when favorites is selected
      // In a real app, this would filter by user's favorites
    }
    if (additionalFilters.discount) {
      // For demo purposes, show premium items as discounted
      filtered = filtered.filter(product => product.isPremium);
    }
    if (additionalFilters.inStock) {
      // For demo purposes, all products are in stock
      // In a real app, this would filter by stock status
    }

    // Sort products
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.design.localeCompare(b.design));
    }

    return filtered;
  }, [activeCollection, filters, additionalFilters, sortBy]);

  const getCollectionTitle = () => {
    switch (activeCollection) {
      case 'concrete': return 'МАГИЯ БЕТОНА';
      case 'fabric': return 'ТКАНЕВАЯ РОСКОШЬ';
      case 'matte': return 'МАТОВАЯ ЭСТЕТИКА';
      case 'marble': return 'МРАМОРНАЯ ФЕЕРИЯ';
      case 'favorites': return 'ИЗБРАННОЕ';
      default: return 'ВСЁ';
    }
  };

  const uniqueCollections = Array.from(new Set(products.map(p => p.collection)));
  const uniqueColors = Array.from(new Set(products.map(p => p.color)));
  const uniqueSurfaces = Array.from(new Set(products.map(p => p.surface)));
  const uniqueSizes = Array.from(new Set(products.map(p => p.format)));

  return (
    <section id="catalog" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-primary mb-4">{getCollectionTitle()}</h2>
          <p className="text-secondary text-lg">
            В данном разделе вы можете подобрать необходимые вам цвета, изменив параметры поиска.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-primary mb-4">Фильтры</h3>
              
              {/* Collections Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-primary mb-3">Коллекции</h4>
                <div className="space-y-2">
                  {[
                    { key: '', label: 'Все коллекции' },
                    { key: 'МАГИЯ БЕТОНА', label: 'Магия бетона' },
                    { key: 'ТКАНЕВАЯ РОСКОШЬ', label: 'Тканевая роскошь' },
                    { key: 'МАТОВАЯ ЭСТЕТИКА', label: 'Матовая эстетика' },
                    { key: 'МРАМОРНАЯ ФЕЕРИЯ', label: 'Мраморная феерия' }
                  ].map(collection => (
                    <label key={collection.key} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value={collection.key}
                        checked={filters.collection === collection.key}
                        onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">{collection.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-primary mb-3">Цвета</h4>
                <div className="relative">
                  <select
                    value={filters.color}
                    onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full border border-muted rounded-lg px-3 py-2 text-sm appearance-none pr-8"
                  >
                    <option value="">Все цвета</option>
                    {uniqueColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-primary mb-3">Размеры</h4>
                <div className="relative">
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full border border-muted rounded-lg px-3 py-2 text-sm appearance-none pr-8"
                  >
                    <option value="">Все размеры</option>
                    {uniqueSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Дополнительно</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalFilters.novelties}
                      onChange={(e) => setAdditionalFilters(prev => ({ ...prev, novelties: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">Новинки</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalFilters.favorites}
                      onChange={(e) => setAdditionalFilters(prev => ({ ...prev, favorites: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">Избранное</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalFilters.discount}
                      onChange={(e) => setAdditionalFilters(prev => ({ ...prev, discount: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">Скидка</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalFilters.inStock}
                      onChange={(e) => setAdditionalFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">В наличии</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted">Показано {filteredProducts.length} образцов</span>
              <div className="flex items-center gap-2">
                <span className="text-muted">Сортировать</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-accent border-none bg-transparent cursor-pointer"
                >
                  <option value="default">По умолчанию</option>
                  <option value="price-asc">По цене (возр.)</option>
                  <option value="price-desc">По цене (убыв.)</option>
                  <option value="name">По названию</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {filteredProducts.length > 0 && (
              <div className="text-center">
                <button className="btn-primary px-8 py-3 rounded-lg font-medium">
                  Загрузить еще
                </button>
              </div>
            )}

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">
                  По выбранным фильтрам товары не найдены. Попробуйте изменить критерии поиска.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
