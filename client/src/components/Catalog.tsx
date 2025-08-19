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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [visibleRows, setVisibleRows] = useState(5);
  const ITEMS_PER_ROW = 2; // 2 items per row
  const ROWS_TO_LOAD = 5; // Load 5 more rows at a time
  
  // Listen for search events from header
  useEffect(() => {
    const handleSearch = (event: any) => {
      setSearchQuery(event.detail);
      // Scroll to catalog section
      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('search-products', handleSearch);
    
    return () => {
      window.removeEventListener('search-products', handleSearch);
    };
  }, []);

  // Update filters when activeCollection changes
  useEffect(() => {
    if (activeCollection === 'favorites') {
      // For favorites, show all collections like "all" but with favorites filter enabled
      setFilters({ collection: '', color: '', size: '' });
      setAdditionalFilters(prev => ({ 
        ...prev, 
        favorites: true,
        novelties: false,
        discount: false,
        inStock: false
      }));
    } else if (activeCollection === 'all') {
      setFilters({ collection: '', color: '', size: '' });
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
    } else if (activeCollection === 'concrete') {
      setFilters({ collection: 'МАГИЯ БЕТОНА', color: '', size: '' });
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
    } else if (activeCollection === 'accessories') {
      setFilters({ collection: 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ', color: '', size: '' });
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
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
        setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
      }
    }
  }, [activeCollection]);
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by activeCollection first (favorites and all show everything)
    if (activeCollection === 'accessories') {
      // Show only accessories
      filtered = filtered.filter(product => product.category === 'accessories');
    } else if (activeCollection === 'favorites' || activeCollection === 'all') {
      // For favorites and all, don't filter by collection - show all products
      // Additional filtering will be handled later
    } else {
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
    if (additionalFilters.favorites) {
      // Show only favorite products when favorites filter is active
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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.color.toLowerCase().includes(searchLower) ||
          product.design.toLowerCase().includes(searchLower) ||
          product.collection.toLowerCase().includes(searchLower) ||
          product.format.toLowerCase().includes(searchLower)
        );
      });
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
  }, [activeCollection, filters, additionalFilters, sortBy, searchQuery]);

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
    if (searchQuery) {
      return `ПОИСК: "${searchQuery}"`;
    }
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
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-4xl font-bold text-primary">{getCollectionTitle()}</h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Очистить поиск
              </button>
            )}
          </div>
          <p className="text-secondary text-lg">
            {searchQuery 
              ? `Результаты поиска по запросу "${searchQuery}"`
              : "В данном разделе вы можете подобрать необходимые вам цвета, изменив параметры поиска."
            }
          </p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className={`bg-white p-6 rounded-lg shadow-sm ${isNavSticky ? 'sticky top-32' : 'sticky top-6'}`}>
              <h3 className="text-lg font-bold text-primary mb-4">Фильтры</h3>
              
              {/* Show different filters based on active collection */}
              {activeCollection !== 'accessories' && (
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

              {/* Accessories Filter - Show only when accessories, all, or favorites is selected */}
              {(activeCollection === 'accessories' || activeCollection === 'all' || activeCollection === 'favorites') && (
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
               activeCollection !== 'favorites' && 
               (activeCollection !== 'accessories' || filters.collection === 'ПРОФИЛИ') && (
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

              {/* Additional Filters - Show for panel collections, favorites, and "Магия бетона" */}
              {(activeCollection === 'concrete' || 
                activeCollection === 'favorites' ||
                (activeCollection !== 'accessories' && filters.collection === 'МАГИЯ БЕТОНА') ||
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

              {/* Sorting Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-primary mb-3">Сортировка</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="default"
                      checked={sortBy === 'default'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">По умолчанию</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="price-asc"
                      checked={sortBy === 'price-asc'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">По цене (возрастание)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="price-desc"
                      checked={sortBy === 'price-desc'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">По цене (убывание)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value="name"
                      checked={sortBy === 'name'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-secondary text-sm">По названию</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted">Показано {visibleProducts.length} из {filteredProducts.length} товаров</span>
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
                    window.location.href = `/product/${product.id}`;
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
