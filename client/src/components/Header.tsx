import { Mail, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHeaderVisible = useScrollDirection();

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">АС</span>
            </div>
            <div>
              <h1 className="text-primary font-bold text-xl">АЛЬТА СЛЭБ</h1>
              <p className="text-muted text-xs">SPC ПАНЕЛИ</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#catalog" className="nav-link">КАТАЛОГ</a>
            <a href="#portfolio" className="nav-link">ПОРТФОЛИО</a>
            <a href="#services" className="nav-link">УСЛУГИ</a>
            <a href="#material" className="nav-link">О МАТЕРИАЛЕ</a>
            <a href="#company" className="nav-link">О КОМПАНИИ</a>
            <a href="#delivery" className="nav-link">ДОСТАВКА</a>
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            <Mail className="text-muted w-5 h-5" />
            <Search className="text-muted w-5 h-5" />
            <span className="text-accent font-semibold">8 800 555-77-73</span>
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
              <a href="#catalog" className="nav-link">КАТАЛОГ</a>
              <a href="#portfolio" className="nav-link">ПОРТФОЛИО</a>
              <a href="#services" className="nav-link">УСЛУГИ</a>
              <a href="#material" className="nav-link">О МАТЕРИАЛЕ</a>
              <a href="#company" className="nav-link">О КОМПАНИИ</a>
              <a href="#delivery" className="nav-link">ДОСТАВКА</a>
              <div className="flex items-center space-x-4 pt-4">
                <Mail className="text-muted w-5 h-5" />
                <span className="text-accent font-semibold">8 800 555-77-73</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
