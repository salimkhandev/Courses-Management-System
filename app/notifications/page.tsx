'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Bell, ThumbsUp, Heart, PartyPopper, Lightbulb, 
  MessageSquare, Send, Image as ImageIcon, LogIn
} from 'lucide-react';
import Link from 'next/link';

interface Reaction {
  userId: string;
  type: 'like' | 'love' | 'celebrate' | 'insightful';
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  reactions: Reaction[];
  replies?: Comment[];
}

interface NotificationPost {
  _id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  attachments?: string[];
  comments: Comment[];
  reactions: Reaction[];
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export default function PublicNotificationsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<NotificationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (postId: string, reactionType: 'like' | 'love' | 'celebrate' | 'insightful') => {
    if (!session) {
      setMessage('Please login to react to posts');
      return;
    }

    try {
      const res = await fetch(`/api/notifications/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reactionType }),
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!session) {
      setMessage('Please login to comment');
      return;
    }

    const content = commentInputs[postId];
    if (!content?.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/notifications/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReply = async (postId: string, commentId: string) => {
    if (!session) {
      setMessage('Please login to reply');
      return;
    }

    const content = replyInputs[commentId];
    if (!content?.trim()) return;

    setSubmittingReply(prev => ({ ...prev, [commentId]: true }));

    try {
      const res = await fetch(`/api/notifications/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
        
        // Update the posts state with the updated post
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? updatedPost : post
          )
        );
      } else {
        console.error('Failed to add reply:', await res.text());
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'love':
        return <Heart className="w-4 h-4" />;
      case 'celebrate':
        return <PartyPopper className="w-4 h-4" />;
      case 'insightful':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <ThumbsUp className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getReactionCount = (reactions: Reaction[], type: string) => {
    return reactions.filter(r => r.type === type).length;
  };

  const hasUserReacted = (reactions: Reaction[], type: string) => {
    return reactions.some(r => r.type === type && r.userId === session?.user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8" /> Notifications
          </h1>
          <p className="text-slate-600">Stay updated with announcements and important information</p>
        </div>

        {!session && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Login to interact with posts</p>
                <p className="text-xs text-blue-700">React, comment, and engage with notifications</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Login
            </Link>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            {message}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No notifications yet. Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="card p-6">
                {/* Post Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(post.priority)}`}>
                        {post.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      By {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`/api/files/${attachment}`}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => handleReact(post._id, 'like')}
                    disabled={!session}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !session 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : hasUserReacted(post.reactions, 'like')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'like')}</span>
                  </button>
                  <button
                    onClick={() => handleReact(post._id, 'love')}
                    disabled={!session}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !session 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : hasUserReacted(post.reactions, 'love')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'love')}</span>
                  </button>
                  <button
                    onClick={() => handleReact(post._id, 'celebrate')}
                    disabled={!session}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !session 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : hasUserReacted(post.reactions, 'celebrate')
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <PartyPopper className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'celebrate')}</span>
                  </button>
                  <button
                    onClick={() => handleReact(post._id, 'insightful')}
                    disabled={!session}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !session 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : hasUserReacted(post.reactions, 'insightful')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'insightful')}</span>
                  </button>
                </div>

                {/* Comments Section */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900">Comments ({post.comments.length})</span>
                  </div>

                  {/* Comment Input */}
                  {session ? (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        disabled={submittingComment[post._id]}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingComment[post._id] ? '...' : <><Send className="w-4 h-4" /> Post</>}
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg text-center">
                      <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                        Login to comment
                      </Link>
                    </div>
                  )}

                  {/* Comments List */}
                  {post.comments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  ) : (
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-900">{comment.userName}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm">{comment.content}</p>
                          
                          {/* Comment Reactions */}
                          {comment.reactions.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {comment.reactions.slice(0, 3).map((reaction, idx) => (
                                <span key={idx} className="text-xs">
                                  {getReactionIcon(reaction.type)}
                                </span>
                              ))}
                              {comment.reactions.length > 3 && (
                                <span className="text-xs text-slate-500">+{comment.reactions.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Reply Input */}
                          {session ? (
                            <div className="flex gap-2 mt-3">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyInputs[comment._id] || ''}
                                onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleReply(post._id, comment._id)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                              />
                              <button
                                onClick={() => handleReply(post._id, comment._id)}
                                disabled={submittingReply[comment._id]}
                                className="px-3 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                              >
                                {submittingReply[comment._id] ? '...' : <><Send className="w-3 h-3" /> Reply</>}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 p-2 bg-slate-100 rounded-lg text-center">
                              <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium text-xs">
                                Login to reply
                              </Link>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                            <div className="mt-3 ml-4 space-y-2 border-l-2 border-slate-200 pl-3">
                              {comment.replies.map((reply, index) => (
                                <div key={reply._id || index} className="bg-white rounded-lg p-2">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-900 text-sm">{reply.userName}</span>
                                    <span className="text-xs text-slate-500">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 text-xs">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}