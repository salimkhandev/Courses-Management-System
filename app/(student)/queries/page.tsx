'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, ThumbsUp, Send, AlertCircle } from 'lucide-react';

interface Query {
  _id: string;
  subject: string;
  question: string;
  answer?: string;
  status: 'open' | 'answered' | 'closed';
  isPublic: boolean;
  likes: number;
  createdAt: string;
  answeredAt?: string;
}

export default function QueriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queries, setQueries] = useState<Query[]>([]);
  const [myQueries, setMyQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'my' | 'ask'>('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    question: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchQueries();
    }
  }, [status, router]);

  const fetchQueries = async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        fetch('/api/queries?public=true'),
        fetch('/api/queries/my'),
      ]);

      if (publicRes.ok) {
        const publicData = await publicRes.json();
        setQueries(publicData);
      }

      if (myRes.ok) {
        const myData = await myRes.json();
        setMyQueries(myData);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.question) {
      setMessage('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Question submitted successfully!');
        setFormData({ subject: '', question: '' });
        setShowForm(false);
        fetchQueries();
      } else {
        setMessage(data.error || 'Failed to submit question');
      }
    } catch (error) {
      setMessage('An error occurred while submitting your question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (queryId: string) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchQueries();
      }
    } catch (error) {
      console.error('Failed to like query:', error);
    }
  };

  const filteredQueries = queries.filter(q =>
    q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Queries & FAQ</h1>
          <p className="text-slate-600">Ask questions and find answers about courses and physical classes</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'public' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Public FAQ
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            My Questions
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'ask' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Ask Question
          </button>
        </div>

        {activeTab === 'public' && (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredQueries.length === 0 ? (
              <div className="card p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {searchTerm ? 'No questions match your search' : 'No public questions yet. Be the first to ask!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQueries.map((query) => (
                  <div key={query._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{query.subject}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(query.status)}`}>
                        {query.status}
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4">{query.question}</p>

                    {query.answer && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Answer:</p>
                        <p className="text-slate-700">{query.answer}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                        {query.answeredAt && (
                          <span>Answered {new Date(query.answeredAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleLike(query._id)}
                        className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{query.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div>
            {myQueries.length === 0 ? (
              <div className="card p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">You haven't asked any questions yet.</p>
                <button
                  onClick={() => setActiveTab('ask')}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                  Ask Your First Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myQueries.map((query) => (
                  <div key={query._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{query.subject}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(query.status)}`}>
                        {query.status}
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4">{query.question}</p>

                    {query.answer ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Answer:</p>
                        <p className="text-slate-700">{query.answer}</p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Waiting for response...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Asked {new Date(query.createdAt).toLocaleDateString()}</span>
                      {query.answeredAt && (
                        <span>Answered {new Date(query.answeredAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ask' && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Ask a Question</h2>
              
              <form onSubmit={handleSubmitQuery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Course enrollment, Payment issues, Class schedule"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Question *
                  </label>
                  <textarea
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Describe your question in detail..."
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('public');
                      setFormData({ subject: '', question: '' });
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
                    {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Question</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Well-structured questions get faster answers. Be specific about your issue and include relevant details like course name, payment reference, etc.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}