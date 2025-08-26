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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredProjects.map((project: GalleryProject) => {
                const currentImageIndex = currentImageIndexes[project.id] || 0;
                const projectMaterials = getProjectMaterials(project.materialsUsed);
                
                return (
                  <div 
                    key={project.id} 
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => window.location.href = `/project/${project.id}`}
                    data-testid={`card-project-${project.id}`}
                  >
                    
                    {/* Image with Text Overlay */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <>
                          <img
                            src={project.images[currentImageIndex]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          
                          {/* Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-bold line-clamp-2 drop-shadow-lg">
                              {project.title}
                            </h3>
                          </div>
                          
                          {/* Image Counter */}
                          {project.images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                              1 / {project.images.length}
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
                    <div className="p-4">
                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
                        {project.description}
                      </p>
                      
                      {/* Project Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.location && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-[#e90039]" />
                            <span className="font-medium">{project.location}</span>
                          </div>
                        )}
                        {project.area && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                            <Maximize2 className="w-3 h-3 text-[#e90039]" />
                            <span className="font-medium">{project.area}</span>
                          </div>
                        )}
                        {project.year && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                            <Calendar className="w-3 h-3 text-[#e90039]" />
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
                        
                        <div className="grid grid-cols-3 gap-2">
                          {projectMaterials.slice(0, 3).map((material, index) => (
                            <div 
                              key={material.id} 
                              className="group/material rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                              {/* Material Image */}
                              <div className="relative aspect-[2/1] overflow-hidden">
                                <img 
                                  src={material.image} 
                                  alt={`${material.design} - ${material.collection}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/material:scale-105"
                                />
                                
                                {/* Image Overlay - darkening effect on hover */}
                                <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 opacity-0 group-hover/material:opacity-100 pointer-events-none"></div>

                                {/* Product Info Overlay - Bottom Left */}
                                <div className="absolute bottom-0 left-0 p-2 transition-all duration-300">
                                  <div>
                                    {/* Collection */}
                                    <div className="text-white text-[10px] font-medium mb-1 drop-shadow-lg transition-colors duration-300">
                                      {material.collection === 'МАГИЯ БЕТОНА' ? 'МАГИЯ БЕТОНА' : 
                                       material.collection === 'ТКАНЕВАЯ РОСКОШЬ' ? 'ТКАНЕВАЯ РОСКОШЬ' : 
                                       material.collection === 'МАТОВАЯ ЭСТЕТИКА' ? 'МАТОВАЯ ЭСТЕТИКА' : 
                                       material.collection === 'МРАМОРНАЯ ФЕЕРИЯ' ? 'МРАМОРНАЯ ФЕЕРИЯ' : material.collection}
                                    </div>
                                    
                                    {/* Design/Color */}
                                    <div className="text-white text-xs font-semibold drop-shadow-lg transition-colors duration-300">
                                      {material.color}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {projectMaterials.length > 3 && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-600">
                              + еще <span className="font-semibold text-[#e90039]">{projectMaterials.length - 3}</span> материалов
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