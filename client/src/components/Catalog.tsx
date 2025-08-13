import { useState, useMemo, useEffect } from 'react';
import { products } from '@/data/products';
import { Collection } from '@/types';
import ProductCard from './ProductCard';
import { ChevronDown } from 'lucide-react';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { useStickyNav } from '@/hooks/useStickyNav';

interface CatalogProps {
  activeCollection: Collection;
}

export default function Catalog({ activeCollection }: CatalogProps) {
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext();
  const isNavSticky = useStickyNav();
  
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
  
  const [visibleRows, setVisibleRows] = useState(5);
  const ITEMS_PER_ROW = 2; // 2 items per row
  const ROWS_TO_LOAD = 5; // Load 5 more rows at a time
  
  // Update filters when activeCollection changes
  useEffect(() => {
    if (activeCollection === 'concrete') {
      setFilters({ collection: 'МАГИЯ БЕТОНА', color: '', size: '' });
      setAdditionalFilters(prev => ({ ...prev, favorites: false }));
    } else if (activeCollection === 'accessories') {
      setFilters({ collection: 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ', color: '', size: '' });
      setAdditionalFilters(prev => ({ ...prev, favorites: false }));
    } else if (activeCollection === 'favorites') {
      setFilters({ collection: '', color: '', size: '' });
      setAdditionalFilters(prev => ({ ...prev, favorites: true }));
    } else if (activeCollection === 'all') {
      setFilters({ collection: '', color: '', size: '' });
      setAdditionalFilters(prev => ({ ...prev, favorites: false }));
    } else {
      // For other collections (fabric, matte, marble)
      const collectionMap = {
        'fabric': 'ТКАНЕВАЯ РОСКОШЬ',
        'matte': 'МАТОВАЯ ЭСТЕТИКА', 
        'marble': 'МРАМОРНАЯ ФЕЕРИЯ'
      };
      const collectionName = collectionMap[activeCollection as keyof typeof collectionMap];
      if (collectionName) {
        setFilters({ collection: collectionName, color: '', size: '' });
        setAdditionalFilters(prev => ({ ...prev, favorites: false }));
      }
    }
  }, [activeCollection]);
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by activeCollection first
    if (activeCollection === 'accessories') {
      // Show only accessories
      filtered = filtered.filter(product => product.category === 'accessories');
    } else if (activeCollection === 'favorites') {
      // Show favorites (simulated by showing first few items of each collection)
      const favoriteIds = ['8934', '8883', '8848', '8806', '8978'];
      filtered = filtered.filter(product => favoriteIds.includes(product.id));
    } else if (activeCollection !== 'all') {
      // Filter by specific collection
      filtered = filtered.filter(product => product.category === activeCollection);
    }

    // Apply collection filters
    if (filters.collection) {
      if (filters.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') {
        // Show all accessories
        filtered = filtered.filter(product => product.category === 'accessories');
      } else if (filters.collection === 'ПРОФИЛИ') {
        // Show only profile accessories containing "профиль" in name
        filtered = filtered.filter(product => 
          product.category === 'accessories' && 
          product.name.toLowerCase().includes('профиль')
        );
      } else if (filters.collection === 'КЛЕЙ') {
        // Show only adhesive accessories containing "клей" in name  
        filtered = filtered.filter(product => 
          product.category === 'accessories' && 
          product.name.toLowerCase().includes('клей')
        );
      } else {
        // Filter by exact collection name
        filtered = filtered.filter(product => product.collection === filters.collection);
      }
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
    if (additionalFilters.favorites || activeCollection === 'favorites') {
      // Show only favorite products
      filtered = filtered.filter(product => favorites.has(product.id));
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

  // Get visible products based on pagination
  const visibleProducts = useMemo(() => {
    const totalItemsToShow = visibleRows * ITEMS_PER_ROW;
    return filteredProducts.slice(0, totalItemsToShow);
  }, [filteredProducts, visibleRows]);

  const hasMoreItems = visibleProducts.length < filteredProducts.length;

  // Get colors and sizes for selected collection
  const selectedCollectionProducts = useMemo(() => {
    if (!filters.collection) return products;
    
    if (filters.collection === 'ПРОФИЛИ') {
      // Show only profile accessories containing "профиль" in name
      return products.filter(product => 
        product.category === 'accessories' && 
        product.name.toLowerCase().includes('профиль')
      );
    } else if (filters.collection === 'КЛЕЙ') {
      // Show only adhesive accessories containing "клей" in name  
      return products.filter(product => 
        product.category === 'accessories' && 
        product.name.toLowerCase().includes('клей')
      );
    } else {
      return products.filter(product => product.collection === filters.collection);
    }
  }, [filters.collection]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleRows(5);
  }, [activeCollection, filters, additionalFilters, sortBy]);

  const loadMoreItems = () => {
    setVisibleRows(prev => prev + ROWS_TO_LOAD);
  };

  const availableColors = useMemo(() => {
    return Array.from(new Set(selectedCollectionProducts.map(p => p.color).filter(color => color !== '')));
  }, [selectedCollectionProducts]);

  const availableSizes = useMemo(() => {
    return Array.from(new Set(selectedCollectionProducts.map(p => p.format)));
  }, [selectedCollectionProducts]);

  const getCollectionTitle = () => {
    switch (activeCollection) {
      case 'concrete': return 'МАГИЯ БЕТОНА';
      case 'fabric': return 'ТКАНЕВАЯ РОСКОШЬ';
      case 'matte': return 'МАТОВАЯ ЭСТЕТИКА';
      case 'marble': return 'МРАМОРНАЯ ФЕЕРИЯ';
      case 'accessories': return 'КОМПЛЕКТУЮЩИЕ';
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
            <div className={`bg-white p-6 rounded-lg shadow-sm ${isNavSticky ? 'sticky top-32' : 'sticky top-6'}`}>
              <h3 className="text-lg font-bold text-primary mb-4">Фильтры</h3>
              
              {/* Show different filters based on active collection */}
              {activeCollection !== 'accessories' && activeCollection !== 'favorites' && (
                <>
                  {/* Panel Collections Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-primary mb-3">Коллекции панелей</h4>
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
                            onChange={(e) => setFilters(prev => ({ 
                              ...prev, 
                              collection: e.target.value,
                              color: '', // Reset color when collection changes
                              size: '' // Reset size when collection changes
                            }))}
                            className="mr-2"
                          />
                          <span className="text-secondary text-sm">{collection.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Accessories Filter - Show only when accessories or all is selected */}
              {(activeCollection === 'accessories' || activeCollection === 'all') && (
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-3">Комплектующие</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value="КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ"
                        checked={filters.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          collection: e.target.value,
                          color: '', 
                          size: '' 
                        }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Все комплектующие</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value="ПРОФИЛИ"
                        checked={filters.collection === 'ПРОФИЛИ'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          collection: e.target.value,
                          color: '',
                          size: ''
                        }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Профили</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value="КЛЕЙ"
                        checked={filters.collection === 'КЛЕЙ'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          collection: e.target.value,
                          color: '',
                          size: ''
                        }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Клей</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Colors Filter - Show for panel collections and profiles */}
              {filters.collection && 
               filters.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && 
               filters.collection !== 'КЛЕЙ' && 
               activeCollection !== 'accessories' && 
               activeCollection !== 'favorites' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-3">Цвета</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value=""
                        checked={filters.color === ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Все цвета</span>
                    </label>
                    {availableColors.map(color => (
                      <label key={color} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={color}
                          checked={filters.color === color}
                          onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-secondary text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Size/Characteristics Filter */}
              {((filters.collection && activeCollection !== 'favorites') || activeCollection === 'accessories') && (
                <div className="mb-6">
                  <h4 className="font-semibold text-primary mb-3">
                    {(filters.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' || filters.collection === 'ПРОФИЛИ' || filters.collection === 'КЛЕЙ' || activeCollection === 'accessories') ? 'Характеристики' : 'Размеры панелей'}
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value=""
                        checked={filters.size === ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">
                        {(filters.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' || filters.collection === 'ПРОФИЛИ' || filters.collection === 'КЛЕЙ' || activeCollection === 'accessories') ? 'Все характеристики' : 'Все размеры'}
                      </span>
                    </label>
                    {availableSizes.map(size => (
                      <label key={size} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="size"
                          value={size}
                          checked={filters.size === size}
                          onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-secondary text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Filters - Show for panel collections and "Магия бетона" */}
              {(activeCollection === 'concrete' || 
                (activeCollection !== 'accessories' && activeCollection !== 'favorites' && filters.collection === 'МАГИЯ БЕТОНА') ||
                activeCollection === 'all') && (
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
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted">Показано {visibleProducts.length} из {filteredProducts.length} товаров</span>
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
              {visibleProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onClick={() => {
                    // For now, show an alert. Later can be replaced with navigation to product detail page
                    alert(`Переход к деталям продукта: ${product.design}\nЦена: ${product.price} руб. за м²\nАртикул: ${product.barcode}`);
                  }}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="text-center">
                <button 
                  onClick={loadMoreItems}
                  className="btn-primary px-8 py-3 rounded-lg font-medium"
                >
                  Показать еще
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
