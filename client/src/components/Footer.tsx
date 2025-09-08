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
              <a href="https://vk.com/altaprofilru" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#4C75A3] hover:bg-[#3e5f85] transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M15.07 1.2h-6.1C3.4 1.2 1.2 3.4 1.2 8.93v6.14c0 5.53 2.2 7.73 7.77 7.73h6.1c5.57 0 7.77-2.2 7.77-7.73V8.93c0-5.53-2.2-7.73-7.77-7.73zm2.58 12.1h-1.22c-.46 0-.6-.37-1.43-1.21-.72-.71-1.04-.6-1.07-.6-.23 0-.32-.09-.32-.55v-1.08c0-.24-.07-.24-.07-.24-.24 0-1.73.07-2.36.82-.91 1.08-1.93 3.24-1.93 3.24s-.12.24-.32.24h-1.48c-.29 0-.36-.14-.36-.36 0 0 .04-3.43 1.6-5.17 1.37-1.53 2.45-1.9 3.69-1.9v.94c0 .24.09.36.24.36.14 0 .24-.04.49-.27.4-.38.96-.98 1.33-1.46.24-.32.36-.46.36-.71v-.94c0-.24-.09-.36-.24-.36h-1.22c-.32 0-.53.14-.71.32-.29.29-.71.71-.96.96v-1.2c0-.24-.09-.36-.24-.36h-1.08c-.24 0-.36.09-.36.24v3.0c-.49-.24-1-.38-1.6-.38-1.33 0-2.36 1.03-2.36 2.36s1.03 2.36 2.36 2.36c.6 0 1.11-.14 1.6-.38z"/>
                </svg>
              </a>
              <a href="https://ok.ru/group/52745676259413" target="_blank" rel="noopener noreferrer" aria-label="Одноклассники" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#EE8208] hover:bg-[#d9760a] transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 4c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-3.5 6.5l2.4-2.4.7-.7.7.7 2.4 2.4c.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0L12 17.4l-1.6 1.6c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/user/altaprofil1" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#FF0000] hover:bg-[#e60000] transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://zen.yandex.ru/altaprofil" target="_blank" rel="noopener noreferrer" aria-label="Яндекс Дзен" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#000000] hover:bg-[#333333] transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M5.1 12c0-3.8 3.1-6.9 6.9-6.9s6.9 3.1 6.9 6.9-3.1 6.9-6.9 6.9S5.1 15.8 5.1 12zm6.9-8.1c-4.4 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1-3.6-8.1-8.1-8.1z"/>
                </svg>
              </a>
              <a href="https://t.me/alta_profil_ru" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#0088CC] hover:bg-[#007bb5] transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-1.58 7.44c-.12.539-.432.67-.875.417l-2.41-1.78-1.162 1.122c-.128.128-.236.236-.485.236l.174-2.426 4.4-3.98c.192-.17-.042-.265-.297-.095l-5.446 3.426-2.35-.734c-.51-.16-.52-.51.106-.755l9.186-3.54c.424-.16.798.095.66.755z"/>
                </svg>
              </a>
              <a href="https://rutube.ru/channel/43790367" target="_blank" rel="noopener noreferrer" aria-label="Rutube" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#000000] hover:bg-[#333333] transition-colors flex items-center justify-center">
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-xs lg:text-sm font-bold">R</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
