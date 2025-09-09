import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Verified, Award } from 'lucide-react';
import DownloadableDocuments from '@/components/DownloadableDocuments';

export default function CertificatesPage() {

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
                <div className="w-16 h-16 bg-[#e90039] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                  <standard.icon className="w-8 h-8 text-[#e90039]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{standard.title}</h3>
                <p className="text-gray-600 mb-4">{standard.description}</p>
                <div className="text-sm text-[#e90039] font-medium">{standard.standard}</div>
              </div>
            ))}
          </div>

          {/* Certificates */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Официальные сертификаты
            </h2>
            <DownloadableDocuments 
              title="Сертификаты и документы качества"
              showInstallationDocs={false}
              showCertificates={true}
            />
          </div>

          {/* Installation Instructions and Documents */}
          <div className="mb-16">
            <DownloadableDocuments 
              title="Инструкции по монтажу и дополнительные документы"
              showInstallationDocs={true}
              showCertificates={false}
            />
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-[#e90039] to-[#c8002f] rounded-2xl p-8 text-white text-center">
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