import { ArrowLeft, Play } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/Header';

export default function VideoInstructions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            Вернуться к каталогу
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Видеоинструкции</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Обучающие видео по монтажу, обзоры коллекций и примеры применения панелей АЛЬТА СЛЭБ
          </p>
        </div>

        {/* Video Sections */}
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Installation Videos */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Инструкции по монтажу</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={32} className="text-white ml-1" />
                    </div>
                    <div className="text-gray-600">Видео недоступно в демо-режиме</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Подготовка поверхности и разметка</h3>
                  <p className="text-gray-600 mb-3">Пошаговая инструкция по подготовке стены к монтажу панелей</p>
                  <div className="text-sm text-gray-500">Продолжительность: 8:30</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={32} className="text-white ml-1" />
                    </div>
                    <div className="text-gray-600">Видео недоступно в демо-режиме</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Техника нанесения клея и укладки</h3>
                  <p className="text-gray-600 mb-3">Правильные приемы работы с клеем и монтажа панелей</p>
                  <div className="text-sm text-gray-500">Продолжительность: 12:15</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={32} className="text-white ml-1" />
                    </div>
                    <div className="text-gray-600">Видео недоступно в демо-режиме</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Обработка углов и стыков</h3>
                  <p className="text-gray-600 mb-3">Профессиональные секреты аккуратной обработки углов</p>
                  <div className="text-sm text-gray-500">Продолжительность: 6:45</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={32} className="text-white ml-1" />
                    </div>
                    <div className="text-gray-600">Видео недоступно в демо-режиме</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Финишная обработка и уход</h3>
                  <p className="text-gray-600 mb-3">Завершающие этапы монтажа и рекомендации по уходу</p>
                  <div className="text-sm text-gray-500">Продолжительность: 5:20</div>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Reviews */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Обзоры коллекций</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Коллекция "Магия Бетона"</h3>
                  <div className="text-sm text-gray-500">6:45</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Коллекция "Мраморная Феерия"</h3>
                  <div className="text-sm text-gray-500">8:20</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Коллекция "Тканевая Роскошь"</h3>
                  <div className="text-sm text-gray-500">7:15</div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Examples */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Примеры применения в интерьерах</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Современная гостиная</h3>
                  <div className="text-sm text-gray-500">4:30</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Офисные интерьеры</h3>
                  <div className="text-sm text-gray-500">7:15</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ванная и кухня</h3>
                  <div className="text-sm text-gray-500">5:50</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Спальня и детская</h3>
                  <div className="text-sm text-gray-500">6:20</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Коммерческие помещения</h3>
                  <div className="text-sm text-gray-500">9:10</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-[#d54a1a] transition-colors cursor-pointer">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                    <div className="text-sm text-gray-600">Видео недоступно</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Загородный дом</h3>
                  <div className="text-sm text-gray-500">8:45</div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <div className="font-semibold text-blue-900 mb-2">Профессиональные советы</div>
                <div className="text-blue-800 space-y-2">
                  <div>• Перед началом работ обязательно просмотрите все обучающие видео</div>
                  <div>• Видеоинструкции регулярно обновляются с учетом новых технологий</div>
                  <div>• Для получения сертификата монтажника пройдите наш обучающий курс</div>
                  <div>• Если у вас остались вопросы после просмотра - обращайтесь к техподдержке</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}