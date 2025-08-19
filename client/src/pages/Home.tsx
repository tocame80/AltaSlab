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

import Footer from '@/components/Footer';
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
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CollectionsNav 
        activeCollection={activeCollection} 
        onCollectionChange={setActiveCollection}
        favoriteCount={favoriteCount}
      />
      <Catalog activeCollection={activeCollection} />
      <AboutMaterial />
      <Advantages />
      <Applications />
      <Installation />
      <Accessories />
      <Calculator />
      <Certificates />
      <FAQ />
      <VideoInstructions />
      <AboutCompany />
      <Footer />
      
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${isVisible ? '' : 'hidden'}`}
        aria-label="Вернуться наверх"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
