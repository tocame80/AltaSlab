import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Download, Award, Shield, Verified, Calendar, MapPin } from 'lucide-react';

export default function CertificatesPage() {
  const certificates = [
    {
      title: 'Сертификат соответствия ГОСТ Р 56926-2016',
      description: 'Подтверждение соответствия продукции требованиям ГОСТ Р для композитных материалов',
      issueDate: '15.03.2024',
      validUntil: '15.03.2027',
      issuer: 'ФБУ "Ростест-Москва"',
      size: '2.1 МБ',
      number: 'РОСС RU.АИ44.Н03421',
      image: '/certificates/gost-cert.jpg'
    },
    {
      title: 'Сертификат пожарной безопасности',
      description: 'Класс пожарной опасности КМ1 (слабогорючие, трудновоспламеняемые материалы)',
      issueDate: '22.01.2024',
      validUntil: '22.01.2029',
      issuer: 'ФГУ ВНИИПО МЧС России',
      size: '1.8 МБ',
      number: 'СПБ.RU.ОП003.Н.03156',
      image: '/certificates/fire-cert.jpg'
    },
    {
      title: 'Экологический сертификат соответствия',
      description: 'Безопасность для здоровья человека, отсутствие вредных выделений',
      issueDate: '10.02.2024',
      validUntil: '10.02.2027',
      issuer: 'ЭкоСтандарт',
      size: '1.5 МБ',
      number: 'ECO.RU.7844.Н04521',
      image: '/certificates/eco-cert.jpg'
    },
    {
      title: 'ISO 9001:2015 Система менеджмента качества',
      description: 'Международная сертификация системы управления качеством производства',
      issueDate: '05.04.2024',
      validUntil: '05.04.2027',
      issuer: 'TÜV NORD CERT GmbH',
      size: '2.3 МБ',
      number: 'ISO-9001-2024-45637',
      image: '/certificates/iso-cert.jpg'
    },
    {
      title: 'Санитарно-эпидемиологическое заключение',
      description: 'Разрешение на применение в жилых и общественных зданиях',
      issueDate: '28.03.2024',
      validUntil: 'Бессрочно',
      issuer: 'Роспотребнадзор',
      size: '1.9 МБ',
      number: '77.01.16.244.П.003891.03.24',
      image: '/certificates/sanitary-cert.jpg'
    },
    {
      title: 'Декларация о соответствии ТР ТС',
      description: 'Соответствие техническим регламентам Таможенного союза',
      issueDate: '12.02.2024',
      validUntil: '12.02.2029',
      issuer: 'ООО "АЛЬТА СЛЭБ"',
      size: '1.2 МБ',
      number: 'ТС Н RU Д-RU.АА44.В.15384',
      image: '/certificates/tr-ts-cert.jpg'
    }
  ];

  const qualityStandards = [
    {
      icon: Shield,
      title: 'Экологическая безопасность',
      description: 'Отсутствие формальдегида и других вредных веществ',
      standard: 'ГОСТ 30255-2014'
    },
    {
      icon: Award,
      title: 'Качество производства',
      description: 'Международные стандарты управления качеством',
      standard: 'ISO 9001:2015'
    },
    {
      icon: Verified,
      title: 'Пожарная безопасность',
      description: 'Класс пожарной опасности КМ1',
      standard: 'ФЗ-123 "Технический регламент"'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Сертификаты и документы
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Наша продукция имеет все необходимые сертификаты качества и безопасности. 
              Мы гарантируем соответствие всем российским и международным стандартам, 
              обеспечивая безопасность и надежность наших SPC панелей.
            </p>
          </div>

          {/* Quality Standards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {qualityStandards.map((standard, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#E95D22] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <standard.icon className="w-8 h-8 text-[#E95D22]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{standard.title}</h3>
                <p className="text-gray-600 mb-4">{standard.description}</p>
                <div className="text-sm text-[#E95D22] font-medium">{standard.standard}</div>
              </div>
            ))}
          </div>

          {/* Certificates Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Официальные сертификаты
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((cert, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                    <Award className="w-20 h-20 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{cert.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{cert.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Выдан: {cert.issueDate}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Действителен до: {cert.validUntil}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{cert.issuer}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Номер сертификата:</div>
                      <div className="text-sm font-mono text-gray-900">{cert.number}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{cert.size}</span>
                      <button className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2">
                        <Download size={16} />
                        Скачать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-[#E95D22] to-[#d54a1a] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Гарантия качества</h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Все представленные сертификаты действительны и подтверждают высочайшее качество 
              нашей продукции. При необходимости мы предоставим оригиналы документов и 
              дополнительную техническую документацию.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}