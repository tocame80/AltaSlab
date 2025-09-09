import { Link } from 'wouter';
import DownloadableDocuments from '@/components/DownloadableDocuments';

export default function Certificates() {
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

        {/* Certificates */}
        <DownloadableDocuments 
          title="Сертификаты и документы качества"
          showInstallationDocs={false}
          showCertificates={true}
        />

        <div className="text-center mt-8">
          <Link href="/certificates">
            <a className="inline-flex items-center bg-[#e90039] text-white px-8 py-3 rounded-lg hover:bg-[#c8002f] transition-colors">
              Все сертификаты
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}