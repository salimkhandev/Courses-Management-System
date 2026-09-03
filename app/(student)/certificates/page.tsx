'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Award, Download, ExternalLink, Calendar, BookOpen, User, CheckCircle } from 'lucide-react';

interface Certificate {
  _id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  instructorName: string;
  certificateId: string;
  verificationCode: string;
  certificateImagePath?: string;
  type: 'online' | 'physical';
}

export default function StudentCertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchCertificates();
    }
  }, [status, router]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
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

  const handleDownload = (certificate: Certificate) => {
    if (certificate.certificateImagePath) {
      window.open(`/api/files/${certificate.certificateImagePath}`, '_blank');
    }
  };

  const handleVerify = (verificationCode: string) => {
    window.open(`/verify/${verificationCode}`, '_blank');
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
            <Award className="w-8 h-8" /> My Certificates
          </h1>
          <p className="text-slate-600">View and download your course completion certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className="card p-8 text-center">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">You haven't earned any certificates yet.</p>
            <p className="text-sm text-slate-500">Complete your courses to receive certificates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {certificates.map((certificate) => (
              <div key={certificate._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{certificate.courseName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        certificate.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {certificate.type === 'online' ? 'Online Course' : 'Physical Class'}
                      </span>
                    </div>
                    <p className="text-slate-600">Issued to {certificate.studentName}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {certificate.certificateImagePath && (
                      <button
                        onClick={() => handleDownload(certificate)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    )}
                    <button
                      onClick={() => handleVerify(certificate.verificationCode)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Verify
                    </button>
                  </div>
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

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verified Certificate</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm text-slate-600">
                    <strong>Verification Code:</strong> {certificate.verificationCode}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Use this code to verify the authenticity of this certificate
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