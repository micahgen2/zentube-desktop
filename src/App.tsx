import React, { useState, useEffect } from 'react';
import { ActiveTab, Video, UserSettings } from './types';
import { storageService } from './services/storage';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { WatchView } from './views/WatchView';
import { SearchView } from './views/SearchView';
import { ChannelView } from './views/ChannelView';
import { LibraryView } from './views/LibraryView';
import { SettingsView } from './views/SettingsView';
import { PlaylistModal } from './components/PlaylistModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [zenMode, setZenMode] = useState<boolean>(() => storageService.getSettings().zenMode);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  // Update settings handler
  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    const next = storageService.saveSettings(updated);
    setSettings(next);
    if (updated.zenMode !== undefined) {
      setZenMode(updated.zenMode);
    }
  };

  const handleToggleZenMode = () => {
    const nextZen = !zenMode;
    setZenMode(nextZen);
    handleUpdateSettings({ zenMode: nextZen });
  };

  // Video Selection
  const handleSelectVideo = (video: Video) => {
    setActiveVideo(video);
    setActiveTab('watch');
  };

  // Channel Selection
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setActiveTab('channel');
  };

  // Search Submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  // Quick Home / Trending Navigation
  const handleOpenHome = () => {
    setActiveTab('home');
  };

  const handleOpenTrending = () => {
    setActiveTab('trending');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0c] text-zinc-100">
      {/* Frameless Custom TitleBar */}
      <TitleBar
        onSearch={handleSearch}
        zenMode={zenMode}
        onToggleZenMode={handleToggleZenMode}
        onOpenTrending={handleOpenTrending}
        onOpenHome={handleOpenHome}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          zenMode={zenMode}
          onSelectChannel={handleSelectChannel}
        />

        {/* Content View Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0f0f13] relative">
          {/* Active View Renderer */}
          {activeTab === 'home' && (
            <HomeView
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onAddToPlaylist={(video) => setModalVideo(video)}
              hideMetrics={settings.hideMetrics}
              hideThumbnails={settings.hideThumbnails}
            />
          )}

          {activeTab === 'trending' && (
            <HomeView
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onAddToPlaylist={(video) => setModalVideo(video)}
              hideMetrics={settings.hideMetrics}
              hideThumbnails={settings.hideThumbnails}
            />
          )}

          {activeTab === 'watch' && activeVideo && (
            <WatchView
              key={activeVideo.id}
              videoId={activeVideo.id}
              initialVideo={activeVideo}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onAddToPlaylist={(video) => setModalVideo(video)}
              zenMode={zenMode}
              onToggleZenMode={handleToggleZenMode}
              hideComments={settings.hideComments}
              hideRecommendations={settings.hideRecommendations}
              autoplayNext={settings.autoplayNext}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              key={searchQuery}
              query={searchQuery}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onAddToPlaylist={(video) => setModalVideo(video)}
              hideMetrics={settings.hideMetrics}
              hideThumbnails={settings.hideThumbnails}
            />
          )}

          {activeTab === 'channel' && activeChannelId && (
            <ChannelView
              key={activeChannelId}
              channelId={activeChannelId}
              onSelectVideo={handleSelectVideo}
              onAddToPlaylist={(video) => setModalVideo(video)}
              hideMetrics={settings.hideMetrics}
              hideThumbnails={settings.hideThumbnails}
            />
          )}

          {(activeTab === 'history' ||
            activeTab === 'saved' ||
            activeTab === 'playlists' ||
            activeTab === 'subscriptions') && (
            <LibraryView
              initialTab={activeTab}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onAddToPlaylist={(video) => setModalVideo(video)}
              hideMetrics={settings.hideMetrics}
              hideThumbnails={settings.hideThumbnails}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>

      {/* Playlist Add / Create Modal */}
      {modalVideo && (
        <PlaylistModal
          video={modalVideo}
          onClose={() => setModalVideo(null)}
        />
      )}
    </div>
  );
};
