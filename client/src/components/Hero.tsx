import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { HeroImage } from '@shared/schema';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: heroImages = [], isLoading } = useQuery<HeroImage[]>({
    queryKey: ['/api/hero-images'],
  });

  // Default images in case no images are loaded from database
  const defaultImages = [
    {
      id: 'default-1',
      title: 'Панели АЛЬТА СЛЭБ',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1440',
      isActive: 1,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const images = heroImages.length > 0 ? heroImages : defaultImages;

  // Auto-slide functionality
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const handleCatalogClick = () => {
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCalculatorClick = () => {
    const calculatorElement = document.getElementById('calculator');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full">
        <div className="aspect-[4/3] bg-gray-200 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">Загрузка...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full">
      {/* Hero Slider with 4:3 aspect ratio */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {/* Images */}
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{
                backgroundImage: `url('${image.imageUrl}')`,
              }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="container mx-auto px-6">
                  <div className="text-center text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ letterSpacing: '2px' }}>
                      АЛЬТА СЛЭБ
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl mb-8 font-light">
                      Панели стеновые и потолочные SPC
                    </p>
                    <p className="text-base md:text-lg mb-12 text-gray-200 max-w-3xl mx-auto">
                      Территория уюта. Новый продукт — новые возможности!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        className="btn-primary px-8 py-3 rounded-lg font-medium text-sm md:text-base"
                        onClick={handleCatalogClick}
                      >
                        Смотреть каталог
                      </button>
                      <button 
                        className="btn-outline px-8 py-3 rounded-lg font-medium text-sm md:text-base"
                        onClick={handleCalculatorClick}
                      >
                        Рассчитать материалы
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows (only show if more than 1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPreviousSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators (only show if more than 1 image) */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}