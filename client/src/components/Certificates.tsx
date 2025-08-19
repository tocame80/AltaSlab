import { Download, Award, Shield, Verified, Calendar, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Certificate } from '@shared/schema';

export default function Certificates() {
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

  if (isLoading) {
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
          <div className="animate-pulse">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

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
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Официальные сертификаты
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.slice(0, 6).map((cert) => (
              <div key={cert.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                  {cert.imageUrl ? (
                    <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover rounded-t-xl" />
                  ) : (
                    <Award className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{cert.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{cert.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Выдан: {cert.issueDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{cert.issuer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{cert.size}</span>
                    {cert.fileUrl ? (
                      <a href={cert.fileUrl} download className="bg-[#E95D22] text-white px-3 py-2 rounded-lg hover:bg-[#d54a1a] transition-colors flex items-center gap-2 text-sm">
                        <Download size={14} />
                        Скачать
                      </a>
                    ) : (
                      <button disabled className="bg-gray-300 text-gray-500 px-3 py-2 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm">
                        <Download size={14} />
                        Скачать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Сертификаты загружаются</h3>
            <p className="text-gray-500">Документы будут доступны в ближайшее время</p>
          </div>
        )}

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