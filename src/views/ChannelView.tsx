import React, { useState, useEffect } from 'react';
import { CheckCircle2, Users, Eye, Calendar, Radio } from 'lucide-react';
import { ChannelInfo, Video } from '../types';
import { youtubeApi } from '../services/api';
import { storageService } from '../services/storage';
import { VideoCard } from '../components/VideoCard';

interface ChannelViewProps {
  channelId: string;
  onSelectVideo: (video: Video) => void;
  onAddToPlaylist: (video: Video) => void;
  hideMetrics?: boolean;
  hideThumbnails?: boolean;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channelId,
  onSelectVideo,
  onAddToPlaylist,
  hideMetrics,
  hideThumbnails,
}) => {
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsSubscribed(storageService.isSubscribed(channelId));

    youtubeApi
      .getChannel(channelId)
      .then((data) => {
        if (isMounted) {
          setChannel(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[ZenTube] Channel loading error:', err);
          setError(err.message || 'Failed to load channel profile');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const handleToggleSubscribe = () => {
    if (!channel) return;
    const sub = storageService.toggleSubscription({
      id: channel.id,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
    });
    setIsSubscribed(sub);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <span className="text-xs text-zinc-400">Loading channel...</span>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="p-4 rounded-2xl glass border border-red-500/30 max-w-md">
          <h3 className="font-semibold text-sm text-red-400 mb-2">Channel Not Found</h3>
          <p className="text-xs text-zinc-400 mb-4">{error || 'Could not load channel details.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
      {/* Channel Banner */}
      {channel.bannerUrl && (
        <div className="w-full h-36 sm:h-48 rounded-3xl overflow-hidden bg-zinc-900 shadow-md">
          <img
            src={channel.bannerUrl}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-5 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          {channel.avatarUrl ? (
            <img
              src={channel.avatarUrl}
              alt={channel.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-zinc-700 shadow-xl"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-400">
              {channel.name[0]}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-100">{channel.name}</h1>
              {channel.verified && <CheckCircle2 className="w-4 h-4 text-zinc-400" />}
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              {channel.subscriberCountText && <span>{channel.subscriberCountText}</span>}
              {channel.videos.length > 0 && <span>• {channel.videos.length} videos</span>}
            </div>

            {channel.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 max-w-2xl mt-1">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        {/* Subscribe Button */}
        <button
          onClick={handleToggleSubscribe}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
            isSubscribed
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20'
          }`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Videos Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-zinc-200">Latest Uploads</h3>
        {channel.videos.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No uploaded videos found for this channel.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
            {channel.videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onAddToPlaylist={onAddToPlaylist}
                hideMetrics={hideMetrics}
                hideThumbnails={hideThumbnails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
