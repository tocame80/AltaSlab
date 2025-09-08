export default function Footer() {
  return (
    <footer className="bg-[#2f378b] text-white py-8 lg:py-16">
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
              <a href="https://vk.com/altaprofilru" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-.864-1.53-.864-.327 0-.457-.133-.457-.784v-1.544c0-.347-.105-.347-.105-.347-.347 0-2.47.105-3.37 1.165-1.31 1.543-2.757 4.634-2.757 4.634s-.17.347-.457.347H8.895c-.416 0-.516-.196-.516-.516 0 0 .062-4.895 2.28-7.383C12.12 8.432 13.72 7.88 15.473 7.88v1.345c0 .347.133.516.347.516.196 0 .347-.062.694-.387.568-.544 1.365-1.403 1.898-2.082.347-.457.516-.664.516-1.01V5.78c0-.347-.133-.516-.347-.516h-1.744c-.457 0-.754.196-1.01.453-.416.42-1.01 1.01-1.365 1.365v-1.71c0-.347-.133-.516-.347-.516h-1.544c-.347 0-.516.133-.516.347v4.283c-.693-.347-1.427-.544-2.28-.544-1.898 0-3.37 1.472-3.37 3.37s1.472 3.37 3.37 3.37c.853 0 1.587-.197 2.28-.544z"/>
                </svg>
              </a>
              <a href="https://ok.ru/group/52745676259413" target="_blank" rel="noopener noreferrer" aria-label="Одноклассники" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 8c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0 2c-1.986 0-6 .895-6 2.994V15c0 .552.895 1 2 1h8c1.105 0 2-.448 2-1v-2.006C18 10.895 13.986 10 12 10z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/user/altaprofil1" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://zen.yandex.ru/altaprofil" target="_blank" rel="noopener noreferrer" aria-label="Яндекс Дзен" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 18c-1.38 0-2.5-1.12-2.5-2.5v-7c0-1.38 1.12-2.5 2.5-2.5S13 7.12 13 8.5v7c0 1.38-1.12 2.5-2.5 2.5zm5 0c-1.38 0-2.5-1.12-2.5-2.5v-7c0-1.38 1.12-2.5 2.5-2.5S18 7.12 18 8.5v7c0 1.38-1.12 2.5-2.5 2.5z"/>
                </svg>
              </a>
              <a href="https://t.me/alta_profil_ru" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-1.58 7.44c-.12.539-.432.67-.875.417l-2.41-1.78-1.162 1.122c-.128.128-.236.236-.485.236l.174-2.426 4.4-3.98c.192-.17-.042-.265-.297-.095l-5.446 3.426-2.35-.734c-.51-.16-.52-.51.106-.755l9.186-3.54c.424-.16.798.095.66.755z"/>
                </svg>
              </a>
              <a href="https://rutube.ru/channel/43790367" target="_blank" rel="noopener noreferrer" aria-label="Rutube" className="text-gray-400 hover:text-accent transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 12.5c0 2.485-2.015 4.5-4.5 4.5h-3c-2.485 0-4.5-2.015-4.5-4.5v-1c0-2.485 2.015-4.5 4.5-4.5h3c2.485 0 4.5 2.015 4.5 4.5v1zm-3-1.5L12 13l-3-2v4l3-2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
