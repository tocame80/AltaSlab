import { Download, Award, Shield, Verified } from 'lucide-react';
import { Link } from 'wouter';

export default function Certificates() {
  const certificates = [
    {
      title: 'Сертификат соответствия ГОСТ',
      description: 'Подтверждение соответствия продукции требованиям ГОСТ Р',
      size: '2.1 МБ',
      image: '/certificates/gost-cert.jpg'
    },
    {
      title: 'Сертификат пожарной безопасности',
      description: 'Класс пожарной опасности материалов',
      size: '1.8 МБ',
      image: '/certificates/fire-cert.jpg'
    },
    {
      title: 'Экологический сертификат',
      description: 'Безопасность для здоровья человека',
      size: '1.5 МБ',
      image: '/certificates/eco-cert.jpg'
    },
    {
      title: 'ISO 9001:2015',
      description: 'Система менеджмента качества',
      size: '2.3 МБ',
      image: '/certificates/iso-cert.jpg'
    }
  ];

  return (
    <section id="certificates" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Сертификаты и качество
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Наша продукция имеет все необходимые сертификаты качества и безопасности. 
            Мы гарантируем соответствие всем российским и международным стандартам.
          </p>
        </div>

        {/* Quality Badges */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Безопасность</h3>
            <p className="text-gray-600">Экологически чистые материалы, безопасные для здоровья</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Качество</h3>
            <p className="text-gray-600">Соответствие ГОСТ и международным стандартам</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Verified className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Сертификация</h3>
            <p className="text-gray-600">Официальные документы и разрешения</p>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {certificates.map((cert, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <Award className="w-16 h-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{cert.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{cert.size}</span>
                  <button className="text-[#E95D22] hover:text-[#d54a1a] transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/certificates">
            <button className="bg-[#E95D22] text-white px-8 py-3 rounded-lg hover:bg-[#d54a1a] transition-colors">
              Посмотреть все сертификаты
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}