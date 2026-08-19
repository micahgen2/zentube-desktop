import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Music2, Gamepad2, Laptop, Film, Newspaper, RefreshCw } from 'lucide-react';
import { Video } from '../types';
import { youtubeApi } from '../services/api';
import { VideoCard } from '../components/VideoCard';

interface HomeViewProps {
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (channelId: string) => void;
  onAddToPlaylist: (video: Video) => void;
  hideMetrics?: boolean;
  hideThumbnails?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'music', label: 'Music', icon: <Music2 className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'technology', label: 'Tech & Science', icon: <Laptop className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'movies', label: 'Movies & Animation', icon: <Film className="w-3.5 h-3.5 text-pink-400" /> },
  { id: 'news', label: 'News', icon: <Newspaper className="w-3.5 h-3.5 text-yellow-400" /> },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectVideo,
  onSelectChannel,
  onAddToPlaylist,
  hideMetrics,
  hideThumbnails,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      let data: Video[] = [];
      if (cat === 'all' || cat === 'trending') {
        data = await youtubeApi.getTrending();
      } else {
        // Search popular for category
        data = await youtubeApi.search(cat, 'video', 'views');
      }
      setVideos(data);
    } catch (err: any) {
      console.error('[ZenTube] Error loading home feed:', err);
      setError(err.message || 'Failed to load videos. Please try switching instance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 shrink-0">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-900 shadow-md font-semibold'
                    : 'bg-[#18181f] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchVideos(selectedCategory)}
          disabled={loading}
          className="p-2 rounded-xl bg-[#18181f] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors shrink-0"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl glass border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchVideos(selectedCategory)}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 rounded-2xl p-2 bg-[#121216]/40 animate-pulse">
              <div className="aspect-video w-full rounded-xl bg-zinc-800/60" />
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3.5 w-full bg-zinc-800 rounded" />
                  <div className="h-3 w-2/3 bg-zinc-800/70 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
          <span>No videos available. Check your internet connection or switch Invidious instance.</span>
          <button
            onClick={() => fetchVideos(selectedCategory)}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl mt-2"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
              onSelectChannel={onSelectChannel}
              onAddToPlaylist={onAddToPlaylist}
              hideMetrics={hideMetrics}
              hideThumbnails={hideThumbnails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
