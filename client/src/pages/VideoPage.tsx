import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Clock, Eye, ThumbsUp, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { VideoInstruction } from '@shared/schema';

export default function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: videoInstructions = [], isLoading } = useQuery<VideoInstruction[]>({
    queryKey: ['/api/video-instructions'],
  });

  const videoCategories = [
    { id: 'all', name: 'Все видео' },
    { id: 'installation', name: 'Монтаж' },
    { id: 'preparation', name: 'Подготовка' },
    { id: 'care', name: 'Уход' },
    { id: 'review', name: 'Обзоры' }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? videoInstructions 
    : videoInstructions.filter(video => video.category === selectedCategory);

  const featuredVideo = filteredVideos[0];

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
          {featuredVideo ? (
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
                            Просмотры
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp size={14} />
                            Рекомендуем
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
          ) : (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Рекомендуемое видео</h2>
              <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Видеоинструкции пока не добавлены</p>
                    <p className="text-gray-400 text-sm mt-2">Используйте админ панель для добавления видео</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {videoCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
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
          {filteredVideos.length > 0 ? (
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
                        Видео
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        {video.category}
                      </div>
                    </div>
                    <span>{video.duration}</span>
                  </div>

                  <button className="w-full bg-gray-100 hover:bg-[#E95D22] hover:text-white text-gray-700 py-2 rounded-lg transition-colors font-medium">
                    Смотреть видео
                  </button>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Видео не найдено</h3>
              <p className="text-gray-500">В выбранной категории пока нет видеоинструкций</p>
            </div>
          )}

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