import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Tv,
  Maximize,
  RotateCcw,
} from 'lucide-react';
import { VideoDetails } from '../../types';

interface VideoPlayerProps {
  video: VideoDetails;
  initialPosition?: number;
  onEnded?: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  theaterMode: boolean;
  onToggleTheaterMode: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  zenMode,
  onToggleZenMode,
  theaterMode,
  onToggleTheaterMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut listener for Zen & Theater mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onToggleZenMode();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        onToggleTheaterMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleZenMode, onToggleTheaterMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden select-none group transition-all duration-300 ${
        theaterMode ? 'h-[78vh]' : 'aspect-video max-h-[75vh]'
      } ${zenMode ? 'rounded-2xl zen-glow ring-1 ring-red-500/20 shadow-2xl' : 'rounded-2xl'}`}
    >
      {/* Clean Ad-Free No-Cookie YouTube Player */}
      <iframe
        key={video.id}
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      />

      {/* Floating Zen Mode Quick Badge */}
      {zenMode && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass text-xs font-semibold text-red-400 border border-red-500/30 shadow-2xl pointer-events-none animate-pulse-subtle z-20">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Zen Focus Mode (Active)</span>
        </div>
      )}

      {/* Quick Player Bar on Hover */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass transition-all ${
            zenMode
              ? 'bg-red-500/20 text-red-400 border-red-500/40'
              : 'text-zinc-300 hover:text-white border-zinc-700'
          }`}
          title="Toggle Zen Mode (Shortcut: Z)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zen Mode</span>
        </button>

        <button
          onClick={onToggleTheaterMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass text-zinc-300 hover:text-white border-zinc-700 transition-all ${
            theaterMode ? 'text-red-400' : ''
          }`}
          title="Toggle Theater Mode (Shortcut: T)"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Theater</span>
        </button>
      </div>
    </div>
  );
};
