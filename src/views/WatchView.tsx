import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  Bookmark,
  Share2,
  ListPlus,
  Radio,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { Video, VideoDetails } from '../types';
import { youtubeApi } from '../services/api';
import { storageService } from '../services/storage';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { VideoCard } from '../components/VideoCard';
import { CommentSection } from '../components/CommentSection';

interface WatchViewProps {
  videoId: string;
  initialVideo?: Video;
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (channelId: string) => void;
  onAddToPlaylist: (video: Video) => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  hideComments?: boolean;
  hideRecommendations?: boolean;
  autoplayNext?: boolean;
}

export const WatchView: React.FC<WatchViewProps> = ({
  videoId,
  initialVideo,
  onSelectVideo,
  onSelectChannel,
  onAddToPlaylist,
  zenMode,
  onToggleZenMode,
  hideComments = false,
  hideRecommendations = false,
  autoplayNext = true,
}) => {
  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setShowFullDesc(false);

    // Check saved state
    setIsSaved(storageService.isSaved(videoId));

    youtubeApi
      .getVideoDetails(videoId)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
          // Check channel subscription
          if (data.uploaderId) {
            setIsSubscribed(storageService.isSubscribed(data.uploaderId));
          }
          // Save to local watch history
          storageService.addToHistory(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[ZenTube] Error loading video details:', err);
          setError(err.message || 'Failed to load video stream');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleToggleSubscribe = () => {
    if (!details) return;
    const sub = storageService.toggleSubscription({
      id: details.uploaderId || details.uploaderName,
      name: details.uploaderName,
      avatarUrl: details.uploaderAvatar,
    });
    setIsSubscribed(sub);
  };

  const handleToggleSave = () => {
    if (!details) return;
    const saved = storageService.toggleSavedVideo(details);
    setIsSaved(saved);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://youtube.com/watch?v=${videoId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVideoEnded = () => {
    if (autoplayNext && details?.relatedVideos && details.relatedVideos.length > 0) {
      onSelectVideo(details.relatedVideos[0]);
    }
  };

  if (loading && !details) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <span className="text-xs text-zinc-400">Loading ad-free video stream...</span>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="p-4 rounded-2xl glass border border-red-500/30 max-w-md">
          <h3 className="font-semibold text-sm text-red-400 mb-2">Playback Stream Error</h3>
          <p className="text-xs text-zinc-400 mb-4">{error || 'Could not load video.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div
        className={`max-w-7xl mx-auto flex flex-col ${
          theaterMode || zenMode ? 'gap-6' : 'lg:flex-row gap-6'
        }`}
      >
        {/* Main Player & Info Column */}
        <div className={`flex-1 flex flex-col gap-4 ${zenMode ? 'max-w-5xl mx-auto' : ''}`}>
          {/* Custom Video Player */}
          <VideoPlayer
            video={details}
            onEnded={handleVideoEnded}
            zenMode={zenMode}
            onToggleZenMode={onToggleZenMode}
            theaterMode={theaterMode}
            onToggleTheaterMode={() => setTheaterMode(!theaterMode)}
          />

          {/* Video Title & Actions */}
          <div className="flex flex-col gap-3">
            <h1 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
              {details.title}
            </h1>

            {/* Channel Bar & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
              {/* Channel Profile */}
              <div className="flex items-center gap-3">
                {details.uploaderAvatar ? (
                  <button
                    onClick={() => details.uploaderId && onSelectChannel(details.uploaderId)}
                    className="shrink-0"
                  >
                    <img
                      src={details.uploaderAvatar}
                      alt={details.uploaderName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                    {details.uploaderName[0]}
                  </div>
                )}

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={() => details.uploaderId && onSelectChannel(details.uploaderId)}
                      className="font-semibold text-xs text-zinc-200 hover:text-white cursor-pointer hover:underline"
                    >
                      {details.uploaderName}
                    </span>
                    {details.uploaderVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                  {details.subscriberCountText && (
                    <span className="text-[11px] text-zinc-500">
                      {details.subscriberCountText}
                    </span>
                  )}
                </div>

                {/* Local Follow / Subscribe Button */}
                <button
                  onClick={handleToggleSubscribe}
                  className={`ml-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSubscribed
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons (Likes, Watch Later, Save to Playlist, Share, Zen Mode) */}
              <div className="flex items-center gap-2 text-xs font-medium">
                {/* Like Count Badge */}
                {details.likeCount !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181f] text-zinc-300 border border-zinc-800">
                    <ThumbsUp className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{details.likeCount.toLocaleString()}</span>
                  </div>
                )}

                {/* Watch Later / Saved */}
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                    isSaved
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-[#18181f] text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
                  }`}
                  title="Save to Watch Later"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {/* Add to Custom Playlist */}
                <button
                  onClick={() => onAddToPlaylist(details)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181f] text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-all"
                  title="Add to Playlist"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Playlist</span>
                </button>

                {/* Share / Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181f] text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-all"
                  title="Copy Video URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Expandable Description Box */}
            {details.description && (
              <div className="rounded-2xl bg-[#141418] p-3.5 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 mb-1.5">
                  {details.views !== undefined && <span>{details.views.toLocaleString()} views</span>}
                  {details.uploadedDate && <span>• {details.uploadedDate}</span>}
                  {details.genre && <span className="text-zinc-500">#{details.genre}</span>}
                </div>

                <div className={showFullDesc ? '' : 'line-clamp-3'}>
                  <p className="whitespace-pre-line font-normal text-zinc-300">
                    {details.description}
                  </p>
                </div>

                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-2 text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                >
                  <span>{showFullDesc ? 'Show less' : 'Show more'}</span>
                  {showFullDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            )}

            {/* Comments Section (collapsible / hideable) */}
            {!hideComments && <CommentSection videoId={videoId} zenMode={zenMode} />}
          </div>
        </div>

        {/* Right Column: Related Videos / Next Up */}
        {(!zenMode && !hideRecommendations) && (
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Related Videos
              </span>
              <button
                onClick={onToggleZenMode}
                className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Hide recommendations"
              >
                <Sparkles className="w-3 h-3" />
                <span>Zen Mode</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {(details.relatedVideos || []).slice(0, 15).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectVideo(rel)}
                  className="flex gap-2.5 p-2 rounded-xl bg-[#121216]/50 hover:bg-[#18181f] border border-transparent hover:border-zinc-800 transition-all cursor-pointer group"
                >
                  <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={rel.thumbnailUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {rel.durationFormatted && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-zinc-200 px-1 rounded">
                        {rel.durationFormatted}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-start overflow-hidden flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400 mt-1 truncate">
                      {rel.uploaderName}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {rel.views ? `${youtubeApi.formatViews(rel.views)}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
