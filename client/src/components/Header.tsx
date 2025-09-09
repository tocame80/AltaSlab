import { Mail, Search, Menu } from "lucide-react";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Link, useLocation } from "wouter";
import altaSlabLogo from "../assets/alta-slab-logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHeaderVisible = useScrollDirection();

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

  const handleCompanyClick = () => {
    if (location === '/') {
      // If on home page, scroll to company section
      const element = document.getElementById('company');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on any other page, navigate to home page
      window.location.href = '/#company';
    }
  };

  const handleSearchClick = () => {
    if (window.location.pathname !== "/") {
      // If not on home page, navigate to home page with catalog hash
      window.location.href = "/#catalog";
    } else {
      // If on home page, scroll to catalog section
      const element = document.getElementById('catalog');
      if (element) {
        // Scroll to top of catalog section
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Dispatch event to focus search input after scrolling
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("show-catalog-search"));
        }, 300);
      }
    }
  };

  return (
    <header
      className={`bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src={altaSlabLogo} 
              alt="АЛЬТА СЛЭБ - SPC ПАНЕЛИ" 
              className="h-8 lg:h-12 w-auto max-w-none"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={handleCatalogClick} className="nav-link">
              КАТАЛОГ
            </button>
            <Link href="/gallery" className="nav-link">
              ГАЛЕРЕЯ
            </Link>
            <Link href="/where-to-buy" className="nav-link">
              ГДЕ КУПИТЬ
            </Link>
            <Link href="/calculator" className="nav-link">
              КАЛЬКУЛЯТОР
            </Link>
            <Link href="/certificates" className="nav-link">
              СЕРТИФИКАТЫ
            </Link>
            <Link href="/video" className="nav-link">
              ВИДЕО
            </Link>
            <Link href="/faq" className="nav-link">
              ВОПРОСЫ
            </Link>
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link
              href="/contact"
              className="text-muted hover:text-[#e90039] transition-colors"
            >
              <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            <button
              onClick={handleSearchClick}
              className="text-muted hover:text-[#e90039] transition-colors"
              aria-label="Поиск"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <span className="text-accent font-semibold text-sm lg:text-base">8 800 555-77-73</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Открыть меню"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <button onClick={handleCatalogClick} className="nav-link text-left">
                КАТАЛОГ
              </button>
              <Link href="/gallery" className="nav-link">
                ГАЛЕРЕЯ
              </Link>
              <Link href="/where-to-buy" className="nav-link">
                ГДЕ КУПИТЬ
              </Link>
              <Link href="/calculator" className="nav-link">
                КАЛЬКУЛЯТОР
              </Link>
              <Link href="/certificates" className="nav-link">
                СЕРТИФИКАТЫ
              </Link>
              <Link href="/video" className="nav-link">
                ВИДЕО
              </Link>
              <Link href="/faq" className="nav-link">
                ВОПРОСЫ
              </Link>
              
              <div className="flex items-center space-x-4 pt-4">
                <Link
                  href="/contact"
                  className="text-muted hover:text-[#e90039] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSearchClick}
                  className="text-muted hover:text-[#e90039] transition-colors"
                  aria-label="Поиск"
                >
                  <Search className="w-5 h-5" />
                </button>
                <span className="text-accent font-semibold">
                  8 800 555-77-73
                </span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}