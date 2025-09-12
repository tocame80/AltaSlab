import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Globe, MapPin, Clock, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detectedRegion, setDetectedRegion] = useState<string>('');
  const [showRegionDialog, setShowRegionDialog] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');

  // Fetch dealer locations
  const { data: dealerLocations = [], isLoading } = useQuery<DealerLocation[]>({
    queryKey: ['/api/dealer-locations'],
  });

  // No dealer type filters - removed as requested

  // Get unique cities from dealers data
  const cityOptions = useMemo(() => {
    if (!dealerLocations.length) return [];
    const cities = dealerLocations.map(dealer => dealer.city);
    return Array.from(new Set(cities)).sort();
  }, [dealerLocations]);

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(dealerLocations.map(dealer => dealer.region)));
    return [{ key: '', label: 'Все регионы' }, ...uniqueRegions.map(region => ({ key: region, label: region }))];
  }, [dealerLocations]);

  // Filter dealers by region, city and search
  const filteredDealers = useMemo(() => {
    let filtered = dealerLocations;

    if (selectedRegion) {
      filtered = filtered.filter(dealer => dealer.region === selectedRegion);
    }

    if (selectedCity) {
      filtered = filtered.filter(dealer => dealer.city === selectedCity);
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
  }, [dealerLocations, selectedRegion, selectedCity, searchQuery]);

  // Detect user's region by IP
  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Use ipapi.co for region detection (free service)
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          console.log('Detected location:', data);
          
          // Map country/region to our regions
          let detectedRegionName = '';
          if (data.country_code === 'RU') {
            // For Russia, try to map region
            if (data.region === 'Moscow' || data.city === 'Moscow') {
              detectedRegionName = 'Московская область';
            } else {
              detectedRegionName = 'Московская область'; // Default for Russia
            }
          } else {
            // For other countries, default to Moscow region
            detectedRegionName = 'Московская область';
          }
          
          setDetectedRegion(detectedRegionName);
          setShowRegionDialog(true);
        }
      } catch (error) {
        console.warn('Could not detect region:', error);
        // Silently fail - user can select region manually
      }
    };

    detectRegion();
  }, []);

  // Handle region confirmation
  const handleRegionConfirm = (confirmed: boolean) => {
    setShowRegionDialog(false);
    if (confirmed && detectedRegion) {
      setSelectedRegion(detectedRegion);
      // Center map on detected region
      centerMapOnRegion(detectedRegion);
    }
  };

  // Center map on region or city
  const centerMapOnRegion = (regionOrCity: string) => {
    if (!mapInstance) return;

    // Coordinates for regions/cities
    const regionCoordinates: { [key: string]: [number, number] } = {
      'Московская область': [55.7558, 37.6176], // Moscow
      'Клин': [56.3324, 36.7277],
      'Мытищи': [55.9116, 37.7307],
      'Хотьково': [56.2527, 37.9986],
      'Талдом': [56.7319, 37.5319],
      'Дубна': [56.7332, 37.1711],
      'Дмитров': [56.3439, 37.5196],
      'Коломна': [55.0783, 38.7782],
      'Сергиев Посад': [56.3000, 38.1333]
    };

    const coords = regionCoordinates[regionOrCity];
    if (coords && mapInstance) {
      console.log(`Centering map on ${regionOrCity}:`, coords);
      try {
        mapInstance.setLocation({
          center: coords,
          zoom: regionOrCity === 'Московская область' ? 8 : 12
        });
      } catch (error) {
        console.error('Error centering map:', error);
      }
    }
  };

  // Load Yandex Maps v3 (для России)
  useEffect(() => {
    const loadYandexMapsV3 = async () => {
      console.log('Loading Yandex Maps v3 for Russia...');
      
      // Check if already loaded
      if ((window as any).ymaps3) {
        console.log('Yandex Maps v3 already loaded');
        setMapLoaded(true);
        
        // Force reinitialize map with layers if missing
        if (mapInstance && !(mapInstance as any).hasLayers) {
          console.log('Forcing map layers update...');
          setMapInstance(null); // Reset to force recreation
        }
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/v3/?apikey=0e8aff63-579c-4dd3-b4cb-c2b48b0d4b93&lang=ru_RU';
        script.referrerPolicy = 'origin'; // Отправляем только домен без пути для Yandex
        
        const timeout = setTimeout(() => {
          console.error('Yandex Maps v3 timeout - check API key and HTTP Referer settings');
          setMapLoaded(false);
        }, 10000); // Увеличим timeout до 10 секунд
        
        script.onload = () => {
          clearTimeout(timeout);
          console.log('Yandex Maps v3 script loaded');
          
          // Проверим что ymaps3 доступен
          if ((window as any).ymaps3) {
            console.log('ymaps3 object available');
            setMapLoaded(true);
          } else {
            console.error('ymaps3 object not available after script load');
            setMapLoaded(false);
          }
        };
        
        script.onerror = (error) => {
          clearTimeout(timeout);
          console.error('Failed to load Yandex Maps v3 script:', error);
          console.error('Script URL:', script.src);
          console.error('Current domain:', window.location.hostname);
          console.error('Current referer:', document.referrer);
          
          // Попробуем проверить API URL fetch запросом
          fetch(script.src)
            .then(response => {
              console.log('API URL fetch status:', response.status);
              console.log('API URL fetch ok:', response.ok);
              if (!response.ok) {
                console.error('API key может быть недействительным или домен не авторизован');
              }
            })
            .catch(fetchError => {
              console.error('API URL fetch failed:', fetchError);
            });
          
          setMapLoaded(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Yandex Maps v3:', error);
        setMapLoaded(false);
      }
    };

    loadYandexMapsV3();
  }, []);

  // Initialize Yandex Maps v3
  useEffect(() => {
    if (mapLoaded && filteredDealers.length > 0 && !mapInstance) {
      console.log('Initializing Yandex Maps v3...');
      
      const initializeYandexMapsV3 = async () => {
        try {
          const ymaps3 = (window as any).ymaps3;
          
          if (!ymaps3) {
            console.error('ymaps3 not available');
            return;
          }

          console.log('Waiting for ymaps3.ready...');
          console.log('Current domain:', window.location.hostname);
          console.log('Full URL:', window.location.href);
          console.log('ymaps3 object:', ymaps3);
          
          // Retry logic for ymaps3.ready (иногда первый раз падает)
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              await ymaps3.ready;
              console.log('ymaps3.ready completed!');
              break; // Success, exit retry loop
            } catch (readyError) {
              retryCount++;
              console.warn(`ymaps3.ready attempt ${retryCount} failed:`, readyError);
              
              if (retryCount >= maxRetries) {
                console.error('ymaps3.ready failed after', maxRetries, 'attempts');
                console.error('readyError type:', typeof readyError);
                console.error('readyError constructor:', readyError?.constructor?.name);
                
                if (readyError instanceof Event) {
                  console.error('Event type:', readyError.type);
                  console.error('Event target:', readyError.target);
                }
                
                throw new Error(`Yandex Maps v3 ready failed after ${maxRetries} attempts: ${readyError instanceof Event ? readyError.type : String(readyError)}`);
              } else {
                console.log(`Retrying ymaps3.ready in 1 second... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          const mapContainer = document.getElementById('yandex-map');
          console.log('Map container found:', !!mapContainer);
          
          if (!mapContainer) {
            throw new Error('Map container #yandex-map not found');
          }
          
          console.log('Creating YMap...');
          console.log('Available ymaps3 methods:', Object.keys(ymaps3));
          
          // Calculate optimal view for all dealers (fallback for initial load)
          const avgLat = dealerLocations.reduce((sum, d) => sum + parseFloat(d.latitude), 0) / dealerLocations.length;
          const avgLng = dealerLocations.reduce((sum, d) => sum + parseFloat(d.longitude), 0) / dealerLocations.length;
          const center = [avgLng, avgLat];
          const zoom = 8; // Initial zoom, will be optimized after map loads
          console.log('Initial map center and zoom:', center, zoom);
          
          const map = new ymaps3.YMap(mapContainer, {
            location: {
              center, // Optimized center based on all dealers
              zoom
            }
          });
          
          // Add click handler to deselect dealer when clicking on empty area
          map.addChild(new ymaps3.YMapListener({
            layer: 'any',
            onClick: (object: any, event: any) => {
              // If click was not on a marker, clear selection
              if (!event.target.closest('[data-marker]')) {
                setSelectedDealerId('');
              }
            }
          }));
          
          // Add required layers for markers
          const defaultScheme = new ymaps3.YMapDefaultSchemeLayer();
          const defaultFeatures = new ymaps3.YMapDefaultFeaturesLayer();
          
          map.addChild(defaultScheme);
          map.addChild(defaultFeatures);
          
          // Mark that this map has layers
          (map as any).hasLayers = true;
          
          console.log('Yandex Maps v3 created successfully with layers!');
          setMapInstance(map);
          
          // Apply professional map view after initialization
          setTimeout(() => {
            updateMapView(map, dealerLocations, selectedCity, selectedRegion, searchQuery);
          }, 100);
          
        } catch (error) {
          console.error('Error creating Yandex Maps v3:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
          
          const mapContainer = document.getElementById('yandex-map');
          if (mapContainer) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            mapContainer.innerHTML = `<div class="p-4 text-center text-red-500">Ошибка Yandex Maps v3: ${errorMsg}</div>`;
          }
        }
      };

      initializeYandexMapsV3();
    }
  }, [mapLoaded, filteredDealers, mapInstance]);

  // Update map markers when filters change  
  useEffect(() => {
    if (mapInstance && filteredDealers.length > 0) {
      console.log('Updating map markers...');
      
      console.log(`Adding ${filteredDealers.length} dealer markers to map`);
      
      // Clear existing markers
      if ((mapInstance as any).currentMarkers) {
        (mapInstance as any).currentMarkers.forEach((marker: any) => {
          mapInstance.removeChild(marker);
        });
      }
      (mapInstance as any).currentMarkers = [];
      
      // Add markers for each dealer
      filteredDealers.forEach(dealer => {
        if (dealer.latitude && dealer.longitude && parseFloat(dealer.latitude) !== 0 && parseFloat(dealer.longitude) !== 0) {
          console.log(`Adding marker: ${dealer.name} at ${dealer.latitude}, ${dealer.longitude}`);
          
          try {
            const ymaps3 = (window as any).ymaps3;
            
            const coordinates = [parseFloat(dealer.longitude), parseFloat(dealer.latitude)];
            console.log(`Creating marker for ${dealer.name} at coordinates:`, coordinates);
            
            // Create interactive div marker element
            const markerContent = document.createElement('div');
            const isSelected = dealer.id === selectedDealerId;
            markerContent.style.cssText = `
              width: ${isSelected ? '28px' : '20px'}; 
              height: ${isSelected ? '28px' : '20px'}; 
              background: ${isSelected ? '#2f378b' : '#e90039'}; 
              border: ${isSelected ? '3px solid #e90039' : '2px solid white'};
              border-radius: 50%; 
              box-shadow: ${isSelected ? '0 4px 8px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.3)'};
              cursor: pointer;
              transition: all 0.2s ease-in-out;
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
              z-index: ${isSelected ? '1000' : '100'};
              position: relative;
            `;
            markerContent.title = `${dealer.name}\n${dealer.city}\nНажмите для выбора`;
            markerContent.setAttribute('data-marker', 'true');
            
            // Add click handler
            markerContent.addEventListener('click', (e) => {
              e.stopPropagation();
              handleDealerSelect(dealer);
            });
            
            // Add hover effects
            markerContent.addEventListener('mouseenter', () => {
              if (!isSelected) {
                markerContent.style.transform = 'scale(1.1)';
                markerContent.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4)';
              }
            });
            
            markerContent.addEventListener('mouseleave', () => {
              if (!isSelected) {
                markerContent.style.transform = 'scale(1)';
                markerContent.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
              }
            });
            
            const marker = new ymaps3.YMapMarker(
              {
                coordinates: coordinates, // [lng, lat] for v3
                draggable: false
              },
              markerContent
            );
            
            mapInstance.addChild(marker);
            (mapInstance as any).currentMarkers.push(marker);
            
            console.log(`✅ Marker added for ${dealer.name}`);
          } catch (markerError) {
            console.error(`❌ Failed to add marker for ${dealer.name}:`, markerError);
            console.error('Error details:', markerError instanceof Error ? markerError.message : String(markerError));
            console.error('Error name:', markerError instanceof Error ? markerError.name : 'Unknown');
            console.error('Error stack:', markerError instanceof Error ? markerError.stack : 'No stack');
          }
        }
      });
    }
  }, [mapInstance, filteredDealers, selectedDealerId]);

  // Auto-adjust map view when filtered dealers change
  useEffect(() => {
    if (!mapInstance || !dealerLocations.length) return;
    
    // Always update map view to show optimal view of visible dealers
    updateMapView(mapInstance, dealerLocations, selectedCity, selectedRegion, searchQuery);
  }, [mapInstance, dealerLocations, selectedCity, selectedRegion, searchQuery]);

  /**
   * Обновляет вид карты Yandex Maps v3 с учётом дилеров и фильтров,
   * показывая точки максимально близко, чтобы все умещались.
   */
  const updateMapView = (
    map: any,
    dealers: DealerLocation[],
    selectedCity?: string,
    selectedRegion?: string,
    searchQuery?: string
  ) => {
    if (!map || !dealers.length) return;

    try {
      const ymaps3 = (window as any).ymaps3;
      if (!ymaps3) return;

      // Фильтруем дилеров по выбранным фильтрам
      let filtered = dealers;
      if (selectedCity && selectedCity !== '') {
        filtered = dealers.filter(d => d.city === selectedCity);
      } else if (selectedRegion && selectedRegion !== '') {
        filtered = dealers.filter(d => d.region === selectedRegion);
      } else if (searchQuery && searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        filtered = dealers.filter(d =>
          d.name.toLowerCase().includes(query) ||
          d.city.toLowerCase().includes(query) ||
          d.address.toLowerCase().includes(query)
        );
      }

      if (filtered.length === 0) return;

      // Преобразуем координаты в массив [lat, lng] для ymaps3.util.bounds
      const points = filtered.map(d => [
        parseFloat(d.latitude),
        parseFloat(d.longitude),
      ]).filter(point => point[0] !== 0 && point[1] !== 0);

      if (points.length === 0) return;

      // ПРОСТОЕ И НАДЕЖНОЕ РЕШЕНИЕ: всегда используем ручной расчет
      const lats = points.map(p => p[0]);
      const lngs = points.map(p => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Добавляем отступы к границам (padding в градусах)
      const latPadding = (maxLat - minLat) * 0.1; // 10% отступ
      const lngPadding = (maxLng - minLng) * 0.1; // 10% отступ
      
      const paddedMinLat = minLat - latPadding;
      const paddedMaxLat = maxLat + latPadding;
      const paddedMinLng = minLng - lngPadding;
      const paddedMaxLng = maxLng + lngPadding;
      
      // Центр с учетом отступов
      const centerLat = (paddedMinLat + paddedMaxLat) / 2;
      const centerLng = (paddedMinLng + paddedMaxLng) / 2;
      
      // Размер области с отступами
      const latDiff = paddedMaxLat - paddedMinLat;
      const lngDiff = paddedMaxLng - paddedMinLng;
      const maxDiff = Math.max(latDiff, lngDiff);

      // Простой и надежный расчет зума
      let zoom = 8; // Базовый зум
      if (maxDiff < 0.01) zoom = 14; // Очень близко (одна точка)
      else if (maxDiff < 0.05) zoom = 12; // Город
      else if (maxDiff < 0.2) zoom = 10; // Несколько точек рядом
      else if (maxDiff < 0.5) zoom = 9; // Область
      else if (maxDiff < 1.0) zoom = 8; // Большая область
      else zoom = 7; // Очень большая область

      console.log(`FIXED map update: center [${centerLng}, ${centerLat}], zoom ${zoom}, ${filtered.length} dealers`);
      console.log(`FIXED bounds: lat ${minLat}-${maxLat}, lng ${minLng}-${maxLng}`);
      console.log(`FIXED with padding: center lat=${centerLat}, lng=${centerLng}`);
      
      map.update({
        location: {
          center: [centerLng, centerLat], // [lng, lat] for v3
          zoom: zoom
        }
      });

    } catch (error) {
      console.error('Error in updateMapView:', error);
    }
  };

  // Handle dealer selection - highlight dealer in list and marker on map
  const handleDealerSelect = (dealer: DealerLocation) => {
    console.log(`Dealer selected: ${dealer.name} in ${dealer.city}, ${dealer.region}`);
    
    // Select dealer for visual highlighting (no filter changes)
    setSelectedDealerId(dealer.id);
    
    // Scroll to dealer card in the list
    setTimeout(() => {
      const dealerElement = document.querySelector(`[data-dealer-id="${dealer.id}"]`);
      if (dealerElement) {
        dealerElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // Center map when region or city is selected
  const centerMapOnLocation = async (city?: string, region?: string) => {
    if (!mapInstance) return;
    
    try {
      console.log(`Manual centering on city: ${city}, region: ${region}`);
      updateMapView(mapInstance, dealerLocations, city, region);
    } catch (error) {
      console.error('Error centering map:', error);
    }
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedDealerId(''); // Clear selected dealer
                }}
                placeholder="Поиск по названию или городу..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                data-testid="input-search-dealers"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDealerId(''); // Clear selected dealer
                centerMapOnLocation(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
              data-testid="select-city"
            >
              <option value="">Все города</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedDealerId(''); // Clear selected dealer
                centerMapOnLocation(undefined, e.target.value);
              }}
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
                  <div 
                    key={dealer.id} 
                    data-dealer-id={dealer.id}
                    className={`bg-white p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
                      dealer.id === selectedDealerId 
                        ? 'border-[#e90039] bg-red-50 shadow-md' 
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                    onClick={() => handleDealerSelect(dealer)}
                  >
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
                      
                      {/* Contact Info */}
                      <div className="text-sm text-secondary mt-2">
                        Тип: {dealer.dealerType === 'retail' ? 'Розничный' : 
                              dealer.dealerType === 'wholesale' ? 'Оптовый' : 
                              dealer.dealerType === 'authorized' ? 'Авторизованный' : 
                              dealer.dealerType}
                      </div>
                      
                      {/* Location */}
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs bg-[#e90039] text-white rounded">
                          {dealer.city}, {dealer.region}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>По выбранным фильтрам дилеры не найдены</p>
                <p className="text-sm mt-2">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Region Confirmation Dialog */}
      <Dialog open={showRegionDialog} onOpenChange={setShowRegionDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2f378b]">
              <MapPin className="w-5 h-5 text-[#e90039]" />
              Определение региона
            </DialogTitle>
            <DialogDescription className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              Мы правильно определили ваш регион?<br />
              <strong className="text-[#e90039]">{detectedRegion}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => handleRegionConfirm(true)}
              className="flex-1 bg-[#e90039] hover:bg-[#c7003a] text-white"
              data-testid="button-confirm-region"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Да, правильно
            </Button>
            <Button
              onClick={() => handleRegionConfirm(false)}
              variant="outline"
              className="flex-1"
              data-testid="button-decline-region"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Нет, выберу сам
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}