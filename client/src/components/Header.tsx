import { Mail, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Link } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isHeaderVisible = useScrollDirection();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Dispatch custom event with search query
      window.dispatchEvent(
        new CustomEvent("search-products", {
          detail: searchQuery.trim(),
        }),
      );
      // Navigate to home if not already there
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      className={`bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">АС</span>
            </div>
            <div>
              <h1 className="text-primary font-bold text-xl">АЛЬТА СЛЭБ</h1>
              <p className="text-muted text-xs">SPC ПАНЕЛИ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/calculator" className="nav-link">
              КАЛЬКУЛЯТОР
            </Link>
            <Link href="/certificates" className="nav-link">
              СЕРТИФИКАТЫ
            </Link>
            <Link href="/video" className="nav-link">
              ВИДЕОИНСТРУКЦИИ
            </Link>
            <Link href="/faq" className="nav-link">
              ВОПРОСЫ
            </Link>
            <a href="#company" className="nav-link">
              О НАС
            </a>
            <Link href="/" className="nav-link">
              КАТАЛОГ
            </Link>
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/contact"
              className="text-muted hover:text-[#E95D22] transition-colors"
            >
              <Mail className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-muted hover:text-[#E95D22] transition-colors"
              aria-label="Поиск"
            >
              <Search className="w-5 h-5" />
            </button>
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

        {/* Search Panel */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 py-4">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по товарам..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-4 py-2 bg-[#E95D22] text-white rounded-lg hover:bg-[#d14f19] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Найти
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Закрыть поиск"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/calculator" className="nav-link">
                КАЛЬКУЛЯТОР
              </Link>
              <Link href="/certificates" className="nav-link">
                СЕРТИФИКАТЫ
              </Link>
              <Link href="/video" className="nav-link">
                ВИДЕОИНСТРУКЦИИ
              </Link>
              <Link href="/faq" className="nav-link">
                ВОПРОСЫ
              </Link>
              <a href="#company" className="nav-link">
                О НАС
              </a>
              <Link href="/" className="nav-link">
                КАТАЛОГ
              </Link>
              <div className="flex items-center space-x-4 pt-4">
                <Link
                  href="/contact"
                  className="text-muted hover:text-[#E95D22] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-muted hover:text-[#E95D22] transition-colors"
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
