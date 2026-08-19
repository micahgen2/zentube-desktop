import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { Video } from '../types';
import { storageService } from '../services/storage';

interface PlaylistModalProps {
  video: Video | null;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ video, onClose }) => {
  const [playlists, setPlaylists] = useState(() => storageService.getPlaylists());
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(() => {
    if (!video) return new Set();
    const set = new Set<string>();
    storageService.getPlaylists().forEach((pl) => {
      if (pl.videos.some((v) => v.id === video.id)) {
        set.add(pl.id);
      }
    });
    return set;
  });

  if (!video) return null;

  const handleToggleVideo = (playlistId: string) => {
    const isPresent = addedPlaylists.has(playlistId);
    if (isPresent) {
      storageService.removeVideoFromPlaylist(playlistId, video.id);
      const next = new Set(addedPlaylists);
      next.delete(playlistId);
      setAddedPlaylists(next);
    } else {
      storageService.addVideoToPlaylist(playlistId, video);
      const next = new Set(addedPlaylists);
      next.add(playlistId);
      setAddedPlaylists(next);
    }
    setPlaylists(storageService.getPlaylists());
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = storageService.createPlaylist(newTitle.trim());
    storageService.addVideoToPlaylist(pl.id, video);
    setNewTitle('');
    setShowCreate(false);
    setPlaylists(storageService.getPlaylists());
    const next = new Set(addedPlaylists);
    next.add(pl.id);
    setAddedPlaylists(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm glass-dropdown rounded-2xl p-5 border border-zinc-800 shadow-2xl text-xs flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-sm text-zinc-100">Save to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="flex items-center gap-3 p-2 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-12 h-8 rounded-lg object-cover"
          />
          <span className="text-zinc-200 line-clamp-1 flex-1 font-medium">{video.title}</span>
        </div>

        {/* Playlist Checklist */}
        <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
          {playlists.length === 0 ? (
            <div className="text-center py-4 text-zinc-500">
              No playlists found. Create your first playlist below!
            </div>
          ) : (
            playlists.map((pl) => {
              const isChecked = addedPlaylists.has(pl.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleToggleVideo(pl.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-xs text-zinc-200">{pl.title}</span>
                    <span className="text-[10px] text-zinc-500">{pl.videoCount} videos</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create Playlist Section */}
        {showCreate ? (
          <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              placeholder="Enter playlist title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full bg-zinc-900 text-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg"
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        )}
      </div>
    </div>
  );
};
