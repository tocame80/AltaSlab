import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroImages } from '@/assets/hero/heroImages';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use static hero images directly
  const images = heroImages;

  // Auto-slide functionality
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const scrollToCalculator = () => {
    const calculatorElement = document.getElementById('calculator');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full">
      <div className="aspect-[4/3] relative overflow-hidden">
        {images.map((image, index) => (
          <div
            key={`hero-slide-${image.id || index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image.imageUrl}
              alt={image.title || `Hero image ${index + 1}`}
              className="w-full h-full object-cover object-center"
              onLoad={() => console.log(`Hero image loaded: ${image.title}`)}
              onError={(e) => {
                console.error(`Hero image load error: ${image.imageUrl}`);
              }}
            />
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            {/* Hero content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-6">
                <div className="text-center text-white">
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#e85e2e]" 
                    style={{ 
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    АЛЬТА СЛЭБ
                  </h1>
                  <p 
                    className="text-lg md:text-xl lg:text-2xl mb-8 font-light"
                    style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}
                  >
                    Панели стеновые и потолочные SPC
                  </p>
                  <p 
                    className="text-base md:text-lg mb-12 text-gray-200 max-w-3xl mx-auto"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    Инновационное решение для современного строительства. Долговечность, экологичность и превосходный дизайн в каждой панели.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      onClick={scrollToCalculator}
                      className="hover:bg-[#e85e2e]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-[#e90039]"
                    >
                      Рассчитать материал
                    </button>
                    <button 
                      onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border-2 border-white text-white hover:bg-white hover:text-[#e85e2e] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Каталог продукции
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPreviousSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors z-20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}