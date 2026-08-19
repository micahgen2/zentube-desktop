import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Video } from '../types';
import { youtubeApi } from '../services/api';
import { VideoCard } from '../components/VideoCard';

interface SearchViewProps {
  query: string;
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (channelId: string) => void;
  onAddToPlaylist: (video: Video) => void;
  hideMetrics?: boolean;
  hideThumbnails?: boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  onSelectVideo,
  onSelectChannel,
  onAddToPlaylist,
  hideMetrics,
  hideThumbnails,
}) => {
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'upload_date' | 'view_count' | 'rating'>('relevance');

  const executeSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await youtubeApi.search(query, 'video', sortBy);
      setResults(data);
    } catch (err: any) {
      console.error('[ZenTube] Search error:', err);
      setError(err.message || 'Search failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query, sortBy]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Results for <span className="text-red-400 font-bold">"{query}"</span>
          </h2>
          <span className="text-xs text-zinc-500">{results.length} videos found</span>
        </div>

        {/* Sort Filter Chips */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          {[
            { id: 'relevance', label: 'Relevance' },
            { id: 'upload_date', label: 'Upload Date' },
            { id: 'view_count', label: 'Most Views' },
            { id: 'rating', label: 'Rating' },
          ].map((sort) => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                sortBy === sort.id
                  ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
                  : 'bg-[#18181f] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl glass border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={executeSearch}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
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
      ) : results.length === 0 ? (
        <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
          <Search className="w-8 h-8 text-zinc-600 mb-2" />
          <span>No results found for "{query}". Try a different keyword.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
          {results.map((video) => (
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
