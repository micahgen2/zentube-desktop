import { Video, VideoDetails, Comment, ChannelInfo, VideoStreamFormat } from '../types';

// Declare electronAPI on window
declare global {
  interface Window {
    electronAPI?: {
      minimize: () => Promise<void>;
      maximize: () => Promise<boolean>;
      isMaximized: () => Promise<boolean>;
      close: () => Promise<void>;
      togglePip: (enable: boolean) => Promise<boolean>;
      setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
      proxyFetch: (url: string, options?: RequestInit) => Promise<{ ok: boolean; status: number; data?: any; error?: string }>;
      getTrending: (category?: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
      search: (params: { query: string; sortBy?: string }) => Promise<{ ok: boolean; data?: any; error?: string }>;
      getSuggestions: (query: string) => Promise<{ ok: boolean; data?: string[]; error?: string }>;
      getVideo: (videoId: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
      getComments: (videoId: string) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
      getChannel: (channelId: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
      onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => () => void;
    };
  }
}

// Pool of backup Invidious instances for web mode
export const DEFAULT_INVIDIOUS_INSTANCES = [
  'https://invidious.tiekoetter.com',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
];

class YouTubeApiClient {
  private customInstance: string | null = null;

  constructor() {
    const savedCustom = localStorage.getItem('zentube_custom_instance');
    if (savedCustom) {
      this.customInstance = savedCustom;
    }
  }

  public setCustomInstance(url: string | null) {
    this.customInstance = url;
    if (url) {
      localStorage.setItem('zentube_custom_instance', url);
    } else {
      localStorage.removeItem('zentube_custom_instance');
    }
  }

  public getActiveInstance(): string {
    return this.customInstance || 'Direct YouTube Engine';
  }

  public getAllInstances(): string[] {
    return DEFAULT_INVIDIOUS_INSTANCES;
  }

  public formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const paddedSecs = secs.toString().padStart(2, '0');

    if (hrs > 0) {
      const paddedMins = mins.toString().padStart(2, '0');
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
  }

  public formatViews(views?: number | string): string {
    if (views === undefined || views === null) return '';
    if (typeof views === 'string') return views;
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B views`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
    return `${views.toLocaleString()} views`;
  }

  /**
   * Fetch Trending / Popular videos
   */
  public async getTrending(category?: string): Promise<Video[]> {
    if (window.electronAPI?.getTrending) {
      const res = await window.electronAPI.getTrending(category);
      if (res.ok && Array.isArray(res.data)) {
        return res.data;
      }
      throw new Error(res.error || 'Failed to load trending feed');
    }

    // Web Fallback
    const res = await fetch(`https://invidious.tiekoetter.com/api/v1/trending`);
    return await res.json();
  }

  /**
   * Search Videos and Channels
   */
  public async search(query: string, filter: string = 'video', sortBy: string = 'relevance'): Promise<Video[]> {
    if (!query.trim()) return [];

    if (window.electronAPI?.search) {
      const res = await window.electronAPI.search({ query, sortBy });
      if (res.ok && Array.isArray(res.data)) {
        return res.data;
      }
      throw new Error(res.error || 'Search returned no results');
    }

    // Web Fallback
    const res = await fetch(`https://invidious.tiekoetter.com/api/v1/search?q=${encodeURIComponent(query)}`);
    return await res.json();
  }

  /**
   * Get search suggestions
   */
  public async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    try {
      if (window.electronAPI?.getSuggestions) {
        const res = await window.electronAPI.getSuggestions(query);
        return res.data || [];
      }
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json[1] || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch Full Video Details & Streaming Formats
   */
  public async getVideoDetails(videoId: string): Promise<VideoDetails> {
    if (window.electronAPI?.getVideo) {
      const res = await window.electronAPI.getVideo(videoId);
      if (res.ok && res.data) {
        return res.data;
      }
      throw new Error(res.error || 'Failed to load video details');
    }

    throw new Error('Video service unavailable');
  }

  /**
   * Fetch Video Comments
   */
  public async getComments(videoId: string): Promise<Comment[]> {
    if (window.electronAPI?.getComments) {
      const res = await window.electronAPI.getComments(videoId);
      if (res.ok && Array.isArray(res.data)) {
        return res.data;
      }
    }
    return [];
  }

  /**
   * Fetch Channel Details & Uploaded Videos
   */
  public async getChannel(channelId: string): Promise<ChannelInfo> {
    if (window.electronAPI?.getChannel) {
      const res = await window.electronAPI.getChannel(channelId);
      if (res.ok && res.data) {
        return res.data;
      }
      throw new Error(res.error || 'Failed to load channel');
    }

    return {
      id: channelId,
      name: 'Creator',
      videos: [],
    };
  }
}

export const youtubeApi = new YouTubeApiClient();
