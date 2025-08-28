import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CollectionsNav from '@/components/CollectionsNav';
import Catalog from '@/components/Catalog';
import AboutMaterial from '@/components/AboutMaterial';
import Advantages from '@/components/Advantages';
import Applications from '@/components/Applications';
import Installation from '@/components/Installation';
import Accessories from '@/components/Accessories';
import Calculator from '@/components/Calculator';
import Certificates from '@/components/Certificates';
import FAQ from '@/components/FAQ';
import VideoInstructions from '@/components/VideoInstructions';
import AboutCompany from '@/components/AboutCompany';
import Contacts from '@/components/Contacts';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useState, useEffect } from 'react';
import { Collection } from '@/types';
import { ChevronUp } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useFavoritesContext } from '@/contexts/FavoritesContext';

export default function Home() {
  const [activeCollection, setActiveCollection] = useState<Collection>('all');
  const { isVisible, scrollToTop } = useScrollToTop();
  const { favoriteCount } = useFavoritesContext();

  // Listen for navigation events from footer
  useEffect(() => {
    const handleNavigateToCollection = (event: any) => {
      const collection = event.detail as Collection;
      setActiveCollection(collection);
      // Scroll to catalog section
      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('navigate-to-collection', handleNavigateToCollection);
    
    return () => {
      window.removeEventListener('navigate-to-collection', handleNavigateToCollection);
    };
  }, []);

  return (
    <>
      <SEOHead 
        title="АЛЬТА СЛЭБ - Панели SPC стеновые и потолочные | Купить в России"
        description="Премиум панели SPC АЛЬТА СЛЭБ для стен и потолков. Водостойкие, экологичные, простой монтаж. Коллекции бетон, ткань, мрамор. Доставка по России."
        keywords="SPC панели, стеновые панели, потолочные панели, АЛЬТА СЛЭБ, водостойкие панели, ремонт, отделка"
        canonicalUrl="https://altaslab.ru/"
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <main role="main">
          <Hero />
          
          <nav aria-label="Коллекции продуктов">
            <CollectionsNav 
              activeCollection={activeCollection} 
              onCollectionChange={setActiveCollection}
              favoriteCount={favoriteCount}
            />
          </nav>
          
          <section aria-label="Каталог продукции">
            <Catalog 
              activeCollection={activeCollection} 
              onResetFilters={() => setActiveCollection('all')}
              onCollectionChange={setActiveCollection}
            />
          </section>
          
          <section aria-label="О материале">
            <AboutMaterial />
          </section>
          
          <section aria-label="Преимущества">
            <Advantages />
          </section>
          
          <section aria-label="Применение">
            <Applications />
          </section>
          
          <section aria-label="Монтаж">
            <Installation />
          </section>
          
          <section aria-label="Аксессуары">
            <Accessories />
          </section>
          
          <section aria-label="Калькулятор материалов">
            <Calculator />
          </section>
          
          <section aria-label="Сертификаты">
            <Certificates />
          </section>
          
          <section aria-label="Часто задаваемые вопросы">
            <FAQ />
          </section>
          
          <section aria-label="Видеоинструкции">
            <VideoInstructions />
          </section>
          
          <section aria-label="О компании">
            <AboutCompany />
          </section>
          
          <section aria-label="Контакты">
            <Contacts />
          </section>
        </main>
        
        <Footer />
        
        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`back-to-top ${isVisible ? '' : 'hidden'}`}
          aria-label="Вернуться наверх"
          type="button"
        >
          <ChevronUp size={20} />
        </button>
      </div>
    </>
  );
}
