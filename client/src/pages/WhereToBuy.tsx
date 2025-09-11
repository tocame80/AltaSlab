import { useState, useMemo, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

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
          
          const map = new ymaps3.YMap(mapContainer, {
            location: {
              center: [37.622093, 55.753994], // Moscow coordinates (lng, lat for v3)
              zoom: 5
            }
          });
          
          // Add required layers for markers
          const defaultScheme = new ymaps3.YMapDefaultSchemeLayer();
          const defaultFeatures = new ymaps3.YMapDefaultFeaturesLayer();
          
          map.addChild(defaultScheme);
          map.addChild(defaultFeatures);
          
          // Mark that this map has layers
          (map as any).hasLayers = true;
          
          console.log('Yandex Maps v3 created successfully with layers!');
          setMapInstance(map);
          
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
            
            // Create simple div marker element
            const markerContent = document.createElement('div');
            markerContent.style.cssText = `
              width: 20px; 
              height: 20px; 
              background: #e90039; 
              border: 2px solid white;
              border-radius: 50%; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
            `;
            markerContent.title = `${dealer.name}\n${dealer.city}`;
            
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
            console.error('Error details:', markerError.message);
            console.error('Error name:', markerError.name);
            console.error('Error stack:', markerError.stack);
          }
        }
      });
    }
  }, [mapInstance, filteredDealers]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
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
                      
                      {/* Services */}
                      {dealer.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dealer.services.map(service => (
                            <span
                              key={service}
                              className="px-2 py-1 text-xs bg-gray-100 text-secondary rounded"
                            >
                              {serviceLabels[service as keyof typeof serviceLabels] || service}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Dealer Type */}
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs bg-[#e90039] text-white rounded">
                          {dealerTypeFilters.find(t => t.key === dealer.dealerType)?.label || dealer.dealerType}
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
      <Footer />
    </div>
  );
}