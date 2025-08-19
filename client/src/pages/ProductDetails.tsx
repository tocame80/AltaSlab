import { useState, useContext } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Heart, ShoppingCart, Calculator, Download, Share2, Eye, Maximize2, CheckCircle, Clock, Truck, Star, Mail, Search } from 'lucide-react';
import { products } from '@/data/products';
import { FavoritesContext } from '@/contexts/FavoritesContext';
import { Collection } from '@/types';

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

  const collections = [
    { key: 'all' as Collection, label: 'ВСЁ', color: 'bg-gray-400' },
    { key: 'concrete' as Collection, label: 'МАГИЯ БЕТОНА', color: 'bg-gray-600' },
    { key: 'fabric' as Collection, label: 'ТКАНЕВАЯ РОСКОШЬ', color: 'bg-purple-500' },
    { key: 'matte' as Collection, label: 'МАТОВАЯ ЭСТЕТИКА', color: 'bg-green-500' },
    { key: 'marble' as Collection, label: 'МРАМОРНАЯ ФЕЕРИЯ', color: 'bg-blue-500' },
    { key: 'accessories' as Collection, label: 'КОМПЛЕКТУЮЩИЕ', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#E95D22] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">АС</span>
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-xl">АЛЬТА СЛЭБ</h1>
                <p className="text-gray-500 text-xs">SPC ПАНЕЛИ</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/#catalog" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">КАТАЛОГ</a>
              <a href="/#portfolio" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">ПОРТФОЛИО</a>
              <a href="/#services" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">УСЛУГИ</a>
              <a href="/#material" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">О МАТЕРИАЛЕ</a>
              <a href="/#company" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">О КОМПАНИИ</a>
              <a href="/#delivery" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">ДОСТАВКА</a>
            </nav>

            {/* Contact Info */}
            <div className="hidden md:flex items-center space-x-4">
              <Mail className="text-gray-500 w-5 h-5" />
              <Search className="text-gray-500 w-5 h-5" />
              <span className="text-[#E95D22] font-semibold">8 800 555-77-73</span>
            </div>
          </div>
        </div>
      </header>

      {/* Collections Navigation with Colors */}
      <div className="bg-white py-6 border-t">
        <div className="container mx-auto px-6">
          <nav className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
            {collections.map((collection) => (
              <a
                key={collection.key}
                href={`/#catalog`}
                className="flex items-center gap-2 text-gray-700 hover:text-[#E95D22] font-medium transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${collection.color}`}></div>
                {collection.label}
              </a>
            ))}
            <a
              href="/#catalog"
              className="flex items-center gap-2 text-gray-700 hover:text-[#E95D22] font-medium transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              ИЗБРАННОЕ
            </a>
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-[#E95D22]">Главная</a>
            <span>/</span>
            <a href="/#catalog" className="hover:text-[#E95D22]">Каталог</a>
            <span>/</span>
            <span className="text-gray-900">{getCollectionDisplayName()}</span>
            <span>/</span>
            <span className="text-gray-900">{getProductDisplayName()}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#E95D22] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Вернуться в каталог
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square">
                <img
                  src={gallery[currentImageIndex]}
                  alt={getProductDisplayName()}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all">
                  <Maximize2 size={16} />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all">
                  <Eye size={16} />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all">
                  <Share2 size={16} />
                </button>
              </div>

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isPremium && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-semibold rounded-full">
                    ПРЕМИУМ
                  </span>
                )}
                {availability.inStock ? (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    В НАЛИЧИИ
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    ПОД ЗАКАЗ
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {getCollectionDisplayName()}
                </span>
                <span className="text-sm text-gray-400 font-mono">
                  Артикул: {product.barcode}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {getProductDisplayName()}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(47 отзывов)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 'за шт.' : 'за упак.'}
                  </div>
                </div>
                {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                  <div className="text-right">
                    <div className="text-xl font-semibold text-gray-700">
                      {Math.round(product.price / product.areaPerPackage).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-gray-500">за м²</div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Количество:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x border-gray-300 py-2"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Итого: {(product.price * quantity).toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button className="flex-1 bg-[#E95D22] text-white py-3 px-6 rounded-lg font-semibold transition-all hover:bg-[#d54a1a] flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Добавить в корзину
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isFavorite 
                      ? 'border-red-500 text-red-500 bg-red-50' 
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all hover:bg-gray-200 flex items-center justify-center gap-2">
                  <Calculator size={16} />
                  Калькулятор
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all hover:bg-gray-200 flex items-center justify-center gap-2">
                  <Download size={16} />
                  Документы
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Truck size={20} className="text-gray-500" />
                <div>
                  <div className="font-semibold text-gray-900">Доставка: {availability.deliveryTime}</div>
                  <div className="text-sm text-gray-600">
                    {availability.inStock ? 'Товар в наличии' : 'Изготовление под заказ'}
                  </div>
                </div>
              </div>
              {availability.inStock && availability.quantity && (
                <div className="text-sm text-gray-600">
                  Остаток на складе: {availability.quantity}+ шт
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Технические характеристики</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Формат</span>
                  <span className="font-medium text-gray-900">{product.format}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Упаковка</span>
                  <span className="font-medium text-gray-900">
                    {product.collection === 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' ? 
                      `${product.piecesPerPackage} шт` :
                      `${product.areaPerPackage}м² (${product.piecesPerPackage}шт)`
                    }
                  </span>
                </div>
                {product.collection !== 'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ' && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Площадь одной панели</span>
                      <span className="font-medium text-gray-900">{product.areaPerPiece} м²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Площадь упаковки</span>
                      <span className="font-medium text-gray-900">{product.areaPerPackage} м²</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Цвет</span>
                  <span className="font-medium text-gray-900">{product.color}</span>
                </div>
                {product.specifications && (
                  <>
                    {product.specifications.thickness && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Толщина</span>
                        <span className="font-medium text-gray-900">{product.specifications.thickness}</span>
                      </div>
                    )}
                    {product.specifications.weight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Вес</span>
                        <span className="font-medium text-gray-900">{product.specifications.weight}</span>
                      </div>
                    )}
                    {product.specifications.wearClass && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Класс износостойкости</span>
                        <span className="font-medium text-gray-900">{product.specifications.wearClass}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Описание' },
                { id: 'specifications', label: 'Характеристики' },
                { id: 'installation', label: 'Монтаж' },
                { id: 'reviews', label: 'Отзывы (47)' }
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
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Основные характеристики</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Материал</span>
                      <span className="font-medium text-gray-900">SPC (Stone Plastic Composite)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Назначение</span>
                      <span className="font-medium text-gray-900">Стены, потолки</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Тип монтажа</span>
                      <span className="font-medium text-gray-900">Клеевой</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Страна производства</span>
                      <span className="font-medium text-gray-900">Россия</span>
                    </div>
                  </div>
                </div>
                
                {product.specifications && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Технические параметры</h4>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 capitalize">
                            {key === 'thickness' && 'Толщина'}
                            {key === 'weight' && 'Вес'}
                            {key === 'fireResistance' && 'Пожарная безопасность'}
                            {key === 'waterResistance' && 'Влагостойкость'}
                            {key === 'wearClass' && 'Класс износостойкости'}
                            {key === 'installation' && 'Монтаж'}
                          </span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="prose max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Инструкция по монтажу</h4>
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
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Отзывы покупателей</h4>
                  <button className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors">
                    Написать отзыв
                  </button>
                </div>
                
                <div className="grid gap-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                          <div>
                            <div className="font-semibold text-gray-900">Покупатель {review}</div>
                            <div className="text-sm text-gray-500">15 дней назад</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={`${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Отличное качество панелей! Легко монтируются, выглядят очень стильно. Рекомендую!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}