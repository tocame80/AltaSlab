import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'wouter';

export default function Certificates() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Сертификаты и документы</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Документы качества, международные сертификации и гарантийные материалы АЛЬТА СЛЭБ
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Quality Documents */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Документы качества</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">Сертификат соответствия ГОСТ</div>
                    <div className="text-sm text-gray-600 mb-2">Действителен до: 15.06.2025</div>
                    <div className="text-sm text-gray-500">Подтверждает соответствие продукции требованиям ГОСТ Р</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">Декларация соответствия ТР ТС</div>
                    <div className="text-sm text-gray-600 mb-2">Действительна до: 22.08.2025</div>
                    <div className="text-sm text-gray-500">Соответствие техническим регламентам Таможенного союза</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* International Certificates */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Международные сертификаты</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">ISO 14001 (Экологический менеджмент)</div>
                    <div className="text-sm text-gray-600 mb-2">Международный стандарт</div>
                    <div className="text-sm text-gray-500">Система экологического менеджмента</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">CE Marking</div>
                    <div className="text-sm text-gray-600 mb-2">Европейское соответствие</div>
                    <div className="text-sm text-gray-500">Соответствие европейским стандартам безопасности</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fire Safety & Warranty */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Пожарная безопасность</h2>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">Сертификат пожарной безопасности</div>
                    <div className="text-sm text-gray-600 mb-2">Класс КМ2 по НПБ 244-97</div>
                    <div className="text-sm text-gray-500">Подтверждает соответствие требованиям пожарной безопасности</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Гарантия</h2>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">Гарантийный талон</div>
                    <div className="text-sm text-gray-600 mb-2">Гарантия 15 лет от производителя</div>
                    <div className="text-sm text-gray-500">Официальная гарантия на всю продукцию АЛЬТА СЛЭБ</div>
                  </div>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors ml-4">
                    <Download size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <div className="font-semibold text-blue-900 mb-2">Важная информация</div>
                <div className="text-blue-800 space-y-2">
                  <div>• Все сертификаты и документы регулярно обновляются в соответствии с изменениями в законодательстве</div>
                  <div>• При необходимости предоставляем оригиналы документов для проверки</div>
                  <div>• Гарантийные обязательства действуют только при соблюдении технологии монтажа</div>
                  <div>• Для получения дополнительных документов обращайтесь к менеджерам</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}