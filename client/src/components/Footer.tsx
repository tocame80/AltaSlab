import { useLocation } from 'wouter';
import { Collection } from '@/types';

export default function Footer() {
  const [location] = useLocation();

  const handleCollectionClick = (collection: Collection) => {
    if (location === '/') {
      // If on home page, dispatch event to change collection and scroll to catalog
      window.dispatchEvent(new CustomEvent('navigate-to-collection', { detail: collection }));
    } else {
      // If on any other page, navigate to home page with hash
      window.location.href = `/#${collection}`;
    }
  };

  const handleSectionClick = (sectionId: string) => {
    if (location === '/') {
      // If on home page, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on any other page, navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  const handleCatalogClick = () => {
    if (location === '/') {
      // If on home page, scroll to catalog
      const element = document.getElementById('catalog');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on any other page, navigate to home page
      window.location.href = '/#catalog';
    }
  };
  return (
    <footer className="bg-[#2f378b] text-white py-8 lg:py-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">КАТАЛОГ</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><button onClick={() => handleCollectionClick('concrete')} className="hover:text-accent transition-colors text-left">МАГИЯ БЕТОНА</button></li>
              <li><button onClick={() => handleCollectionClick('fabric')} className="hover:text-accent transition-colors text-left">ТКАНЕВАЯ РОСКОШЬ</button></li>
              <li><button onClick={() => handleCollectionClick('matte')} className="hover:text-accent transition-colors text-left">МАТОВАЯ ЭСТЕТИКА</button></li>
              <li><button onClick={() => handleCollectionClick('marble')} className="hover:text-accent transition-colors text-left">МРАМОРНАЯ ФЕЕРИЯ</button></li>
              <li><button onClick={() => handleCollectionClick('accessories')} className="hover:text-accent transition-colors text-left">КОМПЛЕКТУЮЩИЕ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">УСЛУГИ И ПРОЕКТЫ</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><a href="/gallery" className="hover:text-accent transition-colors">ГАЛЕРЕЯ ПРОЕКТОВ</a></li>
              <li><button onClick={() => handleSectionClick('installation')} className="hover:text-accent transition-colors text-left">МОНТАЖ</button></li>
              <li><button onClick={() => handleSectionClick('video-instructions')} className="hover:text-accent transition-colors text-left">ОБУЧЕНИЕ (ВИДЕО)</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4">ПОДДЕРЖКА</h4>
            <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-300">
              <li><a href="/calculator" className="hover:text-accent transition-colors">КАЛЬКУЛЯТОР</a></li>
              <li><a href="/certificates" className="hover:text-accent transition-colors">СЕРТИФИКАТЫ</a></li>
              <li><a href="/faq" className="hover:text-accent transition-colors">ВОПРОСЫ</a></li>
              <li><a href="/where-to-buy" className="hover:text-accent transition-colors">ГДЕ КУПИТЬ</a></li>
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
            <p className="text-xs lg:text-sm text-gray-400">©2025. АЛЬТА СЛЭБ - SPC панели.</p>
            <div className="flex items-center space-x-4 mt-3 lg:mt-4 md:mt-0">
              <div className="flex space-x-3 lg:space-x-4">
                <a href="https://vk.com/altaprofilru" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#4C75A3] hover:bg-[#3e5f85] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.426.132-.426s-.019-1.266.569-1.451c.574-.181 1.311 1.226 2.093 1.766.593.408 1.043.319 1.043.319l2.098-.029s1.097-.068.577-.93c-.043-.07-.305-.643-1.572-1.818-1.329-1.234-1.15-.035 1.045-2.212 1.337-1.328 1.372-1.806 1.372-1.806s.123-.434-.43-.616c-.554-.183-1.281.128-1.281.128l-2.365.015s-.175-.024-.305.054-.229.18-.229.18-.41 1.09-.956 2.015c-1.15 1.947-1.608 2.052-1.795 1.932-.435-.279-.326-1.121-.326-1.719 0-1.872.284-2.653-.554-2.855-.278-.067-.483-.112-1.194-.119-.913-.009-1.685.003-2.123.217-.292.143-.518.46-.381.478.17.022.554.104.758.382.262.359.252 1.165.252 1.165s.15 2.205-.35 2.48c-.345.189-.817-.196-1.829-1.96-.519-.899-.91-1.893-.91-1.893s-.076-.186-.211-.286c-.164-.122-.393-.161-.393-.161l-2.248.014s-.338.01-.462.156c-.11.131-.009.4-.009.4s1.929 4.527 4.114 6.811c2.005 2.094 4.281 1.955 4.281 1.955z"/>
                  </svg>
                </a>
                <a href="https://ok.ru/group/52745676259413" target="_blank" rel="noopener noreferrer" aria-label="Одноклассники" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#EE8208] hover:bg-[#d9760a] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM9.75 7.5c0-1.24 1.01-2.25 2.25-2.25s2.25 1.01 2.25 2.25S13.24 9.75 12 9.75 9.75 8.74 9.75 7.5zm6.903 10.548c-.42.42-1.102.42-1.522 0L12 14.917l-3.131 3.131c-.42.42-1.102.42-1.522 0-.42-.42-.42-1.102 0-1.522L10.478 13.4c-.803-.396-1.353-1.215-1.353-2.15 0-1.379 1.121-2.5 2.5-2.5s2.5 1.121 2.5 2.5c0 .935-.55 1.754-1.353 2.15l3.131 3.126c.42.42.42 1.102 0 1.522z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/user/altaprofil1" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#FF0000] hover:bg-[#e60000] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://zen.yandex.ru/altaprofil" target="_blank" rel="noopener noreferrer" aria-label="Яндекс Дзен" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#FC3F1D] hover:bg-[#e63619] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </a>
                <a href="https://t.me/alta_profil_ru" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#0088CC] hover:bg-[#007bb5] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                  </svg>
                </a>
                <a href="https://rutube.ru/channel/43790367" target="_blank" rel="noopener noreferrer" aria-label="Rutube" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#000000] hover:bg-[#333333] transition-colors flex items-center justify-center">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-xs lg:text-sm font-bold">R</span>
                  </div>
                </a>
              </div>
              <a 
                href="https://www.goryacheff.pro" 
                className="text-xs lg:text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Разработка сайта
                <svg 
                  viewBox="0 0 120 25" 
                  className="h-3 lg:h-4 w-auto opacity-60"
                  style={{ filter: 'brightness(0.7)' }}
                >
                  <rect x="1" y="1" width="118" height="23" rx="12" ry="12" 
                        fill="#1a1a1a" stroke="#666" strokeWidth="0.5"/>
                  <text x="60" y="16" 
                        fontFamily="Arial, sans-serif" 
                        fontSize="10" 
                        fontWeight="bold" 
                        fill="white" 
                        textAnchor="middle">
                    goryacheff.pro
                  </text>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
