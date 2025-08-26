import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Collection, Product } from '@/types';
import ProductCard from './ProductCard';
import { ChevronDown, Search, Filter, X } from 'lucide-react';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { useStickyNav } from '@/hooks/useStickyNav';

interface CatalogProps {
  activeCollection: Collection;
}

export default function Catalog({ activeCollection }: CatalogProps) {
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext();
  const isNavSticky = useStickyNav();
  
  // Load products from API database
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/catalog-products'],
    staleTime: 30000, // Cache for 30 seconds
  });
  
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
  const [sortBy, setSortBy] = useState('default');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [visibleRows, setVisibleRows] = useState(3); // Reduced from 5 to 3 rows for mobile (6 items -> 5 items on mobile)
  const ITEMS_PER_ROW = 2; // 2 items per row
  const ROWS_TO_LOAD = 5; // Load 5 more rows at a time
  
  // Listen for search events from header
  useEffect(() => {
    const handleSearch = (event: any) => {
      setSearchQuery(event.detail);
      setShowSearch(true);
      // Scroll to catalog section
      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleShowSearch = () => {
      // Focus on search input and ensure catalog is visible
      setTimeout(() => {
        const searchInput = document.querySelector('#catalog-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          // Optional: scroll the search input into view if needed
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 400); // Increased timeout to ensure scrolling is complete
    };

    window.addEventListener('search-products', handleSearch);
    window.addEventListener('show-catalog-search', handleShowSearch);
    
    return () => {
      window.removeEventListener('search-products', handleSearch);
      window.removeEventListener('show-catalog-search', handleShowSearch);
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
    // Mobile: show 5 items (2.5 rows), Desktop: show as calculated
    const isMobile = window.innerWidth < 768;
    const totalItemsToShow = isMobile ? 5 : visibleRows * ITEMS_PER_ROW;
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
    setVisibleRows(3); // 3 rows × 2 items = 6 items for desktop
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
    <section id="catalog" className="py-8 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 mt-3 lg:mt-[24px] mb-3 lg:mb-[24px]">


        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-[#2f378b]">{getCollectionTitle()}</h2>
            
            {/* Search Bar - Always visible */}
            <div className="flex items-center gap-2 w-full lg:flex-1 lg:max-w-lg">
              <div className="relative flex-1">
                <input
                  id="catalog-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {/* Show Clear button only when there's text to clear */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>
          <p className="text-secondary text-sm lg:text-lg">
            {searchQuery 
              ? `Результаты поиска по запросу "${searchQuery}" - найдено ${filteredProducts.length} товаров`
              : "В данном разделе вы можете подобрать необходимые вам цвета, изменив параметры поиска."
            }
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full justify-between"
            data-testid="button-toggle-mobile-filters"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Фильтры</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Filters */}
          <div className={`w-full lg:w-80 lg:flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm lg:sticky lg:top-32 relative pt-[20px] pb-[20px] pl-[20px] pr-[20px] ml-[50px] mr-[50px] mt-[50px] mb-[50px] text-left">
              
              {/* Mobile Close Button */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2f378b]">Фильтры</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-close-mobile-filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="hidden lg:block text-lg font-bold text-[#2f378b] mb-4">Фильтры</h3>
              
              {/* Show different filters based on active collection */}
              {activeCollection !== 'accessories' && (
                <>
                  {/* Panel Collections Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#2f378b] mb-3">Коллекции панелей</h4>
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
                  <h4 className="font-semibold text-[#2f378b] mb-3">Комплектующие</h4>
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
                  <h4 className="font-semibold text-[#2f378b] mb-3">Цвета</h4>
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
                  <h4 className="font-semibold text-[#2f378b] mb-3">
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
                    {availableSizes
                      .sort((a, b) => {
                        // Extract numbers for sorting
                        const getNumber = (str: string) => {
                          const match = str.match(/\d+/);
                          return match ? parseInt(match[0]) : 0;
                        };
                        return getNumber(a) - getNumber(b);
                      })
                      .map(size => (
                      <label key={size} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="size"
                          value={size}
                          checked={filters.size === size}
                          onChange={(e) => {
                            setFilters(prev => ({ ...prev, size: e.target.value }));
                            // Close mobile filters after selection on mobile
                            if (window.innerWidth < 1024) {
                              setTimeout(() => setShowMobileFilters(false), 300);
                            }
                          }}
                          className="mr-2 accent-[#e90039]"
                        />
                        <span className="text-secondary text-sm group-hover:text-[#2f378b] transition-colors">{size}</span>
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
                  <h4 className="font-semibold text-[#2f378b] mb-3">Дополнительно</h4>
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
                <h4 className="font-semibold text-[#2f378b] mb-3">Сортировка</h4>
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
          <div className="flex-1 w-full lg:w-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e90039] mx-auto mb-4"></div>
                  <p className="text-muted">Загружаем каталог...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">Ошибка загрузки каталога</p>
                <p className="text-muted mt-2">Пожалуйста, обновите страницу</p>
              </div>
            )}

            {/* Products Content */}
            {!isLoading && !error && (
              <>
                {/* Results Info */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted">Показано {visibleProducts.length} из {filteredProducts.length} товаров</span>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-12">
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
              </>
            )}

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
