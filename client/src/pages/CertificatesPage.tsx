import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DownloadableDocuments from '@/components/DownloadableDocuments';

export default function CertificatesPage() {

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