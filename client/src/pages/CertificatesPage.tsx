import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Download, Award, Shield, Verified, Calendar, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Certificate } from '@shared/schema';

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
  });

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
            {isLoading ? (
              <div className="text-center">Загрузка сертификатов...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                      {cert.imageUrl ? (
                        <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover rounded-t-xl" />
                      ) : (
                        <Award className="w-20 h-20 text-gray-400" />
                      )}
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
                        {cert.fileUrl ? (
                          <a href={cert.fileUrl} download className="bg-[#E95D22] text-white px-4 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Скачать
                          </a>
                        ) : (
                          <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-2">
                            <Download size={16} />
                            Скачать
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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