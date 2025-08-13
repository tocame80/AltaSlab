export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col">
      <div 
        className="flex-1 hero-bg bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        <div className="container mx-auto px-6 pt-20 pb-32">
          <div className="text-center text-white">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6" style={{ letterSpacing: '2px' }}>
              АЛЬТА СЛЭБ
            </h1>
            <p className="text-xl lg:text-2xl mb-8 font-light">
              Панели стеновые и потолочные SPC
            </p>
            <p className="text-lg mb-12 text-gray-200">
              Территория уюта. Новый продукт — новые возможности!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn-primary px-8 py-3 rounded-lg font-medium"
                onClick={() => {
                  const catalogElement = document.getElementById('catalog');
                  if (catalogElement) {
                    catalogElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Смотреть каталог
              </button>
              <button className="btn-outline px-8 py-3 rounded-lg font-medium">
                Рассчитать материалы
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
