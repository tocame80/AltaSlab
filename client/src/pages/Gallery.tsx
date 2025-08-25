import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Maximize2, Filter, ChevronDown, X } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GalleryProject {
  id: string;
  title: string;
  description: string;
  application: string;
  images: string[];
  materialsUsed: string[];
  location?: string;
  area?: string;
  year?: string;
}

export default function Gallery() {
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext();
  
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch gallery projects
  const { data: galleryProjects = [], isLoading } = useQuery<GalleryProject[]>({
    queryKey: ['/api/gallery-projects'],
  });

  // Application filter options
  const applicationFilters = [
    { key: '', label: 'Все проекты' },
    { key: 'interior', label: 'Интерьер' },
    { key: 'exterior', label: 'Экстерьер' },
    { key: 'commercial', label: 'Коммерческие' },
    { key: 'residential', label: 'Жилые' }
  ];

  // Filter projects by application
  const filteredProjects = useMemo(() => {
    if (!selectedApplication) return galleryProjects;
    return galleryProjects.filter((project: GalleryProject) => project.application === selectedApplication);
  }, [galleryProjects, selectedApplication]);

  // Handle image navigation
  const navigateImage = (projectId: string, direction: 'prev' | 'next', totalImages: number) => {
    setCurrentImageIndexes(prev => {
      const current = prev[projectId] || 0;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = current + 1 >= totalImages ? 0 : current + 1;
      } else {
        newIndex = current - 1 < 0 ? totalImages - 1 : current - 1;
      }
      
      return { ...prev, [projectId]: newIndex };
    });
  };

  // Get materials used in project
  const getProjectMaterials = (materialIds: string[]) => {
    return products.filter(product => materialIds.includes(product.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="bg-gray-50 pt-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e90039] mx-auto mb-4"></div>
                <p className="text-secondary">Загрузка галереи...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
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
          <h1 className="text-3xl md:text-4xl font-bold text-[#2f378b] mb-4">ГАЛЕРЕЯ ПРОЕКТОВ</h1>
          <p className="text-secondary text-lg">
            Познакомьтесь с реализованными проектами с использованием панелей АЛЬТА СЛЭБ
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
              
              {/* Application Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#2f378b] mb-3">Применение</h4>
                <div className="space-y-2">
                  {applicationFilters.map(filter => (
                    <label key={filter.key} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="application"
                        value={filter.key}
                        checked={selectedApplication === filter.key}
                        onChange={(e) => {
                          setSelectedApplication(e.target.value);
                          // Close mobile filters after selection on mobile
                          if (window.innerWidth < 1024) {
                            setTimeout(() => setShowMobileFilters(false), 300);
                          }
                        }}
                        className="mr-2 accent-[#e90039]"
                      />
                      <span className="text-secondary text-sm">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project: GalleryProject) => {
              const currentImageIndex = currentImageIndexes[project.id] || 0;
              const projectMaterials = getProjectMaterials(project.materialsUsed);
              
              return (
                <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  
                  {/* Image Slider */}
                  <div className="relative aspect-video bg-gray-200">
                    {project.images && project.images.length > 0 ? (
                      <>
                        <img
                          src={project.images[currentImageIndex]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navigation Arrows */}
                        {project.images.length > 1 && (
                          <>
                            <button
                              onClick={() => navigateImage(project.id, 'prev', project.images.length)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                              data-testid={`button-prev-image-${project.id}`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => navigateImage(project.id, 'next', project.images.length)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                              data-testid={`button-next-image-${project.id}`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Indicators */}
                        {project.images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {project.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [project.id]: index }))}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                                data-testid={`indicator-image-${project.id}-${index}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Изображение не доступно</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2f378b] mb-3">{project.title}</h3>
                    <p className="text-secondary mb-4">{project.description}</p>
                    
                    {/* Project Details */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-secondary">
                      {project.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                      )}
                      {project.area && (
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-4 h-4" />
                          <span>{project.area}</span>
                        </div>
                      )}
                      {project.year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{project.year}</span>
                        </div>
                      )}
                    </div>

                    {/* Materials Used */}
                    {projectMaterials.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#2f378b] mb-3">Материалы проекта:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {projectMaterials.slice(0, 4).map(material => (
                            <div key={material.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                              <ProductCard
                                product={material}
                                isFavorite={isFavorite(material.id)}
                                onToggleFavorite={() => toggleFavorite(material.id)}
                              />
                            </div>
                          ))}
                        </div>
                        {projectMaterials.length > 4 && (
                          <p className="text-sm text-secondary mt-2">
                            И еще {projectMaterials.length - 4} материалов...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary text-lg">
                  {selectedApplication 
                    ? `Проекты категории "${applicationFilters.find(f => f.key === selectedApplication)?.label}" не найдены`
                    : 'Проекты не найдены'
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