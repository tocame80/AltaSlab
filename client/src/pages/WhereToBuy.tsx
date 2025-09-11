import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Globe, MapPin, Clock, Filter, Search, X, Check, AlertTriangle } from 'lucide-react';
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
    ymaps3?: any;
  }
}

export default function WhereToBuy() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [highlightedDealer, setHighlightedDealer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);
  const [detectedRegion, setDetectedRegion] = useState<string>('');
  const [ipDetectionDone, setIpDetectionDone] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
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
  const markersRef = useRef<Array<{marker: any, coords: [number, number], element: HTMLElement, dealerId: string}>>([]);
  const featuresLayerRef = useRef<any>(null);
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
      
      
      if (data.country === 'RU') {
        let region = '';
        
        // Map response to our geographical regions 
        const location = (data.region || '').toLowerCase();
        const city = (data.city || '').toLowerCase();
        
        if (city === 'moscow' || location.includes('moscow')) {
          // Both Moscow and Moscow Oblast use the same dealers
          region = 'Московская область';
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
          region = 'Другие регионы';
        }
        
        setDetectedRegion(region);
      }
    } catch (error) {
      console.warn('Не удалось определить регион по IP:', error);
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
      const hasDealerasInRegion = enhancedDealers.some(dealer => 
        dealer.geographicalRegion === detectedRegion
      );
      
      if (hasDealerasInRegion) {
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

  // Load Yandex Maps API 3.0 with enhanced error handling
  useEffect(() => {
    const loadYandexMaps = async () => {
      try {
        // Clear any existing error state
        setMapError(null);
        
        // Удаляем все старые скрипты Yandex Maps
        const oldScripts = document.querySelectorAll('script[src*="api-maps.yandex.ru"]');
        oldScripts.forEach(script => {
          console.log('Removing old Yandex Maps script');
          script.remove();
        });

        // Очищаем старые глобальные переменные
        if (window.ymaps) {
          delete window.ymaps;
        }
        if (window.ymaps3) {
          delete window.ymaps3;
        }

        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
        
        // Check if API key is available
        if (!apiKey) {
          setMapError('api_key_missing');
          return;
        }

        const scriptUrl = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
        
        // Try direct script loading - fetching v3 script is different from v2
        console.log('API Key available:', !!apiKey);
        console.log('API Key length:', apiKey.length);
        console.log('Script URL will be:', scriptUrl);
        
        // Test if the script URL is accessible with a simple fetch
        try {
          console.log('Testing script URL accessibility...');
          const testResponse = await fetch(scriptUrl, { method: 'GET', mode: 'no-cors' });
          console.log('Test fetch completed (no-cors mode)');
        } catch (fetchError) {
          console.error('Script URL fetch test failed:', fetchError);
        }

        // Загружаем скрипт API 3.0
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.type = 'text/javascript';
        
        console.log('Loading Yandex Maps v3 script...');
        
        script.onload = async () => {
          console.log('Yandex Maps v3 script loaded successfully');
          console.log('window.ymaps3 after load:', !!window.ymaps3);
          console.log('Available global properties:', Object.keys(window).filter(key => key.includes('ymap') || key.includes('Ymap')));
          
          // Небольшая задержка для инициализации API
          setTimeout(async () => {
            try {
              if (window.ymaps3) {
                console.log('ymaps3 available, waiting for ready...');
                console.log('ymaps3 object keys:', Object.keys(window.ymaps3));
                await window.ymaps3.ready;
                console.log('ymaps3.ready resolved!');
                setMapLoaded(true);
              } else {
                console.error('ymaps3 still not available after script load');
                console.error('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('ymap')));
                setMapError('api_initialization_failed');
              }
            } catch (error) {
              console.error('Error waiting for ymaps3.ready:', error);
              setMapError('api_initialization_failed');
            }
          }, 100);
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Yandex Maps v3 script:', error);
          console.error('Script URL:', scriptUrl);
          console.error('Script src:', script.src);
          console.error('Error event details:', {
            errorType: typeof error,
            errorString: String(error),
            eventType: (error as Event)?.type || 'unknown',
            hasTarget: !!(error as Event)?.target
          });
          
          // Determine error type based on common scenarios
          if (!apiKey || apiKey.length < 10) {
            setMapError('api_key_invalid');
          } else {
            setMapError('api_key_unauthorized');
          }
        };
        
        document.head.appendChild(script);
        
      } catch (error) {
        console.error('Error in loadYandexMaps:', error);
        setMapError('general_error');
      }
    };

    loadYandexMaps();
  }, []);

  // Initialize map with API 3.0
  useEffect(() => {
    const initMap = async () => {
      console.log('Map initialization effect triggered:', {
        mapLoaded,
        dealerLocationsLength: dealerLocations.length,
        hasMapInstance: !!mapInstance,
        ymaps3Available: !!window.ymaps3
      });

      if (mapLoaded && dealerLocations.length > 0 && !mapInstance) {
        try {
          if (!window.ymaps3) {
            console.error('ymaps3 not available');
            return;
          }

          await window.ymaps3.ready;
          
          const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = window.ymaps3;
          const mapElement = document.getElementById('yandex-map');
          
          if (mapElement) {
            console.log('Creating Yandex Map v3...');
            // Clear any existing content
            mapElement.innerHTML = '';
            
            // Создаем карту с новым API
            const map = new YMap(mapElement, {
              location: {
                center: [37.622093, 55.753994], // Moscow coordinates (lng, lat)
                zoom: 10
              }
            });

            // Добавляем базовый слой карты
            map.addChild(new YMapDefaultSchemeLayer());
            
            // Добавляем слой для отображения маркеров
            const featuresLayer = new YMapDefaultFeaturesLayer();
            map.addChild(featuresLayer);
            featuresLayerRef.current = featuresLayer;
            
            console.log('Map v3 created successfully!');
            setMapInstance(map);
          } else {
            console.error('Map element not found');
          }
        } catch (error) {
          console.error('Error creating map v3:', error);
        }
      }
    };

    initMap();
  }, [mapLoaded, dealerLocations, mapInstance]);

  // Initialize map markers only once and update visibility based on filters
  useEffect(() => {
    if (mapInstance && enhancedDealers.length > 0 && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      const initializeAllPlacemarks = async () => {
        let currentCoords = { ...storedCoordinates };
        let needsUpdate = false;

        // Оптимизация: батч геокодирование и ограничение количества запросов
        const dealersToGeocode: typeof enhancedDealers = [];
        const dealersWithCoords: Array<{dealer: typeof enhancedDealers[0], coords: [number, number]}> = [];
        
        // Сначала обрабатываем дилеров с готовыми координатами
        for (const dealer of enhancedDealers) {
          let coordinates: [number, number] | null = null;

          // Check if we have coordinates from database
          if (dealer.latitude && dealer.longitude && 
              parseFloat(dealer.latitude) !== 0 && parseFloat(dealer.longitude) !== 0) {
            coordinates = [parseFloat(dealer.latitude), parseFloat(dealer.longitude)];
            dealersWithCoords.push({dealer, coords: coordinates});
          } else if (dealer.address && dealer.city) {
            // Check cached coordinates first
            const cacheKey = `${dealer.city}_${dealer.address}`;
            
            if (currentCoords[cacheKey]) {
              coordinates = currentCoords[cacheKey];
              dealersWithCoords.push({dealer, coords: coordinates});
            } else {
              // Добавляем в очередь для геокодирования
              dealersToGeocode.push(dealer);
            }
          }
        }
        
        // Сразу отображаем дилеров с готовыми координатами используя v3 API
        for (const {dealer, coords} of dealersWithCoords) {
          // Создаем DOM элемент для маркера
          const markerElement = document.createElement('div');
          markerElement.className = 'dealer-marker';
          markerElement.innerHTML = `
            <div style="
              width: 30px;
              height: 30px;
              background: #e90039;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              !
            </div>
          `;
          
          // Добавляем tooltip/popup для маркера
          markerElement.title = `${dealer.name} - ${dealer.city}`;
          
          // Создаем маркер с v3 API
          const { YMapMarker } = window.ymaps3;
          const marker = new YMapMarker(
            {
              coordinates: coords,
              draggable: false
            },
            markerElement
          );
          
          // Добавляем маркер напрямую к карте (не к Features Layer)
          mapInstance.addChild(marker);
          
          // Сохраняем информацию о маркере
          markersRef.current.push({
            marker,
            coords,
            element: markerElement,
            dealerId: dealer.id
          });
        }
        
        // Геокодируем оставшиеся адреса асинхронно (не более 5 за раз)
        const batchSize = 5;
        for (let i = 0; i < Math.min(dealersToGeocode.length, batchSize); i++) {
          const dealer = dealersToGeocode[i];
          const cacheKey = `${dealer.city}_${dealer.address}`;
          
          try {
            const fullAddress = `${dealer.city}, ${dealer.address}`;
            // Temporarily use a simple fallback geocoding for coordinates
            // In production, you would use proper v3 geocoding API
            // For now, generate coordinates based on city for demo purposes
            let newCoordinates: [number, number] = [37.622093, 55.753994]; // Default Moscow
            
            // Simple city-based coordinate mapping for demonstration
            if (dealer.city.toLowerCase().includes('петербург')) {
              newCoordinates = [30.315868, 59.939095]; // St. Petersburg
            } else if (dealer.city.toLowerCase().includes('казан')) {
              newCoordinates = [49.106414, 55.796127]; // Kazan
            } else if (dealer.city.toLowerCase().includes('екатеринбург')) {
              newCoordinates = [60.597465, 56.838011]; // Ekaterinburg
            } else if (dealer.city.toLowerCase().includes('новосибирск')) {
              newCoordinates = [82.920430, 55.018803]; // Novosibirsk
            }
            
            // Cache the coordinates
            currentCoords[cacheKey] = newCoordinates;
            needsUpdate = true;
            
            // Создаем DOM элемент для маркера
            const markerElement = document.createElement('div');
            markerElement.className = 'dealer-marker';
            markerElement.innerHTML = `
              <div style="
                width: 30px;
                height: 30px;
                background: #e90039;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                !
              </div>
            `;
            
            // Добавляем tooltip для маркера
            markerElement.title = `${dealer.name} - ${dealer.city}`;
            
            // Создаем маркер с v3 API
            const { YMapMarker } = window.ymaps3;
            const marker = new YMapMarker(
              {
                coordinates: newCoordinates,
                draggable: false
              },
              markerElement
            );
            
            // Добавляем маркер напрямую к карте (не к Features Layer)
            mapInstance.addChild(marker);
            
            // Сохраняем информацию о маркере
            markersRef.current.push({
              marker,
              coords: newCoordinates,
              element: markerElement,
              dealerId: dealer.id
            });
          } catch (error) {
            console.warn(`Не удалось геокодировать адрес для ${dealer.name}:`, error);
          }
        }

        // Update stored coordinates if needed
        if (needsUpdate) {
          setStoredCoordinates(currentCoords);
          storeCoordinates(currentCoords);
        }

        
        // Fit map to show all markers
        if (markersRef.current.length > 0) {
          try {
            const coordinates = markersRef.current.map(markerData => markerData.coords);
            
            if (coordinates.length > 1) {
              // Calculate bounds from coordinates
              const lngs = coordinates.map(coord => coord[0]);
              const lats = coordinates.map(coord => coord[1]);
              
              const bounds = [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)]
              ];
              
              mapInstance.setLocation({
                bounds: bounds,
                duration: 1000
              });
            } else if (coordinates.length === 1) {
              mapInstance.setLocation({
                center: coordinates[0],
                zoom: 12,
                duration: 1000
              });
            }
          } catch (error) {
            console.warn('Could not set map bounds:', error);
            mapInstance.setLocation({
              center: [37.62, 55.75],
              zoom: 5,
              duration: 1000
            });
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

  // Update marker visibility based on filters (without recreating them)
  useEffect(() => {
    if (markersRef.current.length > 0 && mapInstance && featuresLayerRef.current) {
      
      // Remove all markers from map first
      markersRef.current.forEach(markerData => {
        try {
          mapInstance.removeChild(markerData.marker);
        } catch (error) {
          // Marker might already be removed, ignore error
        }
      });
      
      // Add only visible markers and collect them for bounds calculation
      const visibleMarkers: any[] = [];
      markersRef.current.forEach(markerData => {
        const isVisible = filteredDealerIds.has(markerData.dealerId);
        if (isVisible) {
          try {
            mapInstance.addChild(markerData.marker);
            visibleMarkers.push(markerData);
          } catch (error) {
            console.error(`Ошибка добавления маркера ${markerData.dealerId}:`, error);
          }
        }
      });
      
      // Automatically adjust map bounds to show all visible dealers
      if (visibleMarkers.length > 0) {
        try {
          // Get coordinates from markers
          const coordinates = visibleMarkers.map(marker => marker.coordinates);
          
          if (coordinates.length > 1) {
            // Calculate bounds from coordinates array
            const lngs = coordinates.map(coord => coord[0]);
            const lats = coordinates.map(coord => coord[1]);
            
            const bounds = [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)]
            ];
            
            mapInstance.setLocation({
              bounds: bounds,
              duration: 1000
            });
          } else if (coordinates.length === 1) {
            // If only one point, center on it with reasonable zoom
            mapInstance.setLocation({
              center: coordinates[0],
              zoom: 12,
              duration: 500
            });
          }
        } catch (error) {
          console.warn('Не удалось адаптировать границы карты:', error);
        }
      }
    }
  }, [filteredDealerIds, mapInstance, filteredDealers.length]);

  // Update marker colors when highlighted dealer changes (without recreating markers)
  useEffect(() => {
    if (mapInstance && markersRef.current.length > 0) {
      markersRef.current.forEach(markerData => {
        const isHighlighted = markerData.dealerId === highlightedDealer;
        const markerElement = markerData.element?.querySelector('.dealer-marker > div') as HTMLElement;
        if (markerElement) {
          markerElement.style.background = isHighlighted ? '#2f378b' : '#e90039';
          markerElement.style.transform = isHighlighted ? 'scale(1.2)' : 'scale(1)';
        }
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
        mapInstance.setLocation({
          center: coordinates,
          zoom: 12,
          checkZoomRange: true,
          duration: 1000
        });
        
        // Find and highlight the marker
        let foundMarker = false;
        markersRef.current.forEach(marker => {
          if (marker.dealerId === dealerId) {
            foundMarker = true;
          }
        });
        
        if (!foundMarker) {
          console.warn(`Маркер для дилера ${dealerId} не найден в markersRef`);
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
                  {mapError && (
                    <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200">
                      <div className="text-center p-6 max-w-md">
                        <div className="mb-4">
                          <MapPin className="w-12 h-12 text-red-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-red-700 mb-2">
                            Ошибка загрузки карты
                          </h3>
                        </div>
                        
                        {mapError === 'api_key_missing' && (
                          <div className="space-y-3">
                            <p className="text-red-600 text-sm">
                              API ключ Yandex Maps не настроен.
                            </p>
                            <div className="bg-white border border-red-200 rounded-lg p-3 text-left">
                              <p className="text-xs text-gray-600 mb-2 font-medium">Для администратора:</p>
                              <p className="text-xs text-gray-700">
                                Добавьте переменную окружения <code className="bg-gray-100 px-1 rounded">VITE_YANDEX_MAPS_API_KEY</code> с действующим API ключом Yandex Maps API v3.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {mapError === 'api_key_invalid' && (
                          <div className="space-y-3">
                            <p className="text-red-600 text-sm">
                              Недействительный API ключ Yandex Maps.
                            </p>
                            <div className="bg-white border border-red-200 rounded-lg p-3 text-left">
                              <p className="text-xs text-gray-600 mb-2 font-medium">Для администратора:</p>
                              <p className="text-xs text-gray-700 mb-2">
                                Проверьте правильность API ключа в переменной <code className="bg-gray-100 px-1 rounded">VITE_YANDEX_MAPS_API_KEY</code>.
                              </p>
                              <p className="text-xs text-gray-700">
                                Убедитесь, что ключ получен в <a href="https://developer.tech.yandex.ru/" target="_blank" className="text-blue-600 hover:underline">Yandex Developer Console</a>.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {mapError === 'api_key_unauthorized' && (
                          <div className="space-y-3">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="space-y-3">
                                  <p className="text-amber-800 text-sm font-medium">
                                    API ключ не настроен для JavaScript API 3.0
                                  </p>
                                  <div className="text-sm text-amber-700">
                                    <p className="mb-2"><strong>Что произошло:</strong> Ключ работает, но не авторизован для загрузки карт v3</p>
                                    <p className="font-medium mb-2">Решение:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                      <li>Откройте <a href="https://developer.tech.yandex.ru/" target="_blank" className="text-blue-600 hover:underline font-medium">Яндекс.Консоль разработчика</a></li>
                                      <li>Найдите ваш API ключ</li>
                                      <li><strong>Включите услугу "JavaScript API 3.0"</strong></li>
                                      <li>В HTTP Referer добавьте: <code className="bg-amber-100 px-1 rounded text-xs">localhost, replit.com, *.repl.co, *.replit.app</code></li>
                                      <li>Сохраните и подождите 2-3 минуты</li>
                                    </ol>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {mapError === 'api_initialization_failed' && (
                          <div className="space-y-3">
                            <p className="text-red-600 text-sm">
                              Ошибка инициализации Yandex Maps API.
                            </p>
                            <div className="bg-white border border-red-200 rounded-lg p-3 text-left">
                              <p className="text-xs text-gray-700">
                                Попробуйте обновить страницу. Если ошибка повторяется, обратитесь к администратору.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {mapError === 'general_error' && (
                          <div className="space-y-3">
                            <p className="text-red-600 text-sm">
                              Произошла неожиданная ошибка при загрузке карты.
                            </p>
                            <div className="bg-white border border-red-200 rounded-lg p-3 text-left">
                              <p className="text-xs text-gray-700">
                                Попробуйте обновить страницу или обратитесь к администратору сайта.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => window.location.reload()}
                          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                          data-testid="button-reload-map"
                        >
                          Обновить страницу
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!mapLoaded && !mapError && (
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