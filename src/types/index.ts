export interface VideoThumbnail {
  quality: string;
  url: string;
  width?: number;
  height?: number;
}

export interface VideoStreamFormat {
  url: string;
  quality: string; // e.g. "1080p", "720p", "480p", "360p", "audio_only"
  qualityLabel?: string;
  mimeType: string;
  type?: string;
  fps?: number;
  bitrate?: number;
  container?: string;
  encoding?: string;
  audioTrack?: {
    name?: string;
    language?: string;
  };
  resolution?: string;
}

export interface VideoChapter {
  title: string;
  start: number; // in seconds
}

export interface VideoSubtitle {
  label: string;
  language: string;
  url: string;
  mimeType?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  uploaderName: string;
  uploaderId?: string;
  uploaderUrl?: string;
  uploaderAvatar?: string;
  uploaderVerified?: boolean;
  uploadedDate?: string;
  views?: number;
  duration: number; // in seconds
  durationFormatted?: string;
  thumbnailUrl: string;
  isLive?: boolean;
  isShort?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  authorThumb?: string;
  authorId?: string;
  content: string;
  publishedText: string;
  likeCount: number;
  isHearted?: boolean;
  isPinned?: boolean;
  replyCount?: number;
  replies?: Comment[];
}

export interface VideoDetails extends Video {
  hlsUrl?: string;
  dashUrl?: string;
  formatStreams: VideoStreamFormat[];
  adaptiveFormats: VideoStreamFormat[];
  chapters: VideoChapter[];
  subtitles: VideoSubtitle[];
  relatedVideos: Video[];
  likeCount?: number;
  dislikeCount?: number;
  subscriberCountText?: string;
  genre?: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscriberCount?: number;
  subscriberCountText?: string;
  description?: string;
  verified?: boolean;
  videos: Video[];
  totalViews?: number;
  joinedDate?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount: number;
  videos: Video[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  video: Video;
  watchedAt: number;
  lastPosition: number; // seconds
  duration: number;
}

export interface UserSettings {
  defaultQuality: '1080p' | '720p' | '480p' | '360p' | 'auto';
  defaultPlaybackRate: number;
  volume: number; // 0 to 1
  volumeBoost: boolean; // allow > 100%
  autoplayNext: boolean;
  zenMode: boolean; // distraction-free mode
  hideComments: boolean;
  hideRecommendations: boolean;
  hideThumbnails: boolean;
  hideMetrics: boolean; // hides view counts and subscriber counts for mindful browsing
  preferredInstance: string;
  customInstanceUrl?: string;
  theme: 'oled' | 'midnight' | 'charcoal';
  sponsorBlockEnabled: boolean;
}

export type ActiveTab = 'home' | 'trending' | 'search' | 'watch' | 'channel' | 'history' | 'saved' | 'playlists' | 'subscriptions' | 'settings';
