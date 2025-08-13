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
import AboutCompany from '@/components/AboutCompany';
import Contacts from '@/components/Contacts';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Collection } from '@/types';
import { ChevronUp } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function Home() {
  const [activeCollection, setActiveCollection] = useState<Collection>('all');
  const { isVisible, scrollToTop } = useScrollToTop();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CollectionsNav 
        activeCollection={activeCollection} 
        onCollectionChange={setActiveCollection} 
      />
      <Catalog activeCollection={activeCollection} />
      <AboutMaterial />
      <Advantages />
      <Applications />
      <Installation />
      <Accessories />
      <Calculator />
      <AboutCompany />
      <Contacts />
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
