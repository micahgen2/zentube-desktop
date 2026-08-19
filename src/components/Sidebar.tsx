import React from 'react';
import {
  Home,
  Flame,
  Clock,
  Bookmark,
  ListMusic,
  Users,
  Settings,
  Tv,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { storageService } from '../services/storage';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  zenMode: boolean;
  onSelectChannel?: (channelId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  zenMode,
  onSelectChannel,
}) => {
  const subscriptions = storageService.getSubscriptions();

  // If in Zen Mode, completely hide the sidebar for a pure distraction-free player
  if (zenMode && activeTab === 'watch') {
    return null;
  }

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Explore', icon: <Home className="w-4 h-4" /> },
    { tab: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4 text-amber-500" /> },
    { tab: 'subscriptions', label: 'Subscriptions', icon: <Radio className="w-4 h-4 text-red-400" /> },
  ];

  const libraryItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { tab: 'saved', label: 'Watch Later', icon: <Bookmark className="w-4 h-4" /> },
    { tab: 'playlists', label: 'Playlists', icon: <ListMusic className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`bg-[#0d0d10] border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 select-none shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="py-3 px-2 flex flex-col gap-5 overflow-y-auto">
        {/* Main Navigation */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className={isActive ? 'text-red-400' : ''}>{item.icon}</div>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Library Section */}
        <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-3">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Library
            </span>
          )}
          {libraryItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className={isActive ? 'text-red-400' : ''}>{item.icon}</div>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Subscriptions List (Local) */}
        {!collapsed && subscriptions.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-3">
            <span className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Subscriptions</span>
              <span className="text-zinc-600">{subscriptions.length}</span>
            </span>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
              {subscriptions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSelectChannel && onSelectChannel(sub.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/40 text-left transition-colors group"
                >
                  {sub.avatarUrl ? (
                    <img
                      src={sub.avatarUrl}
                      alt={sub.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="truncate flex-1 group-hover:text-zinc-200">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls: Settings & Collapse */}
      <div className="p-2 border-t border-zinc-800/80 flex flex-col gap-1">
        <button
          onClick={() => onTabChange('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
