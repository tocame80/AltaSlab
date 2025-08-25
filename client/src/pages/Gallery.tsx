import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Maximize2 } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GalleryNav from '@/components/GalleryNav';

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
        </div>
      </div>

      {/* Gallery Navigation */}
      <GalleryNav 
        activeApplication={selectedApplication}
        onApplicationChange={setSelectedApplication}
        projectCount={galleryProjects.length}
      />

      <div className="bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProjects.map((project: GalleryProject) => {
                const currentImageIndex = currentImageIndexes[project.id] || 0;
                const projectMaterials = getProjectMaterials(project.materialsUsed);
                
                return (
                  <div key={project.id} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    
                    {/* Image Slider */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <>
                          <img
                            src={project.images[currentImageIndex]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Navigation Arrows */}
                          {project.images.length > 1 && (
                            <>
                              <button
                                onClick={() => navigateImage(project.id, 'prev', project.images.length)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                data-testid={`button-prev-image-${project.id}`}
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => navigateImage(project.id, 'next', project.images.length)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                data-testid={`button-next-image-${project.id}`}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          {/* Image Counter */}
                          {project.images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                              {currentImageIndex + 1} / {project.images.length}
                            </div>
                          )}
                          
                          {/* Image Indicators */}
                          {project.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                              {project.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [project.id]: index }))}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    index === currentImageIndex 
                                      ? 'bg-white scale-125' 
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                  data-testid={`indicator-image-${project.id}-${index}`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center text-gray-400">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-300 flex items-center justify-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Изображение недоступно</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Project Info */}
                    <div className="p-6">
                      {/* Title and Description */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#2f378b] mb-2 line-clamp-2 group-hover:text-[#e90039] transition-colors duration-200">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      
                      {/* Project Details */}
                      <div className="flex flex-wrap gap-3 mb-5">
                        {project.location && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                            <MapPin className="w-4 h-4 text-[#e90039]" />
                            <span className="font-medium">{project.location}</span>
                          </div>
                        )}
                        {project.area && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                            <Maximize2 className="w-4 h-4 text-[#e90039]" />
                            <span className="font-medium">{project.area}</span>
                          </div>
                        )}
                        {project.year && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                            <Calendar className="w-4 h-4 text-[#e90039]" />
                            <span className="font-medium">{project.year}</span>
                          </div>
                        )}
                      </div>

                      {/* Materials Used */}
                      {projectMaterials.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-[#2f378b] text-sm">МАТЕРИАЛЫ ПРОЕКТА</h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {projectMaterials.length} шт.
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {projectMaterials.slice(0, 4).map((material, index) => (
                              <div 
                                key={material.id} 
                                className="group/material border border-gray-200 rounded-lg p-2 hover:border-[#e90039] hover:shadow-md transition-all duration-200 cursor-pointer"
                              >
                                <div className="text-xs">
                                  <p className="font-medium text-gray-800 line-clamp-1 group-hover/material:text-[#e90039] transition-colors">
                                    {material.name}
                                  </p>
                                  <p className="text-gray-500 line-clamp-1 mt-0.5">
                                    {material.collection}
                                  </p>
                                  {material.price && (
                                    <p className="font-semibold text-[#e90039] mt-1">
                                      от {material.price}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {projectMaterials.length > 4 && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
                              <p className="text-xs text-gray-600">
                                + еще <span className="font-semibold text-[#e90039]">{projectMaterials.length - 4}</span> материалов
                              </p>
                            </div>
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
                  ? `Проекты категории не найдены`
                  : 'Проекты не найдены'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}