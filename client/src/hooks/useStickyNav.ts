import { useState, useEffect } from 'react';

export function useStickyNav() {
  const [isSticky, setIsSticky] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Find the catalog section
      const catalogSection = document.querySelector('#catalog');
      if (catalogSection) {
        const catalogBottom = catalogSection.getBoundingClientRect().bottom;
        // Stop being sticky when we've scrolled past the catalog section
        setIsSticky(catalogBottom > 0);
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