import { useState } from 'react';
import { Play, Clock, Eye, ThumbsUp, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { VideoInstruction } from '@shared/schema';
import videoPlaceholder from '@/assets/video-placeholder.svg';

export default function VideoInstructions() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredVideo, setFeaturedVideo] = useState<VideoInstruction | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: videoInstructions = [], isLoading } = useQuery<VideoInstruction[]>({
    queryKey: ['/api/video-instructions'],
  });

  const videoCategories = [
    { id: 'all', name: 'Все видео' },
    { id: 'подготовка', name: 'Подготовка' },
    { id: 'монтаж', name: 'Монтаж' },
    { id: 'уход', name: 'Уход' },
    { id: 'обзоры', name: 'Обзоры' }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? videoInstructions.slice(0, 4) // Show only first 4 videos on homepage
    : videoInstructions.filter(video => video.category === selectedCategory).slice(0, 4);

  // Set first video as featured if none selected
  const currentFeaturedVideo = featuredVideo || filteredVideos[0];

  const getEmbedUrl = (videoUrl: string): string | null => {
    try {
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0` : null;
      }
      
      if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0` : null;
      }
      
      if (videoUrl.includes('rutube.ru/video/')) {
        const videoId = videoUrl.split('/video/')[1]?.split('/')[0];
        return videoId ? `https://rutube.ru/play/embed/${videoId}` : null;
      }
      
      if (videoUrl.includes('vk.com/video')) {
        const videoId = videoUrl.split('video')[1]?.split('?')[0];
        return videoId ? `https://vk.com/video_ext.php?oid=${videoId.split('_')[0]}&id=${videoId.split('_')[1]}&hash=${videoId.split('_')[2] || ''}` : null;
      }
      
      if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        return videoUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return null;
    }
  };

  if (isLoading) {
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
          <div className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-2xl mb-12 max-w-4xl mx-auto"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

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

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {videoCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setIsPlaying(false);
                  setFeaturedVideo(null);
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#E95D22] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Video */}
        {currentFeaturedVideo && (
          <div className="mb-12">
            <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video relative bg-black">
                {isPlaying ? (
                  (() => {
                    const embedUrl = getEmbedUrl(currentFeaturedVideo.videoUrl);
                    
                    if (!embedUrl) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <p className="text-lg mb-2">Неподдерживаемый формат видео</p>
                            <p className="text-sm text-gray-300">URL: {currentFeaturedVideo.videoUrl}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    const isDirectVideo = embedUrl.match(/\.(mp4|webm|ogg)$/i);
                    
                    if (!isDirectVideo) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      );
                    } else {
                      return (
                        <video
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                          poster={currentFeaturedVideo.thumbnailUrl || undefined}
                        >
                          <source src={embedUrl} type="video/mp4" />
                          <source src={embedUrl} type="video/webm" />
                          <source src={embedUrl} type="video/ogg" />
                          Ваш браузер не поддерживает видео HTML5.
                        </video>
                      );
                    }
                  })()
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img 
                      src={currentFeaturedVideo.thumbnailUrl || videoPlaceholder} 
                      alt={currentFeaturedVideo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group hover:scale-110 relative z-10"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                  </div>
                )}
                
                {/* Video overlay info */}
                {!isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {currentFeaturedVideo.title}
                        </h3>
                        <p className="text-gray-200 mb-4 max-w-2xl">
                          {currentFeaturedVideo.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {currentFeaturedVideo.duration}
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => {
                  setFeaturedVideo(video);
                  setIsPlaying(false);
                  if (typeof window !== 'undefined') {
                    document.getElementById('video-instructions')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="relative aspect-video bg-gray-200 flex items-center justify-center group overflow-hidden">
                  {/* Background Image */}
                  <img 
                    src={video.thumbnailUrl || videoPlaceholder} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Play Button */}
                  <div className="relative z-10 w-12 h-12 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group-hover:scale-110">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                  
                  {/* Duration badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
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
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                      {videoCategories.find(cat => cat.id === video.category)?.name || video.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {video.duration}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Play className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет видео в этой категории</h3>
            <p className="text-gray-500">Попробуйте выбрать другую категорию или вернуться ко всем видео</p>
          </div>
        )}

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