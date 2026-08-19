import React, { useState, useEffect } from 'react';
import { Search, Minus, Square, Copy, X, Sparkles, Tv, Flame } from 'lucide-react';
import { youtubeApi } from '../services/api';

interface TitleBarProps {
  onSearch: (query: string) => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  onOpenTrending: () => void;
  onOpenHome: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onSearch,
  zenMode,
  onToggleZenMode,
  onOpenTrending,
  onOpenHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isElectron = !!window.electronAPI;

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsubscribe = window.electronAPI.onWindowStateChange((state) => {
        setIsMaximized(state.isMaximized);
      });
      return unsubscribe;
    }
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await youtubeApi.getSearchSuggestions(searchQuery);
      setSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearch(searchQuery.trim());
    }
  };

  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(false);
    onSearch(text);
  };

  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = async () => {
    if (window.electronAPI) {
      const max = await window.electronAPI.maximize();
      setIsMaximized(max);
    }
  };
  const handleClose = () => window.electronAPI?.close();

  return (
    <header className="h-11 bg-[#0e0e12] border-b border-zinc-800/80 flex items-center justify-between px-3 z-50 titlebar-drag select-none shrink-0">
      {/* Brand & Left Quick Links */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        <button
          onClick={onOpenHome}
          className="flex items-center gap-2 group focus:outline-none"
          title="ZenTube Home"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
          </div>
          <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ZenTube
          </span>
        </button>

        <button
          onClick={onOpenTrending}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800/60 transition-colors ml-2"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Trending</span>
        </button>
      </div>

      {/* Center Search Bar with Autocomplete */}
      <div className="relative w-full max-w-md mx-4 titlebar-no-drag">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search YouTube videos, channels, topics..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-[#16161b] hover:bg-[#1a1a22] focus:bg-[#1c1c24] text-xs text-zinc-200 placeholder-zinc-500 px-3.5 py-1.5 pl-8 rounded-full border border-zinc-800 focus:border-red-500/60 focus:outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Suggestions Popup */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 glass-dropdown rounded-xl py-1 shadow-2xl z-50 overflow-hidden border border-zinc-800">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Search className="w-3 h-3 text-zinc-500" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Zen Mode & Window Controls */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {/* Zen Mode Button */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            zenMode
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20'
              : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/50'
          }`}
          title="Zen Mode: Distraction-free playback without recommendations or comments (Shortcut: Z)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${zenMode ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`} />
          <span>Zen Mode</span>
        </button>

        {/* Native Window Controls for Electron */}
        {isElectron && (
          <div className="flex items-center ml-2 border-l border-zinc-800 pl-2">
            <button
              onClick={handleMinimize}
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
