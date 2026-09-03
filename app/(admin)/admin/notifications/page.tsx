'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Plus, ImageIcon, Send, Trash2, Edit, 
  ThumbsUp, Heart, PartyPopper, Lightbulb, MessageSquare
} from 'lucide-react';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  reactions: any[];
  replies?: Comment[];
}

interface NotificationPost {
  _id: string;
  title: string;
  content: string;
  attachments?: string[];
  priority: 'normal' | 'important' | 'urgent';
  comments: Comment[];
  reactions: any[];
  isActive: boolean;
  createdAt: string;
  authorName: string;
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<NotificationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<NotificationPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    attachments: [] as File[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchPosts();
    }
  }, [status, session, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('priority', formData.priority);
      
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const url = editingPost 
        ? `/api/admin/notifications/${editingPost._id}`
        : '/api/admin/notifications';
      
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
        setShowForm(false);
        setEditingPost(null);
        setFormData({
          title: '',
          content: '',
          priority: 'normal',
          attachments: [],
        });
        fetchPosts();
      } else {
        setMessage(data.error || 'Failed to save post');
      }
    } catch (error) {
      setMessage('An error occurred while saving the post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post: NotificationPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      priority: post.priority,
      attachments: [],
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleToggleActive = async (postId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/notifications/${postId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to toggle post status:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
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

  const getReactionCount = (reactions: any[], type: string) => {
    return reactions.filter((r: any) => r.type === type).length;
  };

  const handleReply = async (postId: string, commentId: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Bell className="w-8 h-8" /> Notification Management
            </h1>
            <p className="text-slate-600">Create and manage announcements for students</p>
          </div>
          <button
            onClick={() => {
              setEditingPost(null);
              setFormData({
                title: '',
                content: '',
                priority: 'normal',
                attachments: [],
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Content *</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Upload images to attach to the post</p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Selected files:</p>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                        <span className="text-sm text-slate-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                      setFormData({
                        title: '',
                        content: '',
                        priority: 'normal',
                        attachments: [],
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Saving...' : <><Send className="w-4 h-4" /> {editingPost ? 'Update' : 'Publish'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No posts created yet. Create your first announcement!</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {posts.map((post) => (
              <div key={post._id} className={`card p-6 ${!post.isActive ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(post.priority)}`}>
                        {post.priority}
                      </span>
                      {!post.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      By {post.authorName} • {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(post._id, post.isActive)}
                      className={`p-2 rounded-lg transition-colors ${post.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {post.isActive ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

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

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'like')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Heart className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'love')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <PartyPopper className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'celebrate')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lightbulb className="w-4 h-4" />
                    <span>{getReactionCount(post.reactions, 'insightful')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Comments ({post.comments.length})</span>
                    </div>
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
                          
                          {/* Reply Input */}
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}