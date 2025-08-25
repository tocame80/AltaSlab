import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, MapPin, Calendar, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GalleryProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  location?: string;
  area?: string;
  year?: string;
  applicationType?: string;
  materialsUsed: string[];
}

export default function ProjectDetails() {
  const [, params] = useRoute('/project/:id');
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch project details
  const { data: galleryProjects = [], isLoading } = useQuery<GalleryProject[]>({
    queryKey: ['/api/gallery-projects'],
  });

  const project = galleryProjects.find(p => p.id === params?.id);

  // Get materials used in project
  const getProjectMaterials = (materialIds: string[]) => {
    return products.filter(product => materialIds.includes(product.id));
  };

  const projectMaterials = project ? getProjectMaterials(project.materialsUsed) : [];

  // Image navigation
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!project) return;
    
    setCurrentImageIndex(prevIndex => {
      const imageCount = project.images.length;
      if (direction === 'prev') {
        return prevIndex === 0 ? imageCount - 1 : prevIndex - 1;
      } else {
        return prevIndex === imageCount - 1 ? 0 : prevIndex + 1;
      }
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') navigateImage('prev');
      if (event.key === 'ArrowRight') navigateImage('next');
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e90039] mx-auto mb-4"></div>
            <p className="text-gray-500">Загружаем проект...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Проект не найден</h1>
            <a href="/gallery" className="text-[#e90039] hover:underline">
              Вернуться в галерею
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#e90039] mb-6 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft size={20} />
          Вернуться в галерею
        </button>

        {/* Image Gallery */}
        <div className="mb-12">
          {/* Main Image */}
          <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm mb-6">
            <div className="aspect-[2/1] relative">
              <img
                src={project.images[currentImageIndex] || '/placeholder-image.jpg'}
                alt={project.title}
                className="w-full h-full object-cover"
                data-testid={`image-main-${currentImageIndex}`}
              />
              
              {/* Project Info Overlay - Bottom Left */}
              <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-r from-black/60 to-transparent">
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-2 drop-shadow-lg">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm">
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
                </div>
              </div>

              {/* Navigation Arrows */}
              {project.images.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-900 p-3 rounded-full hover:bg-white transition-all duration-200"
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-900 p-3 rounded-full hover:bg-white transition-all duration-200"
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {project.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {project.images.length}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {project.images.length > 1 && (
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {project.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-[#e90039]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${project.title} - изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Description */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-[#2f378b] mb-6">О проекте</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {project.description}
            </p>
            
            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              {project.location && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#e90039]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Местоположение</p>
                    <p className="font-semibold text-gray-900">{project.location}</p>
                  </div>
                </div>
              )}
              
              {project.area && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-[#2f378b]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Площадь</p>
                    <p className="font-semibold text-gray-900">{project.area}</p>
                  </div>
                </div>
              )}
              
              {project.year && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Год реализации</p>
                    <p className="font-semibold text-gray-900">{project.year}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Materials Used */}
        {projectMaterials.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2f378b] mb-2">В проекте использован слэб</h2>
              <p className="text-gray-600">Панели АЛЬТА СЛЭБ, использованные в данном проекте</p>
            </div>
            
            {/* Horizontal scrolling container */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4 lg:gap-6">
                {projectMaterials.map((material) => (
                  <div key={material.id} className="w-72 flex-shrink-0 lg:w-auto lg:flex-shrink">
                    <ProductCard
                      product={material}
                      isFavorite={isFavorite(material.id)}
                      onToggleFavorite={() => toggleFavorite(material.id)}
                      onClick={() => window.location.href = `/product/${material.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}