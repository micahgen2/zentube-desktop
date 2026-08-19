import { Video, HistoryItem, Playlist, UserSettings } from '../types';

export interface ChannelSubscription {
  id: string;
  name: string;
  avatarUrl?: string;
  subscribedAt: number;
}

const STORAGE_KEYS = {
  SETTINGS: 'zentube_settings_v1',
  HISTORY: 'zentube_history_v1',
  SAVED: 'zentube_saved_v1',
  SUBSCRIPTIONS: 'zentube_subscriptions_v1',
  PLAYLISTS: 'zentube_playlists_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  defaultQuality: '1080p',
  defaultPlaybackRate: 1,
  volume: 1,
  volumeBoost: false,
  autoplayNext: true,
  zenMode: false,
  hideComments: false,
  hideRecommendations: false,
  hideThumbnails: false,
  hideMetrics: false,
  preferredInstance: 'https://inv.nadeko.net',
  theme: 'oled',
  sponsorBlockEnabled: true,
};

class LocalStorageService {
  // Settings
  public getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[Storage] Error reading settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Watch History
  public getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public addToHistory(video: Video, position = 0): void {
    const history = this.getHistory().filter((item) => item.video.id !== video.id);
    const newItem: HistoryItem = {
      video,
      watchedAt: Date.now(),
      lastPosition: position,
      duration: video.duration || 0,
    };
    // Keep max 200 items
    const updated = [newItem, ...history].slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  }

  public updateHistoryPosition(videoId: string, position: number): void {
    const history = this.getHistory();
    const target = history.find((h) => h.video.id === videoId);
    if (target) {
      target.lastPosition = position;
      target.watchedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  }

  public clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  public removeFromHistory(videoId: string): void {
    const history = this.getHistory().filter((item) => item.video.id !== videoId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  // Saved / Bookmarked Videos
  public getSavedVideos(): Video[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public isSaved(videoId: string): boolean {
    return this.getSavedVideos().some((v) => v.id === videoId);
  }

  public toggleSavedVideo(video: Video): boolean {
    const saved = this.getSavedVideos();
    const exists = saved.some((v) => v.id === video.id);
    let updated: Video[];
    if (exists) {
      updated = saved.filter((v) => v.id !== video.id);
    } else {
      updated = [video, ...saved];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
    return !exists;
  }

  // Subscriptions
  public getSubscriptions(): ChannelSubscription[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public isSubscribed(channelId: string): boolean {
    return this.getSubscriptions().some((c) => c.id === channelId);
  }

  public toggleSubscription(channel: { id: string; name: string; avatarUrl?: string }): boolean {
    const subs = this.getSubscriptions();
    const exists = subs.some((c) => c.id === channel.id);
    let updated: ChannelSubscription[];
    if (exists) {
      updated = subs.filter((c) => c.id !== channel.id);
    } else {
      updated = [
        {
          id: channel.id,
          name: channel.name,
          avatarUrl: channel.avatarUrl,
          subscribedAt: Date.now(),
        },
        ...subs,
      ];
    }
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
    return !exists;
  }

  // Playlists
  public getPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public createPlaylist(title: string, description?: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: 'pl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'Untitled Playlist',
      description: description?.trim(),
      videoCount: 0,
      videos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newPlaylist, ...playlists];
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
    return newPlaylist;
  }

  public addVideoToPlaylist(playlistId: string, video: Video): boolean {
    const playlists = this.getPlaylists();
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return false;
    if (pl.videos.some((v) => v.id === video.id)) return false; // Already in playlist

    pl.videos.push(video);
    pl.videoCount = pl.videos.length;
    pl.thumbnailUrl = pl.thumbnailUrl || video.thumbnailUrl;
    pl.updatedAt = Date.now();

    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return true;
  }

  public removeVideoFromPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;

    pl.videos = pl.videos.filter((v) => v.id !== videoId);
    pl.videoCount = pl.videos.length;
    pl.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }

  public deletePlaylist(playlistId: string): void {
    const playlists = this.getPlaylists().filter((p) => p.id !== playlistId);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }

  public exportBackup(): string {
    const data = {
      settings: this.getSettings(),
      history: this.getHistory(),
      saved: this.getSavedVideos(),
      subscriptions: this.getSubscriptions(),
      playlists: this.getPlaylists(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      if (data.saved) localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(data.saved));
      if (data.subscriptions) localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data.subscriptions));
      if (data.playlists) localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(data.playlists));
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new LocalStorageService();
