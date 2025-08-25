export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 lg:py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">КАТАЛОГ</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><a href="#catalog" className="hover:text-accent transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: 'concrete' }))}>МАГИЯ БЕТОНА</a></li>
              <li><a href="#catalog" className="hover:text-accent transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: 'fabric' }))}>ТКАНЕВАЯ РОСКОШЬ</a></li>
              <li><a href="#catalog" className="hover:text-accent transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: 'matte' }))}>МАТОВАЯ ЭСТЕТИКА</a></li>
              <li><a href="#catalog" className="hover:text-accent transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: 'marble' }))}>МРАМОРНАЯ ФЕЕРИЯ</a></li>
              <li><a href="#catalog" className="hover:text-accent transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: 'accessories' }))}>КОМПЛЕКТУЮЩИЕ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">УСЛУГИ</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><a href="#" className="hover:text-accent transition-colors">ПРОЕКТЫ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">МОНТАЖ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">ОБУЧЕНИЕ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">О КОМПАНИИ</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><a href="#" className="hover:text-accent transition-colors">КОНТАКТЫ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">ПОРТФОЛИО</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">НОВОСТИ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">ПАРТНЕРАМ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">О МАТЕРИАЛЕ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">ДОСТАВКА И ОПЛАТА</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">КОНТАКТЫ</h4>
            <div className="text-xs lg:text-sm text-gray-300 space-y-1 lg:space-y-2">
              <p>Готовы оставить заявку?</p>
              <p className="text-accent">info@alta-slab.ru</p>
              <p>Мы с удовольствием ответим на все ваши вопросы</p>
              <p className="text-accent">8 800 555-77-73</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 lg:mt-12 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs lg:text-sm text-gray-400">©2025. АЛЬТА СЛЭБ - SPC панели. Разработка сайта</p>
            <div className="flex space-x-3 lg:space-x-4 mt-3 lg:mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.12 5.32H17V2.14c-.39-.05-1.74-.14-3.29-.14-3.26 0-5.49 1.99-5.49 5.65v3.47H5V14h3.22v10h3.98V14h3.29l.52-2.88h-3.81V7.05c0-1.09.28-1.91 1.92-1.91z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.098.118.112.222.085.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
