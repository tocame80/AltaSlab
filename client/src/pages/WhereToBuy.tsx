import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Globe, MapPin, Clock, Filter, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DealerLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: string;
  longitude: string;
  dealerType: string;
  services: string[];
  workingHours?: string;
}

declare global {
  interface Window {
    ymaps?: any;
  }
}

export default function WhereToBuy() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [highlightedDealer, setHighlightedDealer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // Use localStorage to persist coordinates between sessions
  const getStoredCoordinates = (): Record<string, [number, number]> => {
    try {
      const stored = localStorage.getItem('yandex-maps-coordinates');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const storeCoordinates = (coords: Record<string, [number, number]>) => {
    try {
      localStorage.setItem('yandex-maps-coordinates', JSON.stringify(coords));
    } catch {
      // Ignore storage errors
    }
  };

  const [storedCoordinates, setStoredCoordinates] = useState<Record<string, [number, number]>>(getStoredCoordinates);
  const placemarksRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  // Fetch dealer locations
  const { data: dealerLocations = [], isLoading } = useQuery<DealerLocation[]>({
    queryKey: ['/api/dealer-locations'],
  });

  // Filter options
  const dealerTypeFilters = [
    { key: '', label: 'Все типы' },
    { key: 'retail', label: 'Розничные' },
    { key: 'wholesale', label: 'Оптовые' },
    { key: 'authorized', label: 'Авторизованные' }
  ];

  const serviceOptions = ['installation', 'delivery', 'consultation'];
  const serviceLabels = {
    installation: 'Монтаж',
    delivery: 'Доставка',
    consultation: 'Консультация'
  };

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(dealerLocations.map(dealer => dealer.region)));
    return [{ key: '', label: 'Все регионы' }, ...uniqueRegions.map(region => ({ key: region, label: region }))];
  }, [dealerLocations]);

  // Filter dealers
  const filteredDealers = useMemo(() => {
    let filtered = dealerLocations;

    if (selectedType) {
      filtered = filtered.filter(dealer => dealer.dealerType === selectedType);
    }

    if (selectedRegion) {
      filtered = filtered.filter(dealer => dealer.region === selectedRegion);
    }

    if (selectedServices.length > 0) {
      filtered = filtered.filter(dealer =>
        selectedServices.some(service => dealer.services.includes(service))
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dealer =>
        dealer.name.toLowerCase().includes(query) ||
        dealer.city.toLowerCase().includes(query) ||
        dealer.address.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [dealerLocations, selectedType, selectedRegion, selectedServices, searchQuery]);

  // Load Yandex Maps
  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.onload = () => {
        window.ymaps?.ready(() => {
          setMapLoaded(true);
        });
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapLoaded && filteredDealers.length > 0 && !mapInstance) {
      const map = new window.ymaps.Map('yandex-map', {
        center: [55.753994, 37.622093], // Moscow coordinates
        zoom: 10,
        controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
      });

      setMapInstance(map);
    }
  }, [mapLoaded, filteredDealers, mapInstance]);

  // Initialize map markers only once and update visibility based on filters
  useEffect(() => {
    if (mapInstance && dealerLocations.length > 0 && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      const initializeAllPlacemarks = async () => {
        console.log(`Инициализируем все точки продаж:`, dealerLocations.length);
        let currentCoords = { ...storedCoordinates };
        let needsUpdate = false;

        for (const dealer of dealerLocations) {
          let coordinates: [number, number] | null = null;

          // Check if we have coordinates from database
          if (dealer.latitude && dealer.longitude && 
              parseFloat(dealer.latitude) !== 0 && parseFloat(dealer.longitude) !== 0) {
            coordinates = [parseFloat(dealer.latitude), parseFloat(dealer.longitude)];
          } else if (dealer.address && dealer.city) {
            // Check cached coordinates first
            const cacheKey = `${dealer.city}_${dealer.address}`;
            
            if (currentCoords[cacheKey]) {
              coordinates = currentCoords[cacheKey];
              console.log(`Используем сохраненные координаты для ${dealer.name}: ${coordinates}`);
            } else {
              // Try to geocode the address
              try {
                const fullAddress = `${dealer.city}, ${dealer.address}`;
                const geocodeResult = await window.ymaps.geocode(fullAddress);
                const firstGeoObject = geocodeResult.geoObjects.get(0);
                if (firstGeoObject) {
                  const newCoordinates: [number, number] = firstGeoObject.geometry.getCoordinates();
                  coordinates = newCoordinates;
                  console.log(`Геокодирование успешно для ${dealer.name}: ${coordinates}`);
                  
                  // Cache the coordinates
                  currentCoords[cacheKey] = newCoordinates;
                  needsUpdate = true;
                }
              } catch (error) {
                console.warn(`Не удалось геокодировать адрес для ${dealer.name}:`, error);
              }
            }
          }

          // Add placemark for dealers with coordinates
          if (coordinates) {
            const placemark = new window.ymaps.Placemark(
              coordinates,
              {
                balloonContentHeader: dealer.name,
                balloonContentBody: `
                  <div>
                    <p><strong>Адрес:</strong> ${dealer.address}</p>
                    <p><strong>Город:</strong> ${dealer.city}</p>
                    ${dealer.phone ? `<p><strong>Телефон:</strong> ${dealer.phone}</p>` : ''}
                    ${dealer.workingHours ? `<p><strong>Часы работы:</strong> ${dealer.workingHours}</p>` : ''}
                  </div>
                `,
                balloonContentFooter: dealer.dealerType
              },
              {
                preset: 'islands#redDotIcon'
              }
            );
            
            placemark.dealerId = dealer.id;
            placemark.dealerData = dealer;
            placemarksRef.current.push(placemark);
            // Don't add to map here - will be added by visibility logic
          }
        }

        // Update stored coordinates if needed
        if (needsUpdate) {
          setStoredCoordinates(currentCoords);
          storeCoordinates(currentCoords);
        }

        console.log(`Инициализировано маркеров: ${placemarksRef.current.length}`);
        
        // Fit map to show all placemarks
        if (placemarksRef.current.length > 0) {
          const group = new window.ymaps.GeoObjectCollection({}, {});
          placemarksRef.current.forEach(placemark => group.add(placemark));
          
          try {
            const bounds = group.getBounds();
            if (bounds && bounds.length > 0) {
              mapInstance.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });
            }
          } catch (error) {
            console.warn('Could not set map bounds:', error);
            mapInstance.setCenter([55.76, 37.64], 5);
          }
        }
      };

      initializeAllPlacemarks();
    }
  }, [mapInstance, dealerLocations, storedCoordinates]);

  // Update placemark visibility based on filters (without recreating them)
  useEffect(() => {
    if (placemarksRef.current.length > 0) {
      const filteredIds = new Set(filteredDealers.map(d => d.id));
      console.log(`Обновляем видимость маркеров. Отфильтровано дилеров: ${filteredDealers.length}, всего маркеров: ${placemarksRef.current.length}`);
      
      // Clear all placemarks from map first
      mapInstance.geoObjects.removeAll();
      
      // Add only visible placemarks
      let visibleCount = 0;
      placemarksRef.current.forEach(placemark => {
        const isVisible = filteredIds.has(placemark.dealerId);
        if (isVisible) {
          try {
            mapInstance.geoObjects.add(placemark);
            visibleCount++;
          } catch (error) {
            console.error(`Ошибка добавления маркера ${placemark.dealerId}:`, error);
          }
        }
      });
      
      console.log(`Видимых маркеров: ${visibleCount}`);
      console.log(`Объектов на карте после добавления: ${mapInstance.geoObjects.getLength()}`);

      // Adjust bounds to show only visible placemarks
      const visiblePlacemarks = placemarksRef.current.filter(p => filteredIds.has(p.dealerId));
      if (visiblePlacemarks.length > 0 && mapInstance) {
        const group = new window.ymaps.GeoObjectCollection({}, {});
        visiblePlacemarks.forEach(placemark => group.add(placemark));
        
        try {
          const bounds = group.getBounds();
          if (bounds && bounds.length > 0) {
            mapInstance.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });
          }
        } catch (error) {
          console.warn('Could not adjust bounds for filtered placemarks:', error);
        }
      }
    }
  }, [filteredDealers, mapInstance]);

  // Update placemark colors when highlighted dealer changes (without recreating placemarks)
  useEffect(() => {
    if (mapInstance && placemarksRef.current.length > 0) {
      placemarksRef.current.forEach(placemark => {
        const isHighlighted = placemark.dealerId === highlightedDealer;
        placemark.options.set('preset', isHighlighted ? 'islands#blueDotIcon' : 'islands#redDotIcon');
      });
    }
  }, [highlightedDealer, mapInstance]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleShowOnMap = (dealerId: string) => {
    console.log(`Показать на карте дилера: ${dealerId}`);
    console.log(`Количество маркеров в placemarksRef: ${placemarksRef.current.length}`);
    console.log(`Количество объектов на карте:`, mapInstance?.geoObjects.getLength());
    
    setHighlightedDealer(dealerId);
    
    // Find the dealer coordinates
    const dealer = filteredDealers.find(d => d.id === dealerId);
    if (dealer && mapInstance) {
      let coordinates: [number, number] | null = null;
      
      if (dealer.latitude && dealer.longitude && 
          parseFloat(dealer.latitude) !== 0 && parseFloat(dealer.longitude) !== 0) {
        coordinates = [parseFloat(dealer.latitude), parseFloat(dealer.longitude)];
      } else if (dealer.address && dealer.city) {
        // Check cached coordinates
        const cacheKey = `${dealer.city}_${dealer.address}`;
        if (storedCoordinates[cacheKey]) {
          coordinates = storedCoordinates[cacheKey];
        }
      }
      
      if (coordinates) {
        console.log(`Перемещаем карту к координатам: ${coordinates}`);
        
        // Don't change zoom level dramatically, just center
        mapInstance.setCenter(coordinates, 12, {
          checkZoomRange: true,
          duration: 1000
        });
        
        // Find and highlight the marker (don't try to open balloon due to cross-origin issues)
        let foundPlacemark = false;
        placemarksRef.current.forEach(placemark => {
          if (placemark.dealerId === dealerId) {
            console.log(`Найден маркер для дилера ${dealerId}`);
            foundPlacemark = true;
          }
        });
        
        if (!foundPlacemark) {
          console.warn(`Маркер для дилера ${dealerId} не найден в placemarksRef`);
        }
      } else {
        console.warn(`Координаты для дилера ${dealerId} не найдены`);
      }
    }
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedDealer(null);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e90039] mx-auto mb-4"></div>
              <p className="text-secondary">Загрузка карты дилеров...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50 pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2f378b] mb-4">ГДЕ КУПИТЬ</h1>
          <p className="text-secondary text-lg">
            Найдите ближайшего дилера АЛЬТА СЛЭБ в вашем городе
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или городу..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                data-testid="input-search-dealers"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Dealer Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-dealer-type"
            >
              {dealerTypeFilters.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-region"
            >
              {regions.map(region => (
                <option key={region.key} value={region.key}>
                  {region.label}
                </option>
              ))}
            </select>

            {/* Services Filter */}
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(service => (
                <button
                  key={service}
                  onClick={() => handleServiceToggle(service)}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                    selectedServices.includes(service)
                      ? 'bg-[#e90039] text-white'
                      : 'bg-gray-100 text-secondary hover:bg-gray-200'
                  }`}
                  data-testid={`button-service-${service}`}
                >
                  {serviceLabels[service as keyof typeof serviceLabels]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#2f378b]">Карта дилеров</h2>
                <p className="text-secondary text-sm mt-1">
                  Найдено дилеров: {filteredDealers.length}
                </p>
              </div>
              <div className="relative">
                <div
                  id="yandex-map"
                  className="w-full h-96 lg:h-[500px]"
                  data-testid="yandex-map"
                >
                  {!mapLoaded && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e90039] mx-auto mb-2"></div>
                        <p className="text-secondary text-sm">Загрузка карты...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dealer List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#2f378b]">Список дилеров</h2>
            
            {filteredDealers.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredDealers.map(dealer => (
                  <div key={dealer.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-[#2f378b] mb-2">{dealer.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary">
                          {dealer.address}, {dealer.city}, {dealer.region}
                        </span>
                      </div>
                      
                      {dealer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${dealer.phone}`} className="text-[#e90039] hover:underline">
                            {dealer.phone}
                          </a>
                        </div>
                      )}
                      
                      {dealer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${dealer.email}`} className="text-[#e90039] hover:underline">
                            {dealer.email}
                          </a>
                        </div>
                      )}
                      
                      {dealer.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a
                            href={dealer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e90039] hover:underline"
                          >
                            Сайт
                          </a>
                        </div>
                      )}
                      
                      {dealer.workingHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-secondary">{dealer.workingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Show on Map Button */}
                    <button
                      onClick={() => handleShowOnMap(dealer.id)}
                      className="mt-3 w-full bg-[#e90039] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#d1003a] transition-colors flex items-center justify-center gap-2"
                      data-testid={`button-show-on-map-${dealer.id}`}
                    >
                      <MapPin className="w-4 h-4" />
                      Показать на карте
                    </button>
                    
                    {/* Services */}
                    {dealer.services.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Услуги:</p>
                        <div className="flex flex-wrap gap-1">
                          {dealer.services.map(service => (
                            <span
                              key={service}
                              className="px-2 py-1 bg-gray-100 text-xs rounded text-secondary"
                            >
                              {serviceLabels[service as keyof typeof serviceLabels] || service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Dealer Type Badge */}
                    <div className="mt-3">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        dealer.dealerType === 'retail' ? 'bg-blue-100 text-blue-700' :
                        dealer.dealerType === 'wholesale' ? 'bg-green-100 text-green-700' :
                        dealer.dealerType === 'authorized' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {dealerTypeFilters.find(t => t.key === dealer.dealerType)?.label || dealer.dealerType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-secondary">
                  {searchQuery || selectedType || selectedRegion || selectedServices.length > 0
                    ? 'Дилеры по заданным критериям не найдены'
                    : 'Список дилеров пуст'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}