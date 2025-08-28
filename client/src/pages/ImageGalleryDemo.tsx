import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GalleryImageGrid from '@/components/GalleryImageGrid';
import { Upload, Image as ImageIcon, Download, Settings, Info } from 'lucide-react';

export default function ImageGalleryDemo() {
  const [selectedDemo, setSelectedDemo] = useState<'products' | 'projects' | 'materials'>('products');
  
  // Demo image sets
  const demoImages = {
    products: [
      '/api/public/products/concrete/8894/main.jpg',
      '/api/public/products/concrete/8895/main.jpg',
      '/api/public/products/concrete/8896/main.jpg',
      '/api/public/products/concrete/8930/main.jpg',
      '/api/public/products/concrete/8934/main.jpg',
      '/api/public/products/concrete/8937/main.jpg',
      '/api/public/products/fabric/8900/main.jpg',
      '/api/public/products/fabric/8901/main.jpg',
      '/api/public/products/fabric/8902/main.jpg',
      '/api/public/products/fabric/8903/main.jpg'
    ],
    projects: [
      '/api/public/hero/hero-1.jpg',
      '/api/public/hero/hero-2.jpg',
      '/api/public/hero/hero-3.jpg',
      '/api/public/hero/hero-4.jpg',
      '/api/public/hero/hero-5.jpg'
    ],
    materials: [
      '/api/public/certificates/certificate-1.jpg',
      '/api/public/certificates/certificate-2.jpg',
      '/api/public/certificates/certificate-3.jpg'
    ]
  };

  const demoTabs = [
    { 
      id: 'products' as const, 
      label: 'Каталог продукции', 
      icon: ImageIcon,
      description: 'Изображения продуктов с высоким разрешением'
    },
    { 
      id: 'projects' as const, 
      label: 'Проекты и интерьеры', 
      icon: Settings,
      description: 'Фотографии реализованных проектов'
    },
    { 
      id: 'materials' as const, 
      label: 'Документы и сертификаты', 
      icon: Download,
      description: 'Сертификаты качества и техническая документация'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gray-50 pt-20">
        <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#2f378b] mb-4">
              СОВРЕМЕННАЯ ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ
            </h1>
            <p className="text-secondary text-lg max-w-3xl">
              Демонстрация оптимизированной галереи с динамической генерацией миниатюр, 
              ленивой загрузкой и продвинутыми возможностями навигации
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Canvas оптимизация</h3>
              <p className="text-sm text-gray-600">Высококачественное изменение размера с прогрессивным сэмплингом</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Settings className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Управление памятью</h3>
              <p className="text-sm text-gray-600">Кэш до 100 изображений с автоматической очисткой</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Пакетная обработка</h3>
              <p className="text-sm text-gray-600">Обработка 3-5 изображений за раз с RequestAnimationFrame</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Info className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Доступность</h3>
              <p className="text-sm text-gray-600">ARIA метки, табуляция, фокус-менеджмент</p>
            </div>
          </div>

          {/* Demo Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {demoTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDemo(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedDemo === tab.id
                      ? 'bg-[#e90039] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  data-testid={`button-demo-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Current tab description */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                {demoTabs.find(tab => tab.id === selectedDemo)?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Demo */}
      <div className="bg-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <GalleryImageGrid
            images={demoImages[selectedDemo]}
            title={`Демонстрация: ${demoTabs.find(tab => tab.id === selectedDemo)?.label}`}
          />
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#2f378b] mb-6">Технические детали</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Canvas оптимизация</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <code>imageSmoothingQuality = 'high'</code> для лучшего качества</li>
                  <li>• Прогрессивное даунсэмплирование для больших изображений</li>
                  <li>• <code>willReadFrequently: true</code> для оптимизации getContext</li>
                  <li>• Двухэтапное изменение размера для изображений &gt;4x</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление памятью</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Лимит кэша до 50-100 изображений</li>
                  <li>• WeakMap для автоматической очистки</li>
                  <li>• Освобождение Canvas контекстов после использования</li>
                  <li>• LRU стратегия вытеснения старых записей</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Производительность</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Пакетная обработка 3-5 изображений</li>
                  <li>• RequestAnimationFrame для плавных анимаций</li>
                  <li>• Дебаунс для событий ресайза (300мс)</li>
                  <li>• Intersection Observer для ленивой загрузки</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Кроссбраузерность</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Fallback для браузеров без Intersection Observer</li>
                  <li>• Полифилл для старых версий Canvas API</li>
                  <li>• Graceful degradation для мобильных браузеров</li>
                  <li>• Поддержка различных форматов изображений</li>
                </ul>
              </div>
            </div>
            
            {/* Usage Instructions */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Инструкции по использованию</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <h4 className="font-medium mb-2">Навигация:</h4>
                  <ul className="space-y-1">
                    <li>• Клик по изображению - открыть превью</li>
                    <li>• ESC - закрыть превью</li>
                    <li>• ← → стрелки - переключение изображений</li>
                    <li>• Клик вне изображения - закрыть</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Функции:</h4>
                  <ul className="space-y-1">
                    <li>• Поиск по названию изображения</li>
                    <li>• Сортировка по разным критериям</li>
                    <li>• Переключение между сеткой и списком</li>
                    <li>• Скачивание оригинальных файлов</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}