import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export default function SEOHead({
  title = "АЛЬТА СЛЭБ - Панели SPC стеновые и потолочные | Купить в России",
  description = "Премиум панели SPC АЛЬТА СЛЭБ для стен и потолков. Водостойкие, экологичные, простой монтаж. Коллекции бетон, ткань, мрамор. Доставка по России.",
  keywords = "SPC панели, стеновые панели, потолочные панели, АЛЬТА СЛЭБ, водостойкие панели, ремонт, отделка",
  ogImage,
  canonicalUrl,
  noIndex = false
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true);
    }

    // Twitter cards
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }
  }, [title, description, keywords, ogImage, canonicalUrl, noIndex]);

  return null; // This component doesn't render anything
}