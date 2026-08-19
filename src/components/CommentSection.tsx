import React, { useState, useEffect } from 'react';
import { ThumbsUp, Heart, Pin, MessageSquare, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Comment } from '../types';
import { youtubeApi } from '../services/api';

interface CommentSectionProps {
  videoId: string;
  zenMode?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId, zenMode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    youtubeApi
      .getComments(videoId)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  if (zenMode) {
    return (
      <div className="p-4 rounded-2xl bg-[#121216]/50 border border-zinc-800/80 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-red-400" />
        <span>Comments are hidden in Zen Mode to minimize distractions</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#121216]/50 border border-zinc-800/80 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Comments {comments.length > 0 && `(${comments.length})`}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {/* Comment List */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-800/40">
          {loading ? (
            <div className="py-6 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-zinc-800" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-28 bg-zinc-800 rounded" />
                    <div className="h-3 w-full bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No comments available for this video or comments are disabled.
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-xs">
                  {/* Author Avatar */}
                  {comment.authorThumb ? (
                    <img
                      src={comment.authorThumb}
                      alt={comment.author}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0 mt-0.5">
                      {comment.author[0]}
                    </div>
                  )}

                  {/* Comment Body */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300">{comment.author}</span>
                      <span className="text-[10px] text-zinc-500">{comment.publishedText}</span>
                      {comment.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-300 mt-1 leading-relaxed break-words">
                      {comment.content}
                    </p>

                    {/* Likes & Hearts */}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                      {comment.likeCount > 0 && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likeCount.toLocaleString()}</span>
                        </div>
                      )}
                      {comment.isHearted && (
                        <div className="flex items-center gap-1 text-red-400" title="Loved by creator">
                          <Heart className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
