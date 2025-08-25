import { useState, useContext, useMemo, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Heart, ShoppingCart, Calculator, Download, Share2, Eye, Maximize2, CheckCircle, Clock, Truck, X, ZoomIn, Save, Search, Mail } from 'lucide-react';
import { products } from '@/data/products';
import { FavoritesContext } from '@/contexts/FavoritesContext';
import { Collection } from '@/types';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function ProductDetails() {
  const [, params] = useRoute('/product/:id');
  const favoritesContext = useContext(FavoritesContext);
  if (!favoritesContext) {
    throw new Error('ProductDetails must be used within a FavoritesProvider');
  }
  const { favorites, toggleFavorite } = favoritesContext;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedCollection, setSelectedCollection] = useState<Collection>('all');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const product = products.find(p => p.id === params?.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Продукт не найден</h1>
          <a href="/catalog" className="text-[#E95D22] hover:underline">
            Вернуться в каталог
          </a>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.has(product.id);
  const gallery = product.gallery || [product.image];
  const availability = product.availability || {
    inStock: Math.random() > 0.3,
    deliveryTime: '1-3 дня',
    quantity: Math.floor(Math.random() * 50) + 10
  };

  const getCollectionDisplayName = () => {
    if (product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') {
      return product.name.toLowerCase().includes('профиль') ? 'ПРОФИЛИ' : 'КЛЕЙ';
    }
    return product.collection;
  };

  const getProductDisplayName = () => {
    if (product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') {
      if (product.name.toLowerCase().includes('профиль')) {
        const name = product.name;
        if (name.includes('под рассеивателем')) return `Профиль под рассеивателем ${product.color}`;
        if (name.includes('соединительный')) return `Профиль соединительный ${product.color}`;
        if (name.includes('торцевой')) return `Профиль торцевой ${product.color}`;
        if (name.includes('угловой')) return `Профиль угловой ${product.color}`;
        return `Профиль ${product.color}`;
      }
      return 'Клей Альта Стик';
    }
    return product.design;
  };

  // Image gallery functions
  const openFullscreen = () => {
    setIsFullscreenOpen(true);
  };

  const openImageViewer = () => {
    setIsImageViewerOpen(true);
  };

  const shareImage = async () => {
    const imageUrl = gallery[currentImageIndex];
    const productName = getProductDisplayName();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - АЛЬТА СЛЭБ`,
          text: `Посмотрите на ${productName} из коллекции ${getCollectionDisplayName()}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add toast notification here
    alert('Ссылка скопирована в буфер обмена!');
  };

  const downloadImage = () => {
    const imageUrl = gallery[currentImageIndex];
    const productName = getProductDisplayName();
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${productName}-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreenOpen) setIsFullscreenOpen(false);
        if (isImageViewerOpen) setIsImageViewerOpen(false);
      }
    };

    if (isFullscreenOpen || isImageViewerOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullscreenOpen, isImageViewerOpen]);

  const collections = [
    { key: 'all' as Collection, label: 'ВСЁ', color: 'bg-gray-400' },
    { key: 'concrete' as Collection, label: 'МАГИЯ БЕТОНА', color: 'bg-gray-600' },
    { key: 'fabric' as Collection, label: 'ТКАНЕВАЯ РОСКОШЬ', color: 'bg-purple-500' },
    { key: 'matte' as Collection, label: 'МАТОВАЯ ЭСТЕТИКА', color: 'bg-green-500' },
    { key: 'marble' as Collection, label: 'МРАМОРНАЯ ФЕЕРИЯ', color: 'bg-blue-500' },
    { key: 'accessories' as Collection, label: 'КОМПЛЕКТУЮЩИЕ', color: 'bg-orange-500' },
  ];

  // Get unique colors/designs for the selected collection
  const getColorsForCollection = (collectionKey: Collection) => {
    if (collectionKey === 'all') {
      return [];
    }
    
    const collectionMapping = {
      'concrete': 'МАГИЯ БЕТОНА',
      'fabric': 'ТКАНЕВАЯ РОСКОШЬ', 
      'matte': 'МАТОВАЯ ЭСТЕТИКА',
      'marble': 'МРАМОРНАЯ ФЕЕРИЯ',
      'accessories': 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ'
    };

    const collectionName = collectionMapping[collectionKey as keyof typeof collectionMapping];
    if (!collectionName) return [];

    const filteredProducts = products.filter(p => p.collection === collectionName);
    const uniqueColors = new Map();

    filteredProducts.forEach(product => {
      const key = product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' 
        ? (product.name.toLowerCase().includes('профиль') ? product.color : 'Клей')
        : product.design;
      
      if (!uniqueColors.has(key)) {
        uniqueColors.set(key, {
          name: key,
          productId: product.id,
          color: product.color
        });
      }
    });

    return Array.from(uniqueColors.values());
  };

  const currentCollectionColors = useMemo(() => 
    getColorsForCollection(selectedCollection), 
    [selectedCollection]
  );

  // Set initial collection based on current product
  useEffect(() => {
    if (product) {
      const productCollection = product.collection;
      if (productCollection === 'МАГИЯ БЕТОНА') setSelectedCollection('concrete');
      else if (productCollection === 'ТКАНЕВАЯ РОСКОШЬ') setSelectedCollection('fabric');
      else if (productCollection === 'МАТОВАЯ ЭСТЕТИКА') setSelectedCollection('matte');
      else if (productCollection === 'МРАМОРНАЯ ФЕЕРИЯ') setSelectedCollection('marble');
      else if (productCollection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ') setSelectedCollection('accessories');
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Collections Navigation with Colors */}
      <div className="bg-gray-50 py-4 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <nav className="flex flex-wrap items-center gap-8">
            {collections.map((collection) => (
              <button
                key={collection.key}
                onClick={() => setSelectedCollection(collection.key)}
                className={`text-sm font-medium transition-colors uppercase tracking-wide ${
                  selectedCollection === collection.key 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {collection.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedCollection('favorites' as Collection)}
              className={`text-sm font-medium transition-colors uppercase tracking-wide ${
                selectedCollection === 'favorites' 
                  ? 'text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ИЗБРАННОЕ
            </button>
          </nav>
        </div>
      </div>
      {/* Colors/Designs Navigation */}
      {currentCollectionColors.length > 0 && (
        <div className="bg-gray-50 py-3 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <nav className="flex flex-wrap items-center gap-6">
              {currentCollectionColors.map((colorItem) => (
                <button
                  key={colorItem.productId}
                  onClick={() => window.location.href = `/product/${colorItem.productId}`}
                  className={`text-gray-500 hover:text-gray-700 text-sm transition-colors ${
                    product && (
                      (product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && 
                       ((product.name.toLowerCase().includes('профиль') && colorItem.name === product.color) ||
                        (!product.name.toLowerCase().includes('профиль') && colorItem.name === 'Клей'))) ||
                      (product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && colorItem.name === product.design)
                    ) ? 'font-semibold text-gray-900' : ''
                  }`}
                >
                  {colorItem.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#E95D22] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Вернуться в каталог
        </button>

        {/* Full Width Image Gallery */}
        <div className="mb-12">
          {/* Main Image */}
          <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm mb-6">
            <div className="aspect-[2/1] relative">
              <img
                src={gallery[currentImageIndex]}
                alt={getProductDisplayName()}
                className="w-full h-full object-cover"
              />
              
              {/* Product Info Overlay - Bottom Left - Three Lines */}
              <div className="absolute bottom-0 left-0 p-4 transition-all duration-300">
                <div>
                  {/* Line 1: Collection */}
                  <div className="text-gray-600 hover:text-[#E95D22] text-sm font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                    {getCollectionDisplayName()}
                  </div>
                  
                  {/* Line 2: Color */}
                  <div className="text-gray-900 hover:text-[#E95D22] text-base font-semibold mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                    {product.color}
                  </div>
                  
                  {/* Line 3: Price per m² */}
                  {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                    <div className="text-gray-900 hover:text-[#E95D22] text-base font-bold drop-shadow-lg transition-colors duration-300 cursor-pointer">
                      {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽/м²
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info Overlay - Bottom Right - Three Lines */}
              <div className="absolute bottom-0 right-0 p-4 transition-all duration-300">
                <div className="text-right">
                  {/* Line 1: Size */}
                  <div className="text-gray-600 hover:text-[#E95D22] text-sm font-medium mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                    {product.format}
                  </div>
                  
                  {/* Line 2: Area/Quantity per package */}
                  <div className="text-gray-900 hover:text-[#E95D22] text-base font-semibold mb-1 drop-shadow-lg transition-colors duration-300 cursor-pointer">
                    {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' 
                      ? `${product.areaPerPackage} м²` 
                      : `${product.piecesPerPackage} шт`
                    }
                  </div>
                  
                  {/* Line 3: Price per package */}
                  <div className="text-gray-900 hover:text-[#E95D22] text-base font-bold drop-shadow-lg transition-colors duration-300 cursor-pointer">
                    {product.price.toLocaleString('ru-RU')} ₽ {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'за шт.' : 'за упак.'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={openFullscreen}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-[#E95D22] transition-all"
                title="Полноэкранный просмотр"
              >
                <Maximize2 size={16} />
              </button>
              <button 
                onClick={openImageViewer}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-[#E95D22] transition-all"
                title="Увеличить изображение"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={shareImage}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-[#E95D22] transition-all"
                title="Поделиться"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={downloadImage}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-[#E95D22] transition-all"
                title="Скачать оригинал"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
                  isFavorite 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
                title="Добавить в избранное"
              >
                <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>



          </div>

          {/* Thumbnail Gallery */}
          {gallery.length > 1 && (
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-24 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-[#E95D22]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${getProductDisplayName()} - изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}


        </div>

        

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Описание' },
                { id: 'specifications', label: 'Характеристики' },
                { id: 'installation', label: 'Монтаж' },
                { id: 'calculator', label: 'Калькулятор' },
                { id: 'certificates', label: 'Сертификаты' },
                { id: 'faq', label: 'FAQ' },
                { id: 'video', label: 'Видеоинструкция' },
                { id: 'feedback', label: 'Обратная связь' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#E95D22] text-[#E95D22]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' 
                    ? `${getProductDisplayName()} - высококачественный материал для монтажа и отделки SPC панелей. Обеспечивает надежное крепление и долговечность конструкции.`
                    : `Панель SPC ${getProductDisplayName()} из коллекции "${product.collection}" - это современное решение для стен и потолков. Изготовлена из высококачественных материалов с использованием инновационных технологий.`
                  }
                </p>
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Преимущества:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Высокая износостойкость и долговечность</li>
                  <li>Влагостойкость и устойчивость к температурным перепадам</li>
                  <li>Простота монтажа и обслуживания</li>
                  <li>Экологическая безопасность</li>
                  <li>Широкий выбор дизайнов и текстур</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-8">
                {/* Quick Specs Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{product.format.split('×')[0]}</div>
                    <div className="text-sm text-blue-600 font-medium">Ширина, мм</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{product.format.split('×')[1]}</div>
                    <div className="text-sm text-green-600 font-medium">Длина, мм</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
                        product.piecesPerPackage :
                        product.areaPerPackage
                      }
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'шт в упаковке' : 'м² в упаковке'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {Math.round(product.price / product.areaPerPackage)}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">₽ за м²</div>
                  </div>
                </div>

                {/* Detailed Specifications */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E95D22] rounded-full"></div>
                      Параметры продукта
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Размер панели
                        </span>
                        <span className="font-semibold text-gray-900">{product.format}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Цвет/дизайн
                        </span>
                        <span className="font-semibold text-gray-900">{product.color}</span>
                      </div>
                      {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                        <>
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              Площадь панели
                            </span>
                            <span className="font-semibold text-gray-900">{product.areaPerPiece} м²</span>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              Панелей в упаковке
                            </span>
                            <span className="font-semibold text-gray-900">{product.piecesPerPackage} шт</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Коллекция
                        </span>
                        <span className="font-semibold text-gray-900">{product.collection}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E95D22] rounded-full"></div>
                      Технические характеристики
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Материал
                        </span>
                        <span className="font-semibold text-gray-900">SPC композит</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Тип монтажа
                        </span>
                        <span className="font-semibold text-gray-900">Клеевой</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Применение
                        </span>
                        <span className="font-semibold text-gray-900">Стены, потолки</span>
                      </div>
                      {product.specifications && (
                        <>
                          {product.specifications.thickness && (
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                              <span className="text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                Толщина
                              </span>
                              <span className="font-semibold text-gray-900">{product.specifications.thickness}</span>
                            </div>
                          )}
                          {product.specifications.wearClass && (
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                              <span className="text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                Класс износостойкости
                              </span>
                              <span className="font-semibold text-gray-900">{product.specifications.wearClass}</span>
                            </div>
                          )}
                          {product.specifications.weight && (
                            <div className="flex items-center justify-between py-3">
                              <span className="text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                Вес
                              </span>
                              <span className="font-semibold text-gray-900">{product.specifications.weight}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          Производство
                        </span>
                        <span className="font-semibold text-gray-900">Россия</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#E95D22] rounded-full"></div>
                    Ценовая информация
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#E95D22]">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'за штуку' : 'за упаковку'}
                      </div>
                    </div>
                    {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-sm text-gray-600">за м²</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(product.price / product.piecesPerPackage).toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-sm text-gray-600">за панель</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Инструкция по монтажу</h4>
                  <button className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Скачать PDF инструкцию
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Подготовка поверхности:</h5>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Очистите поверхность от загрязнений</li>
                      <li>Выровняйте основание</li>
                      <li>Обработайте грунтовкой</li>
                      <li>Дайте поверхности высохнуть</li>
                    </ol>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Монтаж панелей:</h5>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Нанесите клей на панель</li>
                      <li>Приложите к поверхности</li>
                      <li>Прижмите и разгладьте</li>
                      <li>Удалите излишки клея</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Дополнительные материалы для скачивания:</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Подробная инструкция по монтажу</div>
                          <div className="text-sm text-gray-600">PDF, 2.4 МБ</div>
                        </div>
                        <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Схемы раскладки панелей</div>
                          <div className="text-sm text-gray-600">PDF, 1.8 МБ</div>
                        </div>
                        <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Рекомендации по уходу</div>
                          <div className="text-sm text-gray-600">PDF, 850 КБ</div>
                        </div>
                        <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Гарантийные условия</div>
                          <div className="text-sm text-gray-600">PDF, 650 КБ</div>
                        </div>
                        <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900 mb-1">Важно:</div>
                      <div className="text-blue-800 text-sm">
                        Перед началом монтажа обязательно ознакомьтесь с полной инструкцией. 
                        При несоблюдении технологии монтажа гарантия производителя может быть аннулирована.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">Калькулятор материала</h4>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-4">Параметры помещения</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Длина помещения (м)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                            placeholder="Введите длину"
                            step="0.1"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ширина помещения (м)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                            placeholder="Введите ширину"
                            step="0.1"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Запас материала (%)</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent">
                            <option value="5">5% - стандартный запас</option>
                            <option value="10">10% - с учетом подрезки</option>
                            <option value="15">15% - сложная геометрия</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-4">Результат расчета</h5>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Площадь помещения:</span>
                          <span className="font-medium text-gray-900">-- м²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">С учетом запаса:</span>
                          <span className="font-medium text-gray-900">-- м²</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Количество упаковок:</span>
                            <span className="font-semibold text-gray-900">-- шт</span>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-gray-600">Общая стоимость:</span>
                            <span className="font-bold text-[#E95D22] text-lg">-- ₽</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 bg-[#E95D22] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d54a1a] transition-colors">
                        Рассчитать
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">i</span>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 mb-1">Рекомендации:</div>
                        <div className="text-blue-800 text-sm">
                          • Для помещений сложной формы рекомендуем увеличить запас до 15%<br/>
                          • При диагональной укладке добавьте дополнительно 10% к общему количеству<br/>
                          • Окончательный расчет уточняйте с менеджером
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Документы качества</h4>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Сертификат соответствия ГОСТ</div>
                            <div className="text-sm text-gray-600">Действителен до: 15.06.2025</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Декларация соответствия ТР ТС</div>
                            <div className="text-sm text-gray-600">Действительна до: 22.08.2025</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Международные сертификаты</h4>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">ISO 14001 (Экологический менеджмент)</div>
                            <div className="text-sm text-gray-600">Международный стандарт</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">CE Marking</div>
                            <div className="text-sm text-gray-600">Европейское соответствие</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Пожарная безопасность</h4>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Сертификат пожарной безопасности</div>
                            <div className="text-sm text-gray-600">Класс КМ2 по НПБ 244-97</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Гарантия</h4>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Гарантийный талон</div>
                            <div className="text-sm text-gray-600">Гарантия 15 лет от производителя</div>
                          </div>
                          <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Технические вопросы</h4>
                  <div className="space-y-3">
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Можно ли укладывать панели на неровную поверхность?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Поверхность должна быть ровной с перепадами не более 2мм на 1м. При необходимости выровняйте основание шпаклевкой или грунтовкой.
                      </div>
                    </details>
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Какой клей лучше использовать для монтажа?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Рекомендуем использовать специальный клей для SPC панелей из нашего каталога. Он обеспечивает надежное сцепление и долговечность крепления.
                      </div>
                    </details>
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Можно ли использовать панели во влажных помещениях?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Да, SPC панели обладают высокой влагостойкостью и подходят для ванных комнат, кухонь и других влажных помещений.
                      </div>
                    </details>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Уход и эксплуатация</h4>
                  <div className="space-y-3">
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Как правильно ухаживать за панелями?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Для ухода достаточно влажной уборки обычными моющими средствами. Избегайте абразивных средств и растворителей.
                      </div>
                    </details>
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Можно ли устанавливать панели в детской комнате?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Да, панели абсолютно безопасны для детей. Они не выделяют вредных веществ и имеют экологические сертификаты.
                      </div>
                    </details>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Доставка и оплата</h4>
                  <div className="space-y-3">
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Какие способы доставки доступны?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Доступна доставка курьером по Москве и области, а также транспортными компаниями по всей России. Подробности уточняйте у менеджера.
                      </div>
                    </details>
                    <details className="bg-white border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                        Можно ли вернуть товар если он не подошел?
                      </summary>
                      <div className="p-4 pt-0 text-gray-700">
                        Да, возврат возможен в течение 14 дней при сохранении товарного вида и упаковки. Стоимость обратной доставки оплачивает покупатель.
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Инструкции по монтажу</h4>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                              <Search size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-gray-600">Видео недоступно</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-medium text-gray-900">Подготовка поверхности и разметка</div>
                          <div className="text-sm text-gray-600 mt-1">Продолжительность: 8:30</div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                              <Search size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-gray-600">Видео недоступно</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-medium text-gray-900">Техника нанесения клея и укладки</div>
                          <div className="text-sm text-gray-600 mt-1">Продолжительность: 12:15</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Обзоры коллекций</h4>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                              <Search size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-gray-600">Видео недоступно</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-medium text-gray-900">Коллекция "Магия Бетона" - детальный обзор</div>
                          <div className="text-sm text-gray-600 mt-1">Продолжительность: 6:45</div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                              <Search size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-gray-600">Видео недоступно</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-medium text-gray-900">Сравнение всех коллекций АЛЬТА СЛЭБ</div>
                          <div className="text-sm text-gray-600 mt-1">Продолжительность: 15:20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Примеры применения</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search size={16} className="text-white" />
                          </div>
                          <div className="text-xs text-gray-600">Видео недоступно</div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-gray-900 text-sm">Современная гостиная</div>
                        <div className="text-xs text-gray-600 mt-1">4:30</div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search size={16} className="text-white" />
                          </div>
                          <div className="text-xs text-gray-600">Видео недоступно</div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-gray-900 text-sm">Офисные интерьеры</div>
                        <div className="text-xs text-gray-600 mt-1">7:15</div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search size={16} className="text-white" />
                          </div>
                          <div className="text-xs text-gray-600">Видео недоступно</div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-gray-900 text-sm">Ванная и кухня</div>
                        <div className="text-xs text-gray-600 mt-1">5:50</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Связь с менеджером</h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                          placeholder="Введите ваше имя"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                        <input 
                          type="tel" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение</label>
                        <textarea 
                          rows={4} 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                          placeholder="Опишите ваш вопрос или пожелание"
                        ></textarea>
                      </div>
                      <button className="w-full bg-[#E95D22] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d54a1a] transition-colors">
                        Отправить сообщение
                      </button>
                    </form>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Техническая поддержка</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-[#E95D22]" />
                          <div>
                            <div className="font-medium text-gray-900">Email</div>
                            <div className="text-gray-600">support@altaslab.ru</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Search size={20} className="text-[#E95D22]" />
                          <div>
                            <div className="font-medium text-gray-900">Горячая линия</div>
                            <div className="text-gray-600">8 (800) 555-35-35</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Заказ образцов</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 mb-3">
                          Закажите бесплатные образцы материала для оценки качества и цвета
                        </p>
                        <button className="bg-[#E95D22] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#d54a1a] transition-colors">
                          Заказать образцы
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Консультация дизайнера</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 mb-3">
                          Получите профессиональную консультацию по выбору материалов для вашего проекта
                        </p>
                        <button className="bg-[#E95D22] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#d54a1a] transition-colors">
                          Записаться на консультацию
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
      <Footer />
      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white z-10"
            >
              <X size={24} />
            </button>
            
            <img
              src={gallery[currentImageIndex]}
              alt={getProductDisplayName()}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : gallery.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex < gallery.length - 1 ? currentImageIndex + 1 : 0)}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
                >
                  <ArrowLeft size={24} className="rotate-180" />
                </button>
              </>
            )}
            
            {/* Image counter */}
            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} из {gallery.length}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Image Viewer Modal */}
      {isImageViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[90vh] m-4">
            <button
              onClick={() => setIsImageViewerOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
            >
              <X size={20} />
            </button>
            
            <img
              src={gallery[currentImageIndex]}
              alt={getProductDisplayName()}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Image actions */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={shareImage}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
                title="Поделиться"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={downloadImage}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
                title="Скачать оригинал"
              >
                <Save size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}