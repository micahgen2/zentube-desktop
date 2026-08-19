import React, { useState } from 'react';
import { CheckCircle2, MoreVertical, Bookmark, ListPlus, Radio } from 'lucide-react';
import { Video } from '../types';
import { storageService } from '../services/storage';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  onSelectChannel?: (channelId: string) => void;
  onAddToPlaylist?: (video: Video) => void;
  hideMetrics?: boolean;
  hideThumbnails?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onSelectChannel,
  onAddToPlaylist,
  hideMetrics = false,
  hideThumbnails = false,
}) => {
  const [isSaved, setIsSaved] = useState(() => storageService.isSaved(video.id));
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = storageService.toggleSavedVideo(video);
    setIsSaved(saved);
  };

  const handlePlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onAddToPlaylist) onAddToPlaylist(video);
  };

  return (
    <div
      onClick={() => onSelect(video)}
      className="group flex flex-col gap-2.5 rounded-2xl p-2 bg-[#121216]/40 hover:bg-[#18181f] border border-transparent hover:border-zinc-800/80 transition-all duration-200 cursor-pointer relative"
    >
      {/* Thumbnail & Duration */}
      {!hideThumbnails ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback placeholder
              (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            }}
          />

          {/* Duration / Live Badge */}
          {video.isLive ? (
            <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </div>
          ) : video.durationFormatted ? (
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-zinc-100 text-[11px] font-medium px-1.5 py-0.5 rounded-md shadow">
              {video.durationFormatted}
            </div>
          ) : null}

          {/* Quick Action Overlay Button (Watch Later) */}
          <button
            onClick={handleToggleSave}
            className={`absolute top-2 right-2 p-1.5 rounded-lg glass opacity-0 group-hover:opacity-100 transition-opacity ${
              isSaved ? 'text-red-400 opacity-100' : 'text-zinc-300 hover:text-white'
            }`}
            title={isSaved ? 'Remove from Watch Later' : 'Watch Later'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      ) : (
        <div className="h-16 w-full rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
          Zen Mode (Thumbnails Hidden)
        </div>
      )}

      {/* Video Info */}
      <div className="flex gap-3 items-start px-0.5">
        {/* Channel Avatar */}
        {video.uploaderAvatar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (video.uploaderId && onSelectChannel) {
                onSelectChannel(video.uploaderId);
              }
            }}
            className="shrink-0 group/avatar"
            title={video.uploaderName}
          >
            <img
              src={video.uploaderAvatar}
              alt={video.uploaderName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-800 group-hover/avatar:ring-red-500/50 transition-all"
            />
          </button>
        )}

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-relaxed group-hover:text-red-400 transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Channel Name */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400 hover:text-zinc-200">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (video.uploaderId && onSelectChannel) {
                  onSelectChannel(video.uploaderId);
                }
              }}
              className="truncate hover:underline cursor-pointer"
            >
              {video.uploaderName}
            </span>
            {video.uploaderVerified && (
              <CheckCircle2 className="w-3 h-3 text-zinc-400 shrink-0" />
            )}
          </div>

          {/* Views & Date (unless hidden in Zen Mode) */}
          {!hideMetrics && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
              {video.views !== undefined && <span>{video.views.toLocaleString()} views</span>}
              {video.views !== undefined && video.uploadedDate && <span>•</span>}
              {video.uploadedDate && <span>{video.uploadedDate}</span>}
            </div>
          )}
        </div>

        {/* Card Options Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 glass-dropdown rounded-xl py-1 shadow-2xl z-40 border border-zinc-800 text-xs"
            >
              <button
                onClick={handleToggleSave}
                className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Remove from Saved' : 'Save to Watch Later'}</span>
              </button>
              <button
                onClick={handlePlaylistClick}
                className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Add to Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
