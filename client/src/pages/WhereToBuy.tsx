import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, Globe, MapPin, Clock, Filter, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Настройка иконок Leaflet (исправление путей к иконкам)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.divIcon({
  html: `<div style="background-color: #e90039; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

  // Initialize Leaflet (локально установленная библиотека)
  useEffect(() => {
    console.log('Leaflet available locally:', !!L);
    setMapLoaded(true);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapLoaded && filteredDealers.length > 0 && !mapInstance) {
      const mapElement = document.getElementById('yandex-map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      console.log('Creating Leaflet map...');
      try {
        // Создаем карту с центром в Москве
        const map = L.map('yandex-map').setView([55.753994, 37.622093], 5);

        // Добавляем OpenStreetMap слой
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        console.log('Leaflet map created successfully!');
        setMapInstance(map);
      } catch (error) {
        console.error('Failed to create Leaflet map:', error);
      }
    }
  }, [mapLoaded, filteredDealers, mapInstance]);

  // Update map markers when filters change (Leaflet version)
  useEffect(() => {
    if (mapInstance && filteredDealers.length > 0) {
      // Clear existing markers
      mapInstance.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.removeLayer(layer);
        }
      });

      const markers: any[] = [];

      filteredDealers.forEach(dealer => {
        if (dealer.latitude && dealer.longitude) {
          const marker = L.marker([parseFloat(dealer.latitude), parseFloat(dealer.longitude)])
            .bindPopup(`
              <div>
                <h3>${dealer.name}</h3>
                <p><strong>Адрес:</strong> ${dealer.address}</p>
                <p><strong>Город:</strong> ${dealer.city}</p>
                ${dealer.phone ? `<p><strong>Телефон:</strong> ${dealer.phone}</p>` : ''}
                ${dealer.workingHours ? `<p><strong>Часы работы:</strong> ${dealer.workingHours}</p>` : ''}
                <p><strong>Тип:</strong> ${dealer.dealerType}</p>
              </div>
            `)
            .addTo(mapInstance);
          markers.push(marker);
        }
      });

      // Fit map to show all markers
      if (markers.length > 1) {
        const group = new L.featureGroup(markers);
        mapInstance.fitBounds(group.getBounds(), { padding: [20, 20] });
      } else if (markers.length === 1) {
        // Center on single marker
        const dealer = filteredDealers[0];
        mapInstance.setView([parseFloat(dealer.latitude), parseFloat(dealer.longitude)], 12);
      }
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