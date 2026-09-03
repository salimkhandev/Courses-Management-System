'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, CheckCircle, XCircle, Star, Eye, EyeOff, 
  Filter, Search, Image as ImageIcon, DollarSign, Award, Clock
} from 'lucide-react';

interface SuccessStory {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentWhatsapp?: string;
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
}

export default function AdminSuccessStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState('');

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
      fetchStories();
    }
  }, [status, session, router]);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/admin/success-stories');
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storyId: string) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${storyId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        setMessage('Story approved successfully');
        fetchStories();
      }
    } catch (error) {
      console.error('Failed to approve story:', error);
    }
  };

  const handleReject = async (storyId: string) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${storyId}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        setMessage('Story rejected');
        fetchStories();
      }
    } catch (error) {
      console.error('Failed to reject story:', error);
    }
  };

  const handleToggleFeatured = async (storyId: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${storyId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (res.ok) {
        fetchStories();
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    const matchesSearch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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

  const getStats = () => {
    const total = stories.length;
    const pending = stories.filter(s => s.status === 'pending').length;
    const approved = stories.filter(s => s.status === 'approved').length;
    const featured = stories.filter(s => s.featured).length;

    return { total, pending, approved, featured };
  };

  const stats = getStats();

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
            <TrendingUp className="w-8 h-8" /> Success Stories Management
          </h1>
          <p className="text-slate-600">Moderate and manage student success stories</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Stories</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-slate-600">Pending Review</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-slate-600">Approved</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
            <div className="text-sm text-slate-600">Featured</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stories List */}
        {stories.length === 0 ? (
          <div className="card p-8 text-center">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No success stories submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStories.map((story) => (
              <div key={story._id} className={`card p-6 ${story.featured ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{story.title}</h3>
                      {story.featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⭐ Featured
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(story.status)}`}>
                        {story.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      By {story.studentName} ({story.studentEmail})
                      {story.studentWhatsapp && ` • ${story.studentWhatsapp}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      Submitted {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeatured(story._id, story.featured)}
                      className={`p-2 rounded-lg transition-colors ${story.featured ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:bg-slate-100'}`}
                      title={story.featured ? 'Remove from featured' : 'Feature this story'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStory(story);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 line-clamp-2">{story.content}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                  {story.salesAmount && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{story.salesAmount.toLocaleString()} sales</span>
                    </div>
                  )}
                  {story.platform && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="w-4 h-4" />
                      <span>{story.platform}</span>
                    </div>
                  )}
                  {story.timeframe && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{story.timeframe}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{story.likes} likes</span>
                  </div>
                </div>

                {story.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>{story.images.length} image(s)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {story.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={`/api/files/${image}`}
                          alt={`Story image ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => window.open(`/api/files/${image}`, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {story.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleApprove(story._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(story._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedStory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{selectedStory.title}</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedStory(null);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <EyeOff className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2"><strong>Student:</strong> {selectedStory.studentName}</p>
                  <p className="text-sm text-slate-600 mb-2"><strong>Email:</strong> {selectedStory.studentEmail}</p>
                  {selectedStory.studentWhatsapp && (
                    <p className="text-sm text-slate-600 mb-2"><strong>WhatsApp:</strong> {selectedStory.studentWhatsapp}</p>
                  )}
                  <p className="text-sm text-slate-600"><strong>Submitted:</strong> {new Date(selectedStory.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Story</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedStory.content}</p>
                </div>

                {selectedStory.salesAmount && (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-lg">{selectedStory.salesAmount.toLocaleString()} sales</span>
                  </div>
                )}

                {selectedStory.platform && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-5 h-5" />
                    <span className="text-lg">{selectedStory.platform}</span>
                  </div>
                )}

                {selectedStory.timeframe && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg">{selectedStory.timeframe}</span>
                  </div>
                )}

                {selectedStory.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Images</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedStory.images.map((image, index) => (
                        <img
                          key={index}
                          src={`/api/files/${image}`}
                          alt={`Story image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => window.open(`/api/files/${image}`, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedStory.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        handleApprove(selectedStory._id);
                        setShowDetailModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedStory._id);
                        setShowDetailModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}