import { useState } from 'react';
import { ArrowLeft, Play, Clock, Eye, ThumbsUp, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { VideoInstruction } from '@shared/schema';
import videoPlaceholder from '@/assets/video-placeholder.svg';

export default function VideoInstructionsPage() {
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
    ? videoInstructions 
    : videoInstructions.filter(video => video.category === selectedCategory);

  // Set first video as featured if none selected
  const currentFeaturedVideo = featuredVideo || filteredVideos[0];

  const getEmbedUrl = (videoUrl: string) => {
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-[#E95D22] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">АС</span>
                </div>
                <div>
                  <h1 className="text-gray-900 font-bold text-xl">АЛЬТА СЛЭБ</h1>
                  <p className="text-gray-500 text-xs">SPC ПАНЕЛИ</p>
                </div>
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <a href="/catalog" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">КАТАЛОГ</a>
                <a href="/calculator" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">КАЛЬКУЛЯТОР</a>
                <a href="/certificates" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">СЕРТИФИКАТЫ</a>
                <a href="/video-instructions" className="text-[#E95D22] font-medium transition-colors">ВИДЕО</a>
                <a href="/faq" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">ВОПРОСЫ</a>
                <a href="/about" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">О НАС</a>
              </nav>

              {/* Contact Info */}
              <div className="hidden md:flex items-center space-x-4">
                <a href="/contact" className="text-gray-500 hover:text-[#E95D22] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
                <span className="text-[#E95D22] font-semibold">8 800 555-77-73</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-[#E95D22] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">АС</span>
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-xl">АЛЬТА СЛЭБ</h1>
                <p className="text-gray-500 text-xs">SPC ПАНЕЛИ</p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/catalog" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">КАТАЛОГ</a>
              <a href="/calculator" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">КАЛЬКУЛЯТОР</a>
              <a href="/certificates" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">СЕРТИФИКАТЫ</a>
              <a href="/video-instructions" className="text-[#E95D22] font-medium transition-colors">ВИДЕО</a>
              <a href="/faq" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">ВОПРОСЫ</a>
              <a href="/about" className="text-gray-700 hover:text-[#E95D22] font-medium transition-colors">О НАС</a>
            </nav>

            {/* Contact Info */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="/contact" className="text-gray-500 hover:text-[#E95D22] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <span className="text-[#E95D22] font-semibold">8 800 555-77-73</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#E95D22] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Вернуться назад
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Видео инструкции</h1>
          <p className="text-gray-600">Подробные видеоуроки по монтажу и уходу за SPC панелями АЛЬТА СЛЭБ</p>
        </div>

        {/* Featured Video Section */}
        {currentFeaturedVideo && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-video relative bg-black">
                {isPlaying ? (
                  (() => {
                    const embedUrl = getEmbedUrl(currentFeaturedVideo.videoUrl);
                    const isDirectVideo = embedUrl && embedUrl.match(/\.(mp4|webm|ogg)$/i);
                    
                    if (embedUrl && !isDirectVideo) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      );
                    } else if (embedUrl && isDirectVideo) {
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
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <p className="text-lg mb-2">Неподдерживаемый формат видео</p>
                            <p className="text-sm text-gray-300">URL: {currentFeaturedVideo.videoUrl}</p>
                          </div>
                        </div>
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
                      className="w-24 h-24 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group hover:scale-110 relative z-10"
                    >
                      <Play className="w-10 h-10 text-white ml-1" />
                    </button>
                  </div>
                )}
                
                {/* Video overlay info */}
                {!isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
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

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
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

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                className="w-full text-left"
                onClick={() => {
                  setFeaturedVideo(video);
                  setIsPlaying(false);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <div className="relative z-10 w-16 h-16 bg-[#E95D22] rounded-full flex items-center justify-center hover:bg-[#d54a1a] transition-all group-hover:scale-110">
                    <Play className="w-6 h-6 text-white ml-1" />
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
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
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
      </div>
    </div>
  );
}