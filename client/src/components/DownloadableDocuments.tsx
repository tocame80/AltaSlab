import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Award } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  issueDate: string;
  validUntil: string;
  issuer: string;
  size: string;
  number: string;
  imageUrl?: string;
  fileUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface DownloadableDocumentsProps {
  title?: string;
  showInstallationDocs?: boolean;
  showCertificates?: boolean;
}

export default function DownloadableDocuments({ 
  title = "Дополнительные материалы для скачивания",
  showInstallationDocs = true,
  showCertificates = true 
}: DownloadableDocumentsProps) {
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ['/api/certificates'],
    queryFn: async () => {
      const response = await fetch('/api/certificates');
      if (!response.ok) throw new Error('Failed to fetch certificates');
      return response.json();
    },
  });

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      alert('Файл недоступен для скачивания');
      return;
    }
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Installation documents (static for now, could be moved to admin later)
  const installationDocs = showInstallationDocs ? [
    {
      id: 'installation-guide',
      title: 'Подробная инструкция по монтажу',
      size: 'PDF, 2.4 МБ',
      fileUrl: '/docs/installation-guide.pdf'
    },
    {
      id: 'layout-schemes',
      title: 'Схемы раскладки панелей',
      size: 'PDF, 1.8 МБ',
      fileUrl: '/docs/layout-schemes.pdf'
    },
    {
      id: 'care-recommendations',
      title: 'Рекомендации по уходу',
      size: 'PDF, 850 КБ',
      fileUrl: '/docs/care-recommendations.pdf'
    },
    {
      id: 'warranty-conditions',
      title: 'Гарантийные условия',
      size: 'PDF, 650 КБ',
      fileUrl: '/docs/warranty-conditions.pdf'
    }
  ] : [];

  // Sort certificates by sortOrder
  const sortedCertificates = [...certificates].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const allDocuments = [
    ...installationDocs.map(doc => ({ ...doc, type: 'installation' })),
    ...(showCertificates ? sortedCertificates.map(cert => ({ 
      ...cert, 
      type: 'certificate',
      size: cert.size || 'PDF'
    })) : [])
  ];

  if (certificatesLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">{title}</h5>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e90039]"></div>
        </div>
      </div>
    );
  }

  if (allDocuments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">{title}</h5>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Документы пока не загружены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h5 className="font-semibold text-gray-900 mb-4">{title}</h5>
      <div className="grid md:grid-cols-2 gap-4">
        {allDocuments.map((doc) => (
          <div 
            key={doc.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#e90039] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {doc.type === 'certificate' ? (
                    <Award className="w-4 h-4 text-[#e90039]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#e90039]" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {doc.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {doc.type === 'certificate' && doc.description ? (
                      <div>
                        <div>{doc.size}</div>
                        <div className="text-xs mt-1">{doc.description}</div>
                        {doc.validUntil && (
                          <div className="text-xs text-gray-500">
                            Действует до: {new Date(doc.validUntil).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    ) : (
                      doc.size
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(doc.fileUrl || '', doc.title)}
                className="text-[#e90039] hover:text-[#c8002f] transition-colors p-2 hover:bg-gray-50 rounded-full"
                title={`Скачать ${doc.title}`}
                data-testid={`button-download-${doc.id}`}
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}