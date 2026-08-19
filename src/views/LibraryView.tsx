import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bookmark,
  ListMusic,
  Radio,
  Trash2,
  Play,
  Plus,
  Users,
  Film,
} from 'lucide-react';
import { Video, HistoryItem, Playlist } from '../types';
import { storageService, ChannelSubscription } from '../services/storage';
import { youtubeApi } from '../services/api';
import { VideoCard } from '../components/VideoCard';

interface LibraryViewProps {
  initialTab?: 'history' | 'saved' | 'playlists' | 'subscriptions';
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (channelId: string) => void;
  onAddToPlaylist: (video: Video) => void;
  hideMetrics?: boolean;
  hideThumbnails?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  initialTab = 'history',
  onSelectVideo,
  onSelectChannel,
  onAddToPlaylist,
  hideMetrics,
  hideThumbnails,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'playlists' | 'subscriptions'>(
    initialTab
  );

  const [history, setHistory] = useState<HistoryItem[]>(() => storageService.getHistory());
  const [saved, setSaved] = useState<Video[]>(() => storageService.getSavedVideos());
  const [subscriptions, setSubscriptions] = useState<ChannelSubscription[]>(() =>
    storageService.getSubscriptions()
  );
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storageService.getPlaylists());
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Reload data when activeTab changes
  useEffect(() => {
    setHistory(storageService.getHistory());
    setSaved(storageService.getSavedVideos());
    setSubscriptions(storageService.getSubscriptions());
    setPlaylists(storageService.getPlaylists());
  }, [activeTab]);

  const handleClearHistory = () => {
    if (window.confirm('Clear your entire local watch history?')) {
      storageService.clearHistory();
      setHistory([]);
    }
  };

  const handleRemoveHistoryItem = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.removeFromHistory(videoId);
    setHistory(storageService.getHistory());
  };

  const handleDeletePlaylist = (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this playlist?')) {
      storageService.deletePlaylist(playlistId);
      setPlaylists(storageService.getPlaylists());
      if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'history', label: 'Watch History', icon: <Clock className="w-4 h-4" />, count: history.length },
            { id: 'saved', label: 'Watch Later', icon: <Bookmark className="w-4 h-4" />, count: saved.length },
            { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-4 h-4" />, count: playlists.length },
            { id: 'subscriptions', label: 'Subscriptions', icon: <Radio className="w-4 h-4 text-red-400" />, count: subscriptions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedPlaylist(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                  : 'bg-[#141418] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-zinc-300 text-zinc-800' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Clear History Button */}
        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* 1. History Tab Content */}
      {activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-zinc-600 mb-2" />
              <span>No watch history yet. Videos you play will appear here.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
              {history.map((item) => (
                <div key={item.video.id} className="relative group">
                  <VideoCard
                    video={item.video}
                    onSelect={onSelectVideo}
                    onSelectChannel={onSelectChannel}
                    onAddToPlaylist={onAddToPlaylist}
                    hideMetrics={hideMetrics}
                    hideThumbnails={hideThumbnails}
                  />

                  {/* Watched Progress Bar Overlay */}
                  {item.lastPosition > 0 && item.duration > 0 && (
                    <div className="absolute bottom-16 left-3 right-3 h-1 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(100, (item.lastPosition / item.duration) * 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Remove from history button */}
                  <button
                    onClick={(e) => handleRemoveHistoryItem(item.video.id, e)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg glass text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Watch Later / Saved Tab Content */}
      {activeTab === 'saved' && (
        <div>
          {saved.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <Bookmark className="w-8 h-8 text-zinc-600 mb-2" />
              <span>No saved videos. Click the bookmark icon on any video to save it for later.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
              {saved.map((video) => (
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
      )}

      {/* 3. Playlists Tab Content */}
      {activeTab === 'playlists' && (
        <div>
          {selectedPlaylist ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <button
                    onClick={() => setSelectedPlaylist(null)}
                    className="text-xs text-red-400 hover:underline mb-1"
                  >
                    ← Back to all playlists
                  </button>
                  <h2 className="text-lg font-bold text-zinc-100">{selectedPlaylist.title}</h2>
                  <span className="text-xs text-zinc-500">{selectedPlaylist.videos.length} videos</span>
                </div>
              </div>

              {selectedPlaylist.videos.length === 0 ? (
                <div className="py-16 text-center text-xs text-zinc-500">
                  This playlist is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
                  {selectedPlaylist.videos.map((video) => (
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
          ) : playlists.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <ListMusic className="w-8 h-8 text-zinc-600 mb-2" />
              <span>No custom playlists yet. Use the "Playlist" button on any video to create one.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-8">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="group flex flex-col gap-3 rounded-2xl p-3 bg-[#121216]/50 hover:bg-[#18181f] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer relative"
                >
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                    {pl.thumbnailUrl ? (
                      <img
                        src={pl.thumbnailUrl}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ListMusic className="w-8 h-8 text-zinc-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-200 line-clamp-1">{pl.title}</h4>
                      <span className="text-[11px] text-zinc-500">{pl.videoCount} videos</span>
                    </div>

                    <button
                      onClick={(e) => handleDeletePlaylist(pl.id, e)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Subscriptions Tab Content */}
      {activeTab === 'subscriptions' && (
        <div>
          {subscriptions.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-zinc-600 mb-2" />
              <span>You haven't followed any channels yet. Click "Subscribe" on any video to follow creators privately without an account.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onSelectChannel(sub.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#121216]/50 hover:bg-[#18181f] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  {sub.avatarUrl ? (
                    <img
                      src={sub.avatarUrl}
                      alt={sub.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                      {sub.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-red-400 transition-colors truncate">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500">
                      Followed {new Date(sub.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
