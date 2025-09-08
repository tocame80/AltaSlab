import { useQuery } from '@tanstack/react-query';
import { Play, Clock, Tag } from 'lucide-react';

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
  const categorizedVideos = showByCategory 
    ? sortedVideos.reduce((acc, video) => {
        const category = video.category || 'Общие';
        if (!acc[category]) acc[category] = [];
        acc[category].push(video);
        return acc;
      }, {} as Record<string, VideoInstruction[]>)
    : { 'Все видео': sortedVideos };

  const handleVideoClick = (videoUrl: string) => {
    if (!videoUrl) {
      alert('Видео недоступно');
      return;
    }
    // Open video in new tab/window
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
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
                onClick={() => handleVideoClick(video.videoUrl || '')}
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
    </div>
  );
}