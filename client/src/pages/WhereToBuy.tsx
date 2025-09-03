import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Globe, MapPin, Clock, Filter, Search, X, Check } from 'lucide-react';
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
  geographicalRegion?: string;
}

// Function to extract geographical region from address
const extractGeographicalRegion = (address: string): string => {
  const addressLower = address.toLowerCase();
  
  // Check for specific regions/oblasts
  if (addressLower.includes('московская обл') || addressLower.includes('московская область')) {
    return 'Московская область';
  }
  if (addressLower.includes('ленинградская обл') || addressLower.includes('ленинградская область')) {
    return 'Ленинградская область';
  }
  if (addressLower.includes('санкт-петербург') || addressLower.includes('спб')) {
    return 'Санкт-Петербург';
  }
  if (addressLower.includes('москва') || addressLower.includes('г москва')) {
    return 'Москва';
  }
  if (addressLower.includes('краснодарский край')) {
    return 'Краснодарский край';
  }
  if (addressLower.includes('ростовская обл') || addressLower.includes('ростовская область')) {
    return 'Ростовская область';
  }
  if (addressLower.includes('свердловская обл') || addressLower.includes('свердловская область')) {
    return 'Свердловская область';
  }
  if (addressLower.includes('новосибирская обл') || addressLower.includes('новосибирская область')) {
    return 'Новосибирская область';
  }
  if (addressLower.includes('татарстан') || addressLower.includes('республика татарстан')) {
    return 'Республика Татарстан';
  }
  
  // If no specific region found, return "Другие регионы"
  return 'Другие регионы';
};

declare global {
  interface Window {
    ymaps?: any;
  }
}

