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
  const [accessoryFilter, setAccessoryFilter] = useState('all');
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
  
  const [visibleRows, setVisibleRows] = useState(4); // Increased initial load
  const ITEMS_PER_ROW = 2; // 2 items per row
  const ROWS_TO_LOAD = 3; // Load 3 more rows at a time
  
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
      setVisibleRows(6); // Show more items for favorites
    } else if (activeCollection === 'all') {
      // Explicitly reset all filters for 'all' collection
      setFilters({ collection: '', color: '', size: '' });
      setAccessoryFilter('all');
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
      setSearchQuery(''); // Also clear search
      setVisibleRows(8); // Show more items for "all" collection (16 products)
    } else if (activeCollection === 'concrete') {
      setFilters({ collection: 'Магия бетона', color: '', size: '' });
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
      setVisibleRows(4); // Standard amount for specific collections
    } else if (activeCollection === 'accessories') {
      setFilters({ collection: '', color: '', size: '' }); // Don't filter - let filteredProducts handle it
      setAccessoryFilter('all');
      setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
      setVisibleRows(4);
    } else {
      // For other collections (fabric, matte, marble)
      const collectionMap = {
        'fabric': 'Тканевая Роскошь',
        'matte': 'Матовая эстетика', 
        'marble': 'Мраморная феерия'
      };
      const collectionName = collectionMap[activeCollection as keyof typeof collectionMap];
      if (collectionName) {
        setFilters({ collection: collectionName, color: '', size: '' });
        setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
        setVisibleRows(4);
      }
    }
  }, [activeCollection]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    


    // Filter by activeCollection first
    if (activeCollection === 'accessories') {
      // Show only accessories (products with "Клей" or any "Профиль" in collection name)
      filtered = filtered.filter(product => 
        product.collection === 'Клей' || 
        product.collection.toLowerCase().includes('профиль')
      );
    } else if (activeCollection === 'favorites') {
      // For favorites, don't filter by collection here - will be handled by additionalFilters.favorites
    } else if (activeCollection === 'all') {
      // For 'all', don't filter by collection - show all products unless other filters are applied
    } else {
      // Filter by specific collection based on activeCollection
      const collectionMap = {
        'concrete': 'Магия бетона',
        'fabric': 'Тканевая Роскошь',
        'matte': 'Матовая эстетика', 
        'marble': 'Мраморная феерия'
      };
      const collectionName = collectionMap[activeCollection as keyof typeof collectionMap];
      if (collectionName) {
        filtered = filtered.filter(product => product.collection === collectionName);
      }
    }

    // Apply collection filters only when explicitly set and not in 'all' mode with empty filter
    // Also consider accessoryFilter for accessories section
    if (activeCollection === 'accessories' || (activeCollection === 'all' && (accessoryFilter === 'Профили' || accessoryFilter === 'Клей'))) {
      // For accessories, use accessoryFilter instead of filters.collection
      if (accessoryFilter === 'Клей') {
        // Show only adhesive accessories by collection name
        filtered = filtered.filter(product => 
          product.collection === 'Клей'
        );
      } else if (accessoryFilter === 'Профили') {
        // Show only profile accessories by collection name containing "профиль"
        filtered = filtered.filter(product => 
          product.collection.toLowerCase().includes('профиль')
        );
      }
      // If accessoryFilter is 'all' or empty, don't apply additional filtering - show all accessories
    } else if (filters.collection && filters.collection.trim() !== '' && !(activeCollection === 'all' && filters.collection.trim() === '')) {
      if (filters.collection === 'Клей') {
        // Show only adhesive accessories by collection name
        filtered = filtered.filter(product => 
          product.collection === 'Клей'
        );
      } else if (filters.collection === 'Профили') {
        // Show only profile accessories by collection name containing "профиль"
        filtered = filtered.filter(product => 
          product.collection.toLowerCase().includes('профиль')
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
  }, [products, activeCollection, filters, additionalFilters, sortBy, searchQuery, accessoryFilter]);

  // Get visible products based on pagination
  const visibleProducts = useMemo(() => {
    // Mobile: show 5 items (2.5 rows), Desktop: show as calculated
    const isMobile = window.innerWidth < 768;
    const totalItemsToShow = isMobile ? 5 : visibleRows * ITEMS_PER_ROW;
    const visible = filteredProducts.slice(0, totalItemsToShow);
    
    return visible;
  }, [filteredProducts, visibleRows, activeCollection]);

  const hasMoreItems = visibleProducts.length < filteredProducts.length;

  // Get colors and sizes for selected collection
  const selectedCollectionProducts = useMemo(() => {
    if (!filters.collection) return products;
    
    if (filters.collection === 'Профили') {
      // Show only profile accessories by collection name containing "профиль"
      return products.filter(product => 
        product.collection.toLowerCase().includes('профиль')
      );
    } else if (filters.collection === 'Клей') {
      // Show only adhesive accessories by collection name
      return products.filter(product => 
        product.collection === 'Клей'
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
    return Array.from(new Set(selectedCollectionProducts.map(p => p.color || p.design).filter(color => color && color !== '')));
  }, [selectedCollectionProducts]);

  const availableSizes = useMemo(() => {
    return Array.from(new Set(selectedCollectionProducts.map(p => p.format).filter(format => format && format !== '')));
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
              {/* Panel Collections Filter - show when not in pure accessories mode AND when specific accessories are not selected */}
              {(activeCollection !== 'accessories') && !(accessoryFilter === 'Профили' || accessoryFilter === 'Клей' || accessoryFilter === 'all') && (
                <>
                  {/* Panel Collections Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#2f378b] mb-3">Коллекции панелей</h4>
                    <div className="space-y-2">
                      {[
                        { key: '', label: 'Все коллекции' },
                        { key: 'Магия бетона', label: 'Магия бетона' },
                        { key: 'Тканевая Роскошь', label: 'Тканевая роскошь' },
                        { key: 'Матовая эстетика', label: 'Матовая эстетика' },
                        { key: 'Мраморная феерия', label: 'Мраморная феерия' }
                      ].map(collection => (
                        <label key={collection.key} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="panel-collection"
                            value={collection.key}
                            checked={filters.collection === collection.key}
                            onChange={(e) => {
                              setFilters(prev => ({ 
                                ...prev, 
                                collection: e.target.value,
                                color: '', // Reset color when collection changes
                                size: '' // Reset size when collection changes
                              }));
                              // Clear accessory filter when selecting panels
                              setAccessoryFilter('');
                            }}
                            className="mr-2"
                          />
                          <span className="text-secondary text-sm">{collection.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Accessories Filter - Show when accessories or all is selected AND no panels are selected */}
              {(activeCollection === 'accessories' || activeCollection === 'all') && (
                <div className="mb-6">
                  <h4 className="font-semibold text-[#2f378b] mb-3">Комплектующие</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="accessories"
                        value="all"
                        checked={accessoryFilter === '' || accessoryFilter === 'all'}
                        onChange={(e) => {
                          console.log('Все комплектующие clicked');
                          setAccessoryFilter('all');
                          setFilters(prev => ({ 
                            ...prev, 
                            collection: '', // Clear panel collection filter
                            color: '', 
                            size: '' 
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Все комплектующие</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="accessories"
                        value="Профили"
                        checked={accessoryFilter === 'Профили'}
                        onChange={(e) => {
                          console.log('Профили clicked');
                          setAccessoryFilter('Профили');
                          setFilters(prev => ({ 
                            ...prev, 
                            collection: '', // Clear panel collection filter, let accessoryFilter handle it
                            color: '',
                            size: ''
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Профили</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="accessories"
                        value="Клей"
                        checked={accessoryFilter === 'Клей'}
                        onChange={(e) => {
                          console.log('Клей clicked');
                          setAccessoryFilter('Клей');
                          setFilters(prev => ({ 
                            ...prev, 
                            collection: '', // Clear panel collection filter, let accessoryFilter handle it
                            color: '',
                            size: ''
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-secondary text-sm">Клей</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Colors Filter - Show for panel collections and profiles */}
              {filters.collection && 
               filters.collection !== 'Клей' && 
               activeCollection !== 'favorites' && 
               (activeCollection !== 'accessories' || filters.collection === 'Профили') && (
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
                    {(filters.collection === 'Профили' || filters.collection === 'Клей' || activeCollection === 'accessories') ? 'Характеристики' : 'Размеры панелей'}
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
                        {(filters.collection === 'Профили' || filters.collection === 'Клей' || activeCollection === 'accessories') ? 'Все характеристики' : 'Все размеры'}
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
                (activeCollection !== 'accessories' && filters.collection === 'Магия бетона') ||
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



            {/* Products Content - show when we have products regardless of loading state */}
            {!error && products.length > 0 && (
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
            {!isLoading && !error && products.length > 0 && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">
                  По выбранным фильтрам товары не найдены. Попробуйте изменить критерии поиска.
                </p>
                <button 
                  onClick={() => {
                    setFilters({ collection: '', color: '', size: '' });
                    setAdditionalFilters({ favorites: false, novelties: false, discount: false, inStock: false });
                    setSearchQuery('');
                  }}
                  className="mt-4 btn-primary px-6 py-2 rounded-lg font-medium"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            {/* Show message when no products loaded at all */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">
                  Каталог продуктов пока не загружен. Попробуйте обновить страницу.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
