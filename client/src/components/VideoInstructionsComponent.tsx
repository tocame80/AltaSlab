import { useQuery } from '@tanstack/react-query';
import { Play, Clock, Tag, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const [blockedVideos, setBlockedVideos] = useState<Record<string, boolean>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<string, boolean>>({});
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      timeoutRefs.current = {};
    };
  }, []);

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
    
    // Rutube - convert to proper embed format with robust URL parsing
    if (videoUrl.includes('rutube.ru')) {
      try {
        const urlObj = new URL(videoUrl);
        let videoId = '';
        
        // If already an embed URL, extract ID and rebuild
        if (videoUrl.includes('/play/embed/')) {
          const embedMatch = urlObj.pathname.match(/\/play\/embed\/([a-f0-9_-]{10,})/i);
          if (embedMatch) videoId = embedMatch[1];
        } else {
          // Extract from various URL patterns: /video/, /shorts/, /tracks/, etc.
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          for (let i = 0; i < pathSegments.length - 1; i++) {
            if (['video', 'shorts', 'tracks', 'play'].includes(pathSegments[i])) {
              const potentialId = pathSegments[i + 1];
              // More permissive ID pattern for Rutube (10+ characters)
              if (potentialId && /^[a-f0-9_-]{10,}$/i.test(potentialId)) {
                videoId = potentialId;
                break;
              }
            }
          }
        }
        
        if (videoId) {
          const baseUrl = `https://rutube.ru/play/embed/${videoId}/`;
          if (autoplay) {
            return `${baseUrl}?autoplay=1&mute=1`;
          }
          return baseUrl;
        }
      } catch (e) {
        console.warn('Failed to parse Rutube URL:', videoUrl, e);
      }
      
      // If extraction failed, return empty to trigger fallback
      return '';
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
    
    // If already playing, stop it
    if (playingVideo === video.id) {
      handleStopVideo(video.id);
      return;
    }
    
    // Clear any existing timeout for this video
    if (timeoutRefs.current[video.id]) {
      clearTimeout(timeoutRefs.current[video.id]);
      delete timeoutRefs.current[video.id];
    }
    
    // Clear any previous errors and states for this video
    setVideoErrors(prev => {
      const updated = { ...prev };
      delete updated[video.id];
      return updated;
    });
    setBlockedVideos(prev => {
      const updated = { ...prev };
      delete updated[video.id];
      return updated;
    });
    setLoadingVideos(prev => ({ ...prev, [video.id]: true }));
    setPlayingVideo(video.id);
    
    // Start timeout for iframe loading detection (6 seconds)
    timeoutRefs.current[video.id] = setTimeout(() => {
      console.warn('Iframe timeout: no onLoad or onError event fired for video', video.id);
      setBlockedVideos(prev => ({ ...prev, [video.id]: true }));
      setLoadingVideos(prev => {
        const updated = { ...prev };
        delete updated[video.id];
        return updated;
      });
      setVideoErrors(prev => ({ ...prev, [video.id]: 'Время загрузки видео истекло' }));
    }, 6000);
  };

  const handleStopVideo = (videoId: string) => {
    // Clear timeout for this video
    if (timeoutRefs.current[videoId]) {
      clearTimeout(timeoutRefs.current[videoId]);
      delete timeoutRefs.current[videoId];
    }
    
    // Clear all states for this video
    setPlayingVideo(null);
    setVideoErrors(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
    setBlockedVideos(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
    setLoadingVideos(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
  };

  const handleVideoError = (videoId: string, error: string) => {
    // Clear timeout since we got an error event
    if (timeoutRefs.current[videoId]) {
      clearTimeout(timeoutRefs.current[videoId]);
      delete timeoutRefs.current[videoId];
    }
    
    setVideoErrors(prev => ({ ...prev, [videoId]: error }));
    setBlockedVideos(prev => ({ ...prev, [videoId]: true }));
    setLoadingVideos(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
  };

  const handleIframeLoad = (videoId: string) => {
    // Clear timeout since iframe loaded successfully
    if (timeoutRefs.current[videoId]) {
      clearTimeout(timeoutRefs.current[videoId]);
      delete timeoutRefs.current[videoId];
    }
    
    setVideoErrors(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
    setLoadingVideos(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
    setBlockedVideos(prev => {
      const updated = { ...prev };
      delete updated[videoId];
      return updated;
    });
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
          
          <div className={categoryVideos.length === 1 
            ? "flex justify-center" 
            : "grid md:grid-cols-2 gap-6"
          }>
            {categoryVideos.map((video) => (
              <div 
                key={video.id}
                className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                  categoryVideos.length === 1 ? 'max-w-md w-full' : ''
                }`}
                onClick={() => handleVideoClick(video)}
                data-testid={`video-card-${video.id}`}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {playingVideo === video.id ? (
                    // Show video player
                    <div className="w-full h-full relative">
                      {/* Loading overlay */}
                      {loadingVideos[video.id] && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Загрузка видео...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Close button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopVideo(video.id);
                        }}
                        className="absolute top-2 right-2 z-20 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1 transition-colors"
                        data-testid={`close-video-${video.id}`}
                      >
                        <X size={16} />
                      </button>
                      
                      {/* Error display or fallback */}
                      {videoErrors[video.id] && (
                        <div className="absolute top-8 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs z-10">
                          <strong>Ошибка:</strong> {videoErrors[video.id]}
                        </div>
                      )}
                      
                      {/* Fallback for blocked content */}
                      {blockedVideos[video.id] ? (
                        <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                          <div className="text-center">
                            <Play className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm mb-2">Контент заблокирован</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenExternal(video.videoUrl!);
                              }}
                              className="bg-[#e90039] hover:bg-[#c8002f] text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-200 flex items-center gap-1 mx-auto"
                              data-testid={`button-open-external-${video.id}`}
                            >
                              <Play className="w-3 h-3" />
                              Открыть на {video.videoUrl && getVideoServiceType(video.videoUrl) === 'rutube' ? 'Rutube' : 'видеохостинге'}
                            </button>
                          </div>
                        </div>
                      ) : (() => {
                        if (!video.videoUrl) {
                          return (
                            <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                              <div className="text-center">
                                <Play className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Видео недоступно</p>
                              </div>
                            </div>
                          );
                        }
                        
                        const serviceType = getVideoServiceType(video.videoUrl);
                        const embedUrl = getEmbedUrl(video.videoUrl, true);
                        
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
                        
                        // Rutube - use specific iframe configuration
                        if (serviceType === 'rutube') {
                          // If embed URL extraction failed, show fallback immediately
                          if (!embedUrl) {
                            return (
                              <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                                <div className="text-center">
                                  <Play className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm mb-2">Встраивание недоступно</p>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenExternal(video.videoUrl!);
                                    }}
                                    className="bg-[#e90039] hover:bg-[#c8002f] text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-200 flex items-center gap-1 mx-auto"
                                    data-testid={`button-open-external-${video.id}`}
                                  >
                                    <Play className="w-3 h-3" />
                                    Открыть на Rutube
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              style={{ border: 'none' }}
                              allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
                              allowFullScreen
                              title={video.title}
                              onError={() => handleVideoError(video.id, 'Не удалось загрузить Rutube видео')}
                              onLoad={() => handleIframeLoad(video.id)}
                              data-testid={`video-player-iframe-${video.id}`}
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
                              title={video.title}
                              onError={() => handleVideoError(video.id, `Не удалось загрузить ${serviceType === 'youtube' ? 'YouTube' : 'VK'} видео`)}
                              onLoad={() => handleIframeLoad(video.id)}
                              data-testid={`video-player-iframe-${video.id}`}
                            />
                          );
                        }
                        
                        // Fallback for unknown services
                        return (
                          <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                            <div className="text-center">
                              <Play className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm mb-2">Встраивание недоступно</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-200"
                                data-testid={`button-open-external-${video.id}`}
                              >
                                Открыть видео
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    // Show thumbnail preview
                    video.thumbnailUrl ? (
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
                    )
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
    </div>
  );
}