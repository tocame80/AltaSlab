import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, Maximize2 } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import OptimizedThumbnail from '@/components/OptimizedThumbnail';

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

interface ProjectModalProps {
  project: GalleryProject;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const gallery = project.images || [];
  const projectMaterials = products.filter(product => project.materialsUsed.includes(product.id));

  const navigateImage = (direction: 'prev' | 'next') => {
    if (gallery.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 p-2 rounded-full transition-all duration-200 shadow-lg"
          data-testid="button-close-project-modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {gallery.length > 0 ? (
              <>
                <OptimizedThumbnail
                  src={gallery[currentImageIndex]}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  size={800}
                  quality={0.9}
                />
                
                {/* Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200"
                      data-testid="button-prev-modal-image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200"
                      data-testid="button-next-modal-image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {gallery.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {gallery.length}
                  </div>
                )}

                {/* Image Indicators */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        data-testid={`indicator-modal-image-${index}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Изображения не доступны</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Information */}
        <div className="p-8">
          {/* Title and Description */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2f378b] mb-4">{project.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* Project Details */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.location && (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-[#e90039]" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Местоположение</p>
                  <p className="text-gray-900 font-semibold">{project.location}</p>
                </div>
              </div>
            )}
            {project.area && (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                <Maximize2 className="w-5 h-5 text-[#e90039]" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Площадь</p>
                  <p className="text-gray-900 font-semibold">{project.area}</p>
                </div>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-[#e90039]" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Год реализации</p>
                  <p className="text-gray-900 font-semibold">{project.year}</p>
                </div>
              </div>
            )}
          </div>

          {/* Materials Used */}
          {projectMaterials.length > 0 && (
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2f378b]">МАТЕРИАЛЫ ПРОЕКТА</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {projectMaterials.length} материалов
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projectMaterials.map(material => (
                  <div key={material.id} className="transform hover:scale-105 transition-transform duration-200">
                    <ProductCard
                      product={material}
                      isFavorite={isFavorite(material.id)}
                      onToggleFavorite={() => toggleFavorite(material.id)}
                      onClick={() => {
                        window.location.href = `/product/${material.id}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}