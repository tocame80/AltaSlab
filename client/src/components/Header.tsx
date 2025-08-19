import { Mail, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Link } from 'wouter';

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
            <Link href="/" className="nav-link">КАТАЛОГ</Link>
            <Link href="/calculator" className="nav-link">КАЛЬКУЛЯТОР</Link>
            <Link href="/certificates" className="nav-link">СЕРТИФИКАТЫ</Link>
            <Link href="/faq" className="nav-link">FAQ</Link>
            <Link href="/video" className="nav-link">ВИДЕОИНСТРУКЦИИ</Link>
            <a href="#company" className="nav-link">О КОМПАНИИ</a>
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/contact" className="text-muted hover:text-[#E95D22] transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
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
              <Link href="/" className="nav-link">КАТАЛОГ</Link>
              <Link href="/calculator" className="nav-link">КАЛЬКУЛЯТОР</Link>
              <Link href="/certificates" className="nav-link">СЕРТИФИКАТЫ</Link>
              <Link href="/faq" className="nav-link">FAQ</Link>
              <Link href="/video" className="nav-link">ВИДЕОИНСТРУКЦИИ</Link>
              <a href="#company" className="nav-link">О КОМПАНИИ</a>
              <div className="flex items-center space-x-4 pt-4">
                <Link href="/contact" className="text-muted hover:text-[#E95D22] transition-colors">
                  <Mail className="w-5 h-5" />
                </Link>
                <span className="text-accent font-semibold">8 800 555-77-73</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
