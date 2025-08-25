import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Maximize2 } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useFavoritesContext } from '@/contexts/FavoritesContext';

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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e90039] mx-auto mb-4"></div>
              <p className="text-secondary">Загрузка галереи...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2f378b] mb-4">ГАЛЕРЕЯ ПРОЕКТОВ</h1>
          <p className="text-secondary text-lg">
            Познакомьтесь с реализованными проектами с использованием панелей АЛЬТА СЛЭБ
          </p>
        </div>

        {/* Application Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {applicationFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedApplication(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedApplication === filter.key
                    ? 'bg-[#e90039] text-white'
                    : 'bg-white text-secondary hover:bg-gray-100 border border-gray-300'
                }`}
                data-testid={`filter-application-${filter.key || 'all'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
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
  );
}