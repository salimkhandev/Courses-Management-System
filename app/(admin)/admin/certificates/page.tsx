'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Award, Download, Search, Filter, CheckCircle, XCircle, 
  Calendar, User, BookOpen 
} from 'lucide-react';

interface Certificate {
  _id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  instructorName: string;
  certificateId: string;
  verificationCode: string;
  studentImagePath?: string;
  certificateImagePath?: string;
  type: 'online' | 'physical';
}

export default function AdminCertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'physical'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
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
      fetchCertificates();
    }
  }, [status, session, router]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/admin/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentData: any) => {
    setIssuing(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Certificate issued successfully!');
        setShowIssueModal(false);
        setSelectedStudent(null);
        fetchCertificates();
      } else {
        setMessage(data.error || 'Failed to issue certificate');
      }
    } catch (error) {
      setMessage('An error occurred while issuing the certificate');
    } finally {
      setIssuing(false);
    }
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    if (certificate.certificateImagePath) {
      window.open(`/api/files/${certificate.certificateImagePath}`, '_blank');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || cert.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
            <Award className="w-8 h-8" /> Certificate Management
          </h1>
          <p className="text-slate-600">Issue and manage certificates for completed courses</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Search and Filter */}
        <div className="card p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, course, or certificate ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="online">Online Courses</option>
                <option value="physical">Physical Classes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-slate-900">{certificates.length}</div>
            <div className="text-sm text-slate-600">Total Certificates</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">
              {certificates.filter(c => c.type === 'online').length}
            </div>
            <div className="text-sm text-slate-600">Online Course Certificates</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {certificates.filter(c => c.type === 'physical').length}
            </div>
            <div className="text-sm text-slate-600">Physical Class Certificates</div>
          </div>
        </div>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <div className="card p-8 text-center">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No certificates issued yet. Issue certificates to students who have completed their courses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCertificates.map((certificate) => (
              <div key={certificate._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{certificate.studentName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        certificate.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {certificate.type}
                      </span>
                    </div>
                    <p className="text-slate-600">{certificate.courseName}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadCertificate(certificate)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-slate-600">
                    <div className="text-sm flex items-center gap-1">
                      <Award className="w-4 h-4" /> Certificate ID
                    </div>
                    <div className="font-medium">{certificate.certificateId}</div>
                  </div>
                  <div className="text-slate-600">
                    <div className="text-sm flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> Course
                    </div>
                    <div className="font-medium">{certificate.courseName}</div>
                  </div>
                  <div className="text-slate-600">
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Completed
                    </div>
                    <div className="font-medium">{new Date(certificate.completionDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-slate-600">
                    <div className="text-sm flex items-center gap-1">
                      <User className="w-4 h-4" /> Instructor
                    </div>
                    <div className="font-medium">{certificate.instructorName}</div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm text-slate-600">
                    <strong>Verification Code:</strong> {certificate.verificationCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}