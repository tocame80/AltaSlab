import { Play, Clock, Eye } from 'lucide-react';
import { Link } from 'wouter';

export default function VideoInstructions() {
  const videos = [
    {
      title: 'Подготовка поверхности перед монтажом',
      duration: '5:42',
      views: '12.5K',
      thumbnail: '/videos/preparation-thumb.jpg',
      description: 'Как правильно подготовить стену или потолок для установки SPC панелей'
    },
    {
      title: 'Монтаж SPC панелей на стену',
      duration: '8:15',
      views: '23.1K',
      thumbnail: '/videos/wall-installation-thumb.jpg',
      description: 'Пошаговая инструкция по установке панелей на вертикальные поверхности'
    },
    {
      title: 'Установка панелей на потолок',
      duration: '6:33',
      views: '8.7K',
      thumbnail: '/videos/ceiling-installation-thumb.jpg',
      description: 'Особенности монтажа SPC панелей на потолочные конструкции'
    },
    {
      title: 'Финишная отделка и уход',
      duration: '4:28',
      views: '15.3K',
      thumbnail: '/videos/finishing-thumb.jpg',
      description: 'Завершающие работы и рекомендации по уходу за панелями'
    }
  ];

  return (
    <section id="video-instructions" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Видеоинструкции
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Наглядные видеоуроки по монтажу SPC панелей АЛЬТА СЛЭБ. 
            Следуйте нашим рекомендациям для качественной установки.
          </p>
        </div>

        {/* Featured Video */}
        <div className="mb-12">
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <button className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-colors group">
                <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Полный курс монтажа SPC панелей АЛЬТА СЛЭБ
              </h3>
              <p className="text-gray-200">Комплексное руководство от А до Я</p>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {videos.map((video, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
                <button className="w-12 h-12 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-colors">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock size={10} />
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Eye size={12} className="mr-1" />
                  {video.views} просмотров
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/video">
            <button className="bg-[#E95D22] text-white px-8 py-3 rounded-lg hover:bg-[#d54a1a] transition-colors">
              Посмотреть все видео
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}