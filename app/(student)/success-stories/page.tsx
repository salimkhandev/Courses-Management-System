'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, DollarSign, Clock, Star, Plus, Image as ImageIcon, 
  Send, ThumbsUp, Award, Calendar, User, MapPin
} from 'lucide-react';

interface SuccessStory {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentWhatsapp?: string;
  studentImagePath?: string;
  title: string;
  content: string;
  images: string[];
  salesAmount?: number;
  platform?: string;
  timeframe?: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  featured: boolean;
  createdAt: string;
  hasLiked?: boolean;
}

export default function SuccessStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [myStories, setMyStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'submit'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    salesAmount: '',
    platform: '',
    timeframe: '',
    images: [] as File[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchStories();
    }
  }, [status, router]);

  const fetchStories = async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        fetch('/api/success-stories'),
        fetch('/api/success-stories/my'),
      ]);

      if (publicRes.ok) {
        const publicData = await publicRes.json();
        setStories(publicData);
      }

      if (myRes.ok) {
        const myData = await myRes.json();
        setMyStories(myData);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
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
      if (formData.salesAmount) formDataToSend.append('salesAmount', formData.salesAmount);
      if (formData.platform) formDataToSend.append('platform', formData.platform);
      if (formData.timeframe) formDataToSend.append('timeframe', formData.timeframe);
      
      formData.images.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const res = await fetch('/api/success-stories', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Success story submitted successfully! It will be reviewed before being published.');
        setFormData({
          title: '',
          content: '',
          salesAmount: '',
          platform: '',
          timeframe: '',
          images: [],
        });
        setShowForm(false);
        fetchStories();
      } else {
        setMessage(data.error || 'Failed to submit story');
      }
    } catch (error) {
      setMessage('An error occurred while submitting your story');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (storyId: string) => {
    try {
      const res = await fetch(`/api/success-stories/${storyId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchStories();
      }
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: [...formData.images, ...files] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8" /> Success Stories
          </h1>
          <p className="text-slate-600">See how our students are achieving success and share your own journey</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Stories
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            My Stories
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'submit' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Share Your Story
          </button>
        </div>

        {activeTab === 'all' && (
          <div>
            {stories.length === 0 ? (
              <div className="card p-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No success stories yet. Be the first to share your achievements!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <div key={story._id} className={`card overflow-hidden ${story.featured ? 'ring-2 ring-amber-500' : ''}`}>
                    {story.featured && (
                      <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium">
                        ⭐ Featured Story
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {story.studentImagePath ? (
                          <img
                            src={`/api/files/${story.studentImagePath}`}
                            alt={story.studentName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900">{story.studentName}</h3>
                          <p className="text-sm text-slate-500">{new Date(story.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mb-2">{story.title}</h4>
                      <p className="text-slate-600 mb-4 line-clamp-3">{story.content}</p>

                      {story.salesAmount && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{story.salesAmount.toLocaleString()} sales</span>
                        </div>
                      )}

                      {story.platform && (
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                          <Award className="w-4 h-4" />
                          <span>{story.platform}</span>
                        </div>
                      )}

                      {story.timeframe && (
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                          <Clock className="w-4 h-4" />
                          <span>{story.timeframe}</span>
                        </div>
                      )}

                      {story.images.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          {story.images.slice(0, 4).map((image, index) => (
                            <img
                              key={index}
                              src={`/api/files/${image}`}
                              alt={`Story image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <button
                          onClick={() => handleLike(story._id)}
                          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                            story.hasLiked ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{story.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div>
            {myStories.length === 0 ? (
              <div className="card p-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">You haven't shared any success stories yet.</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                  Share Your First Story
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories.map((story) => (
                  <div key={story._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{story.title}</h3>
                        <p className="text-sm text-slate-500">
                          Submitted {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(story.status)}`}>
                        {story.status}
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4">{story.content}</p>

                    {story.salesAmount && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{story.salesAmount.toLocaleString()} sales</span>
                      </div>
                    )}

                    {story.images.length > 0 && (
                      <div className="mb-4 grid grid-cols-4 gap-2">
                        {story.images.map((image, index) => (
                          <img
                            key={index}
                            src={`/api/files/${image}`}
                            alt={`Story image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{story.likes} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Share Your Success Story</h2>
              
              <form onSubmit={handleSubmitStory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., How I Made $10,000 in 3 Months"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Story *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Share your journey, challenges, and how you achieved success..."
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sales Amount (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.salesAmount}
                      onChange={(e) => setFormData({ ...formData, salesAmount: e.target.value })}
                      placeholder="e.g., 10000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Platform (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      placeholder="e.g., Amazon, eBay"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timeframe (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    placeholder="e.g., 3 months, 6 months"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Images (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Upload screenshots of your sales dashboard, product listings, etc.</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Selected images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setFormData({
                        title: '',
                        content: '',
                        salesAmount: '',
                        platform: '',
                        timeframe: '',
                        images: [],
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
                    {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Story</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Guidelines:</strong> Share your authentic journey with specific numbers and results. Include screenshots when possible. Your story will be reviewed before being published to inspire others.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}