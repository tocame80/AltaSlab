import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Clock, Eye, ThumbsUp, Share2 } from 'lucide-react';
import { useState } from 'react';

export default function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState(0);

  const videoCategories = [
    { id: 'all', name: 'Все видео' },
    { id: 'installation', name: 'Монтаж' },
    { id: 'preparation', name: 'Подготовка' },
    { id: 'care', name: 'Уход' },
    { id: 'review', name: 'Обзоры' }
  ];

  const videos = [
    {
      id: 1,
      category: 'installation',
      title: 'Полный курс монтажа SPC панелей АЛЬТА СЛЭБ',
      description: 'Комплексное руководство по установке SPC панелей от подготовки поверхности до финишной отделки. Подходит для начинающих и профессионалов.',
      duration: '24:15',
      views: '45.2K',
      likes: '1.2K',
      uploadDate: '2024-01-15',
      thumbnail: '/videos/full-course-thumb.jpg',
      featured: true
    },
    {
      id: 2,
      category: 'preparation',
      title: 'Подготовка поверхности перед монтажом',
      description: 'Как правильно подготовить стену или потолок для установки SPC панелей. Инструменты, материалы и пошаговый процесс.',
      duration: '5:42',
      views: '12.5K',
      likes: '324',
      uploadDate: '2024-01-10',
      thumbnail: '/videos/preparation-thumb.jpg'
    },
    {
      id: 3,
      category: 'installation',
      title: 'Монтаж SPC панелей на стену',
      description: 'Пошаговая инструкция по установке панелей на вертикальные поверхности с демонстрацией различных техник.',
      duration: '8:15',
      views: '23.1K',
      likes: '567',
      uploadDate: '2024-01-12',
      thumbnail: '/videos/wall-installation-thumb.jpg'
    },
    {
      id: 4,
      category: 'installation',
      title: 'Установка панелей на потолок',
      description: 'Особенности монтажа SPC панелей на потолочные конструкции. Крепление, выравнивание и финишная отделка.',
      duration: '6:33',
      views: '8.7K',
      likes: '198',
      uploadDate: '2024-01-14',
      thumbnail: '/videos/ceiling-installation-thumb.jpg'
    },
    {
      id: 5,
      category: 'installation',
      title: 'Монтаж в углах и сложных местах',
      description: 'Работа с внутренними и внешними углами, обход труб и других препятствий.',
      duration: '7:28',
      views: '15.3K',
      likes: '412',
      uploadDate: '2024-01-16',
      thumbnail: '/videos/corners-thumb.jpg'
    },
    {
      id: 6,
      category: 'care',
      title: 'Уход и эксплуатация SPC панелей',
      description: 'Рекомендации по уходу за панелями, средства для очистки и продления срока службы.',
      duration: '4:28',
      views: '9.8K',
      likes: '287',
      uploadDate: '2024-01-18',
      thumbnail: '/videos/care-thumb.jpg'
    },
    {
      id: 7,
      category: 'review',
      title: 'Обзор коллекции "Магия Бетона"',
      description: 'Детальный обзор дизайнов и характеристик коллекции с демонстрацией в интерьере.',
      duration: '6:15',
      views: '18.6K',
      likes: '523',
      uploadDate: '2024-01-20',
      thumbnail: '/videos/concrete-review-thumb.jpg'
    },
    {
      id: 8,
      category: 'review',
      title: 'Сравнение с другими материалами',
      description: 'Сравнительный анализ SPC панелей с керамической плиткой, обоями и другими отделочными материалами.',
      duration: '9:42',
      views: '31.4K',
      likes: '892',
      uploadDate: '2024-01-22',
      thumbnail: '/videos/comparison-thumb.jpg'
    }
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredVideos = videos.filter(video => 
    activeCategory === 'all' || video.category === activeCategory
  );

  const featuredVideo = videos.find(video => video.featured) || videos[0];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Видеоинструкции
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Наглядные видеоуроки по монтажу SPC панелей АЛЬТА СЛЭБ. 
              Изучайте профессиональные техники установки и следуйте нашим 
              рекомендациям для качественного результата.
            </p>
          </div>

          {/* Featured Video */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Рекомендуемое видео</h2>
            <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <button className="w-24 h-24 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group hover:scale-110">
                  <Play className="w-10 h-10 text-white ml-1" />
                </button>
                
                {/* Video overlay info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {featuredVideo.title}
                      </h3>
                      <p className="text-gray-200 mb-4 max-w-2xl">
                        {featuredVideo.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {featuredVideo.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          {featuredVideo.views} просмотров
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {featuredVideo.likes}
                        </div>
                      </div>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-colors">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {videoCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-[#E95D22] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVideos.map((video, index) => (
              <div key={video.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="relative aspect-video bg-gray-200 flex items-center justify-center group cursor-pointer">
                  <button 
                    className="w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group-hover:scale-110"
                    onClick={() => setSelectedVideo(index)}
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </button>
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={10} />
                    {video.duration}
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        {video.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        {video.likes}
                      </div>
                    </div>
                    <span>{video.uploadDate}</span>
                  </div>

                  <button className="w-full bg-gray-100 hover:bg-[#E95D22] hover:text-white text-gray-700 py-2 rounded-lg transition-colors font-medium">
                    Смотреть видео
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe Section */}
          <div className="mt-16 bg-gradient-to-r from-[#E95D22] to-[#d54a1a] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Подпишитесь на наш канал</h2>
            <p className="text-lg opacity-90 mb-6">
              Получайте уведомления о новых видеоинструкциях и обучающих материалах
            </p>
            <button className="bg-white text-[#E95D22] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Подписаться на YouTube
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}