export default function WhereToBuy() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [highlightedDealer, setHighlightedDealer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);
  const [testModal, setTestModal] = useState<boolean>(false);
  const [detectedRegion, setDetectedRegion] = useState<string>('');
  const [ipDetectionDone, setIpDetectionDone] = useState<boolean>(false);
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

  // Function to detect user's region by IP
  const detectUserRegion = async () => {
    try {
      // Try ipinfo.io first (HTTPS supported)
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      
      console.log('IP API Response:', data);
      
      if (data.country === 'RU') {
        let region = '';
        
        // Map response to our geographical regions 
        const location = (data.region || '').toLowerCase();
        const city = (data.city || '').toLowerCase();
        
        if (city === 'moscow' || location.includes('moscow')) {
          if (location === 'moscow') {
            region = 'Москва';
          } else {
            region = 'Московская область';
          }
        } else if (city === 'saint petersburg' || city === 'st petersburg' || location.includes('saint petersburg')) {
          region = 'Санкт-Петербург';
        } else if (location.includes('leningrad')) {
          region = 'Ленинградская область';
        } else if (location.includes('krasnodar')) {
          region = 'Краснодарский край';
        } else if (location.includes('rostov')) {
          region = 'Ростовская область';
        } else if (location.includes('sverdlovsk')) {
          region = 'Свердловская область';
        } else if (location.includes('novosibirsk')) {
          region = 'Новосибирская область';
        } else if (location.includes('tatarstan')) {
          region = 'Республика Татарстан';
        } else {
          // For testing - let's assume Moscow Oblast for Russian IPs
          region = 'Московская область';
        }
        
        console.log('Detected region:', region);
        setDetectedRegion(region);
      } else {
        console.log('User not in Russia:', data.country);
        // For testing - simulate Moscow Oblast detection
        console.log('Testing: Setting region to Московская область');
        setDetectedRegion('Московская область');
      }
    } catch (error) {
      console.warn('Не удалось определить регион по IP:', error);
      // For testing - simulate Moscow Oblast detection  
      console.log('Testing: Setting region to Московская область');
      setDetectedRegion('Московская область');
    } finally {
      setIpDetectionDone(true);
    }
  };

  // Check localStorage for region preference
  useEffect(() => {
    const savedRegion = localStorage.getItem('selectedRegion');
    if (savedRegion) {
      setSelectedRegion(savedRegion);
      setIpDetectionDone(true);
    } else if (!ipDetectionDone) {
      detectUserRegion();
    }
  }, [ipDetectionDone]);

  // Enhance dealers with geographical regions
  const enhancedDealers = useMemo(() => {
    return dealerLocations.map(dealer => ({
      ...dealer,
      geographicalRegion: extractGeographicalRegion(dealer.address)
    }));
  }, [dealerLocations]);

  // Check if we should show modal after dealers are loaded
  useEffect(() => {
    if (detectedRegion && enhancedDealers.length > 0 && !localStorage.getItem('selectedRegion')) {
      console.log('Checking dealers for region:', detectedRegion);
      console.log('Available regions:', enhancedDealers.map(d => d.geographicalRegion));
      
      const hasDealerasInRegion = enhancedDealers.some(dealer => 
        dealer.geographicalRegion === detectedRegion
      );
      
      console.log('Has dealers in region:', hasDealerasInRegion);
      
      if (hasDealerasInRegion) {
        console.log('Showing region modal');
        setShowRegionModal(true);
      }
    }
  }, [detectedRegion, enhancedDealers]);


  // Get unique cities
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(enhancedDealers.map(dealer => dealer.city)));
    return [{ key: '', label: 'Все города' }, ...uniqueCities.map(city => ({ key: city, label: city }))];
  }, [enhancedDealers]);

  // Get unique geographical regions
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(enhancedDealers.map(dealer => dealer.geographicalRegion)));
    return [{ key: '', label: 'Все регионы' }, ...uniqueRegions.map(region => ({ key: region, label: region }))];
  }, [enhancedDealers]);

  // Filter dealers
  const filteredDealers = useMemo(() => {
    let filtered = enhancedDealers;

    if (selectedCity) {
      filtered = filtered.filter(dealer => dealer.city === selectedCity);
    }

    if (selectedRegion) {
      filtered = filtered.filter(dealer => dealer.geographicalRegion === selectedRegion);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dealer =>
        dealer.name.toLowerCase().includes(query) ||
        dealer.city.toLowerCase().includes(query) ||
        dealer.address.toLowerCase().includes(query) ||
        dealer.geographicalRegion.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [enhancedDealers, selectedCity, selectedRegion, searchQuery]);

  // Handle region confirmation
  const handleRegionConfirm = (confirmed: boolean) => {
    if (confirmed && detectedRegion) {
      setSelectedRegion(detectedRegion);
      localStorage.setItem('selectedRegion', detectedRegion);
    }
    setShowRegionModal(false);
  };

  // Handle region change (clear localStorage when user manually changes)
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    if (value) {
      localStorage.setItem('selectedRegion', value);
    } else {
      localStorage.removeItem('selectedRegion');
    }
  };

  // Load Yandex Maps
  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps && window.ymaps.ready) {
        window.ymaps.ready(() => {
            setMapLoaded(true);
        });
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.onload = () => {
        if (window.ymaps && window.ymaps.ready) {
          window.ymaps.ready(() => {
            setMapLoaded(true);
          });
        }
      };
      script.onerror = (error) => {
        console.error('Ошибка загрузки Яндекс Карт:', error);
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapLoaded && dealerLocations.length > 0 && !mapInstance) {
      // Double-check that ymaps is fully loaded
      if (window.ymaps && window.ymaps.Map && typeof window.ymaps.Map === 'function') {
        try {
          const mapElement = document.getElementById('yandex-map');
          if (mapElement) {
            const map = new window.ymaps.Map('yandex-map', {
              center: [55.753994, 37.622093], // Moscow coordinates
              zoom: 10,
              controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
            });

            setMapInstance(map);
          }
        } catch (error) {
          console.error('Ошибка создания карты:', error);
          // Reset map loaded state to try again
          setMapLoaded(false);
        }
      } else {
        console.warn('Yandex Maps API not fully loaded, retrying...');
        // Try to reload after a short delay
        setTimeout(() => {
          if (window.ymaps && window.ymaps.ready) {
            window.ymaps.ready(() => {
              setMapLoaded(true);
            });
          }
        }, 1000);
      }
    }
  }, [mapLoaded, dealerLocations, mapInstance]);

  // Initialize map markers only once and update visibility based on filters
  useEffect(() => {
    if (mapInstance && enhancedDealers.length > 0 && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      const initializeAllPlacemarks = async () => {
        let currentCoords = { ...storedCoordinates };
        let needsUpdate = false;

        for (const dealer of enhancedDealers) {
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
            } else {
              // Try to geocode the address
              try {
                const fullAddress = `${dealer.city}, ${dealer.address}`;
                const geocodeResult = await window.ymaps.geocode(fullAddress);
                const firstGeoObject = geocodeResult.geoObjects.get(0);
                if (firstGeoObject) {
                  const newCoordinates: [number, number] = firstGeoObject.geometry.getCoordinates();
                  coordinates = newCoordinates;
                  
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
  }, [mapInstance, enhancedDealers, storedCoordinates]);

  // Memoize filtered dealer IDs to prevent unnecessary re-renders
  const filteredDealerIds = useMemo(() => {
    return new Set(filteredDealers.map(d => d.id));
  }, [filteredDealers]);

  // Update placemark visibility based on filters (without recreating them)
  useEffect(() => {
    if (placemarksRef.current.length > 0 && mapInstance) {
      
      // Clear all placemarks from map first
      mapInstance.geoObjects.removeAll();
      
      // Add only visible placemarks and collect them for bounds calculation
      const visiblePlacemarks: any[] = [];
      placemarksRef.current.forEach(placemark => {
        const isVisible = filteredDealerIds.has(placemark.dealerId);
        if (isVisible) {
          try {
            mapInstance.geoObjects.add(placemark);
            visiblePlacemarks.push(placemark);
          } catch (error) {
            console.error(`Ошибка добавления маркера ${placemark.dealerId}:`, error);
          }
        }
      });
      
      // Automatically adjust map bounds to show all visible dealers
      if (visiblePlacemarks.length > 0) {
        try {
          // Get coordinates from placemarks instead of creating a group
          const coordinates = visiblePlacemarks.map(placemark => 
            placemark.geometry.getCoordinates()
          );
          
          if (coordinates.length > 1) {
            // Calculate bounds from coordinates array
            const bounds = window.ymaps.util.bounds.fromPoints(coordinates);
            mapInstance.setBounds(bounds, { 
              checkZoomRange: true, 
              zoomMargin: [50, 50, 50, 50] // Top, Right, Bottom, Left padding
            });
          } else if (coordinates.length === 1) {
            // If only one point, center on it with reasonable zoom
            mapInstance.setCenter(coordinates[0], 12, {
              checkZoomRange: true,
              duration: 500
            });
          }
        } catch (error) {
          console.warn('Не удалось адаптировать границы карты:', error);
        }
      }
    }
  }, [filteredDealerIds, mapInstance, filteredDealers.length]);

  // Update placemark colors when highlighted dealer changes (without recreating placemarks)
  useEffect(() => {
    if (mapInstance && placemarksRef.current.length > 0) {
      placemarksRef.current.forEach(placemark => {
        const isHighlighted = placemark.dealerId === highlightedDealer;
        placemark.options.set('preset', isHighlighted ? 'islands#blueDotIcon' : 'islands#redDotIcon');
      });
    }
  }, [highlightedDealer, mapInstance]);


  const handleShowOnMap = (dealerId: string) => {
    
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
        
        // Don't change zoom level dramatically, just center
        mapInstance.setCenter(coordinates, 12, {
          checkZoomRange: true,
          duration: 1000
        });
        
        // Find and highlight the marker (don't try to open balloon due to cross-origin issues)
        let foundPlacemark = false;
        placemarksRef.current.forEach(placemark => {
          if (placemark.dealerId === dealerId) {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, адресу, городу или региону..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                data-testid="input-search-dealers"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-city"
            >
              {cities.map(city => (
                <option key={city.key} value={city.key}>
                  {city.label}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-region"
            >
              {regions.map(region => (
                <option key={region.key} value={region.key}>
                  {region.label}
                </option>
              ))}
            </select>

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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-[#2f378b] flex-1">{dealer.name}</h3>
                      <button
                        onClick={() => handleShowOnMap(dealer.id)}
                        className="ml-2 bg-[#e90039] text-white p-1.5 rounded-md hover:bg-[#d1003a] transition-colors"
                        title="Показать на карте"
                        data-testid={`button-show-on-map-${dealer.id}`}
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary">
                          {dealer.address}, {dealer.city}
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
                    
                    {/* Region Badge */}
                    <div className="mt-3">
                      <span className="px-2 py-1 text-xs rounded font-medium bg-blue-100 text-blue-700">
                        {dealer.geographicalRegion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-secondary">
                  {searchQuery || selectedCity || selectedRegion
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
      
      {/* Region Confirmation Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2f378b]">
                Подтверждение региона
              </h3>
              <button
                onClick={() => handleRegionConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-secondary mb-4">
                Мы определили ваш регион как:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="font-medium text-blue-800">{detectedRegion}</p>
              </div>
              <p className="text-secondary">
                Это ваш регион? Мы покажем дилеров в этой области.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleRegionConfirm(true)}
                className="flex-1 bg-[#e90039] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d1003a] transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Да, это мой регион
              </button>
              <button
                onClick={() => handleRegionConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Нет, выберу сам
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}