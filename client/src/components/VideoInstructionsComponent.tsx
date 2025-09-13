import { useQuery } from '@tanstack/react-query';
import { Play, Clock, Tag, X } from 'lucide-react';
import { useState } from 'react';

interface VideoInstruction {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface VideoInstructionsProps {
  title?: string;
  showByCategory?: boolean;
}

export default function VideoInstructionsComponent({ 
  title = "Видео инструкции",
  showByCategory = true 
}: VideoInstructionsProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoInstruction | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/video-instructions'],
    queryFn: async () => {
      const response = await fetch('/api/video-instructions');
      if (!response.ok) throw new Error('Failed to fetch video instructions');
      return response.json();
    },
  });

  // Sort videos by sortOrder
  const sortedVideos = [...videos].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Group videos by category if needed
  const categorizedVideos: Record<string, VideoInstruction[]> = showByCategory 
    ? sortedVideos.reduce((acc: Record<string, VideoInstruction[]>, video) => {
        const category = video.category || 'Общие';
        if (!acc[category]) acc[category] = [];
        acc[category].push(video);
        return acc;
      }, {})
    : { 'Все видео': sortedVideos };

  // Function to detect video service type
  const getVideoServiceType = (videoUrl: string): 'rutube' | 'youtube' | 'vk' | 'direct' | 'other' => {
    if (!videoUrl) return 'other';
    
    if (videoUrl.includes('rutube.ru')) return 'rutube';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('youtube-nocookie.com')) return 'youtube';
    if (videoUrl.includes('vk.com/video')) return 'vk';
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
    
    return 'other';
  };
  
  // Function to convert video URLs to embeddable format with autoplay support
  const getEmbedUrl = (videoUrl: string, autoplay: boolean = true): string => {
    if (!videoUrl) return '';
    
    // Rutube - convert to proper embed format according to official docs
    if (videoUrl.includes('rutube.ru')) {
      // Already in embed format - need to add autoplay params
      if (videoUrl.includes('/play/embed/')) {
        if (autoplay) {
          // Check if URL already has query params
          const hasQuery = videoUrl.includes('?');
          const separator = hasQuery ? '&' : '?';
          return `${videoUrl}${separator}autoplay=1&mute=1`;
        }
        return videoUrl;
      }
      
      // Convert shorts to video format first (as per docs)
      let processedUrl = videoUrl;
      if (videoUrl.includes('/shorts/')) {
        processedUrl = videoUrl.replace('/shorts/', '/video/');
      }
      
      // Extract video ID from various Rutube formats
      const rutubeMatch = processedUrl.match(/rutube\.ru\/(?:video|play\/embed)\/([\w-]{20,})\/?/);
      if (rutubeMatch) {
        const baseUrl = `https://rutube.ru/play/embed/${rutubeMatch[1]}/`;
        if (autoplay) {
          return `${baseUrl}?autoplay=1&mute=1`;
        }
        return baseUrl;
      }
    }
    
    // YouTube with autoplay support - handle multiple URL formats
    let youtubeId = null;
    
    // Check for various YouTube URL formats
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('youtube-nocookie.com')) {
      // Already in embed format
      const embedMatch = videoUrl.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch) {
        youtubeId = embedMatch[1];
        if (autoplay) {
          // Check if URL already has query params
          const hasQuery = videoUrl.includes('?');
          const separator = hasQuery ? '&' : '?';
          return `${videoUrl}${separator}autoplay=1&mute=1`;
        }
        return videoUrl;
      }
      
      // Standard watch URLs and shorts
      const watchMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (watchMatch) {
        youtubeId = watchMatch[1];
      }
    }
    
    if (youtubeId) {
      const baseUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0&modestbranding=1`;
      if (autoplay) {
        return `${baseUrl}&autoplay=1&mute=1`;
      }
      return baseUrl;
    }
    
    // VK Video
    const vkMatch = videoUrl.match(/vk\.com\/video([0-9_-]+)/);
    if (vkMatch) {
      return `https://vk.com/video_ext.php?oid=${vkMatch[1].split('_')[0]}&id=${vkMatch[1].split('_')[1]}&hash=&hd=1`;
    }
    
    // Direct video files or other formats
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return videoUrl;
    }
    
    // Fallback: return original URL
    return videoUrl;
  };
  
  const handleVideoClick = (video: VideoInstruction) => {
    if (!video.videoUrl) {
      alert('Видео недоступно');
      return;
    }
    setVideoError(null); // Clear any previous errors
    setIsIframeBlocked(false); // Reset blocked state
    setIsIframeLoading(true);
    setSelectedVideo(video);
  };

  const handleVideoError = (error: string) => {
    setVideoError(error);
    setIsIframeBlocked(true);
    setIsIframeLoading(false);
  };

  const handleIframeLoad = () => {
    setVideoError(null);
    setIsIframeLoading(false);
    setIsIframeBlocked(false);
  };

  const handleOpenExternal = (videoUrl: string) => {
    // Convert embed URL back to normal URL for Rutube
    let externalUrl = videoUrl;
    if (videoUrl.includes('rutube.ru/play/embed/')) {
      const videoId = videoUrl.match(/rutube\.ru\/play\/embed\/([\w-]+)/);
      if (videoId) {
        externalUrl = `https://rutube.ru/video/${videoId[1]}/`;
      }
    }
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };
  
  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e90039]"></div>
        </div>
      </div>
    );
  }

  if (sortedVideos.length === 0) {
    return (
      <div className="space-y-8">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Видео пока не загружены
          </h3>
          <p className="text-gray-600">
            Инструкции по монтажу и использованию панелей будут добавлены позже
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(categorizedVideos).map(([category, categoryVideos]) => (
        <div key={category}>
          {showByCategory && Object.keys(categorizedVideos).length > 1 && (
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#e90039]" />
              {category}
            </h4>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {categoryVideos.map((video) => (
              <div 
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video)}
                data-testid={`video-card-${video.id}`}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {video.thumbnailUrl ? (
                    <>
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#e90039] bg-opacity-90 rounded-full flex items-center justify-center">
                          <Play size={24} className="text-white ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#e90039] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                      <div className="text-sm text-gray-600">
                        {video.videoUrl ? 'Нажмите для просмотра' : 'Видео недоступно'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="font-medium text-gray-900 mb-2">
                    {video.title}
                  </div>
                  
                  {video.description && (
                    <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.description}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{video.duration}</span>
                    </div>
                    
                    {video.category && !showByCategory && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{video.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 id="video-modal-title" className="text-lg font-semibold text-gray-900">{selectedVideo.title}</h3>
              <button 
                onClick={closeVideoModal}
                className="text-gray-500 hover:text-gray-700"
                data-testid="close-video-modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              {videoError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Ошибка загрузки видео:</strong> {videoError}
                </div>
              )}
              
              <div className="aspect-video bg-gray-900 rounded overflow-hidden mb-4 relative">
                {/* Loader overlay */}
                {isIframeLoading && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Загрузка видео...</p>
                    </div>
                  </div>
                )}
                
                {/* Fallback for blocked content */}
                {isIframeBlocked ? (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg mb-2">Этот контент заблокирован</p>
                      <p className="text-sm text-gray-300 mb-4">Видео может быть недоступно для встраивания</p>
                      <button 
                        onClick={() => selectedVideo.videoUrl && handleOpenExternal(selectedVideo.videoUrl)}
                        className="bg-[#e90039] hover:bg-[#c8002f] text-white px-6 py-3 rounded font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
                        data-testid="button-open-external"
                      >
                        <Play className="w-4 h-4" />
                        Открыть на {selectedVideo.videoUrl && getVideoServiceType(selectedVideo.videoUrl) === 'rutube' ? 'Rutube' : 'видеохостинге'}
                      </button>
                    </div>
                  </div>
                ) : (() => {
                  if (!selectedVideo.videoUrl) {
                    return (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Play className="w-12 h-12 mx-auto mb-2" />
                          <p>Видео недоступно</p>
                        </div>
                      </div>
                    );
                  }
                  
                  const serviceType = getVideoServiceType(selectedVideo.videoUrl);
                  const embedUrl = getEmbedUrl(selectedVideo.videoUrl, true);
                  
                  // Direct video files
                  if (serviceType === 'direct' && embedUrl.match(/\.(mp4|webm|ogg)$/i)) {
                    return (
                      <video 
                        controls 
                        className="w-full h-full"
                        src={embedUrl}
                      >
                        Ваш браузер не поддерживает воспроизведение видео.
                      </video>
                    );
                  }
                  
                  // Rutube - use specific iframe configuration per docs
                  if (serviceType === 'rutube') {
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                        allow="clipboard-write; autoplay"
                        {...({ webkitAllowFullScreen: true, mozallowfullscreen: true } as any)}
                        allowFullScreen
                        onError={() => handleVideoError('Не удалось загрузить Rutube видео')}
                        onLoad={handleIframeLoad}
                        data-testid="video-player-iframe"
                      />
                    );
                  }
                  
                  // YouTube and VK - use standard iframe configuration
                  if (serviceType === 'youtube' || serviceType === 'vk') {
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                        onError={() => handleVideoError(`Не удалось загрузить ${serviceType === 'youtube' ? 'YouTube' : 'VK'} видео`)}
                        onLoad={handleIframeLoad}
                        data-testid="video-player-iframe"
                      />
                    );
                  }
                  
                  // Fallback for unknown services
                  return (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Play className="w-12 h-12 mx-auto mb-2" />
                        <p className="mb-4">Встраивание недоступно</p>
                        <button 
                          onClick={() => window.open(selectedVideo.videoUrl, '_blank', 'noopener,noreferrer')}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold transition-colors duration-200"
                          data-testid="button-open-external"
                        >
                          Открыть видео
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {selectedVideo.description && (
                <div className="text-sm text-gray-600 mb-2">
                  {selectedVideo.description}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedVideo.duration}</span>
                </div>
                {selectedVideo.category && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{selectedVideo.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}