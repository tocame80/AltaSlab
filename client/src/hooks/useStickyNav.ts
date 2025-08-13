import { useState, useEffect } from 'react';

export function useStickyNav() {
  const [isSticky, setIsSticky] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Find the advantages section
      const advantagesSection = document.querySelector('#advantages');
      if (advantagesSection) {
        const advantagesTop = advantagesSection.getBoundingClientRect().top;
        // Stop being sticky when advantages section comes into view
        setIsSticky(advantagesTop > 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return isSticky;
}