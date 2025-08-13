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
    series: '',
    color: '',
    surface: '',
    size: '',
    thickness: '',
    priceSort: '',
  });
  const [showNovelties, setShowNovelties] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by collection
    if (activeCollection !== 'all' && activeCollection !== 'favorites') {
      filtered = filtered.filter(product => product.category === activeCollection);
    }

    // Apply filters
    if (filters.series) {
      filtered = filtered.filter(product => product.collection === filters.series);
    }
    if (filters.color) {
      filtered = filtered.filter(product => 
        product.color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }
    if (filters.surface) {
      filtered = filtered.filter(product => product.surface === filters.surface);
    }
    if (filters.size) {
      filtered = filtered.filter(product => product.format === filters.size);
    }

    // Show only novelties if checked
    if (showNovelties) {
      // For demo purposes, consider premium items as novelties
      filtered = filtered.filter(product => product.isPremium);
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
  }, [activeCollection, filters, showNovelties, sortBy]);

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

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <select
                value={filters.series}
                onChange={(e) => setFilters(prev => ({ ...prev, series: e.target.value }))}
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option value="">Серия</option>
                {uniqueCollections.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.color}
                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option value="">Цвет</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.surface}
                onChange={(e) => setFilters(prev => ({ ...prev, surface: e.target.value }))}
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option value="">Поверхность</option>
                {uniqueSurfaces.map(surface => (
                  <option key={surface} value={surface}>{surface}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.size}
                onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option value="">Размеры</option>
                {uniqueSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option>Толщина</option>
                <option>2.4мм</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-dropdown border border-muted rounded-lg px-4 py-2 bg-white w-full appearance-none pr-8"
              >
                <option value="default">Цена</option>
                <option value="price-asc">По возрастанию</option>
                <option value="price-desc">По убыванию</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="novelties"
              checked={showNovelties}
              onChange={(e) => setShowNovelties(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="novelties" className="text-secondary cursor-pointer">
              НОВИНКИ
            </label>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
    </section>
  );
}
