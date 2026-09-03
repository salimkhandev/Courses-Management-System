'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PhysicalClass {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  schedule: string;
  totalSeats: number;
  availableSeats: number;
  fee: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  instructor: string;
}

interface Registration {
  _id: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentScreenshot?: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
}

export default function PhysicalClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<PhysicalClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<PhysicalClass | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    paymentScreenshot: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchClasses();
      fetchRegistrations();
    }
  }, [status, router]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/physical-classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/physical-classes/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const handleRegister = (classData: PhysicalClass) => {
    setSelectedClass(classData);
    setShowRegistrationForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, paymentScreenshot: e.target.files[0] });
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !formData.paymentScreenshot) {
      setMessage('Please upload payment screenshot');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('classId', selectedClass._id);
      formDataToSend.append('paymentScreenshot', formData.paymentScreenshot);

      const res = await fetch('/api/physical-classes/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration submitted successfully! Please wait for admin approval.');
        setShowRegistrationForm(false);
        setFormData({ paymentScreenshot: null });
        fetchRegistrations();
        fetchClasses();
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  const getRegistrationStatus = (classId: string) => {
    return registrations.find(reg => reg.classId === classId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Physical Classes</h1>
          <p className="text-slate-600">Join our in-person training sessions at Al Haj Tower, Peshawar</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Current Registrations */}
        {registrations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">My Registrations</h2>
            <div className="grid gap-4">
              {registrations.map((reg) => {
                const classData = classes.find(c => c._id === reg.classId);
                if (!classData) return null;
                
                return (
                  <div key={reg._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{classData.title}</h3>
                        <p className="text-slate-600">{classData.description}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(reg.status)}`}>
                        {getStatusIcon(reg.status)}
                        <span className="font-medium capitalize">{reg.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(classData.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{classData.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{classData.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Paid: PKR {reg.paidAmount.toLocaleString()} / {reg.totalFee.toLocaleString()}</span>
                      </div>
                    </div>

                    {reg.remainingAmount > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-amber-800 font-medium">
                          Remaining: PKR {reg.remainingAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Classes */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Batches</h2>
          {classes.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-600">No physical classes scheduled at the moment. Check back later!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classData) => {
                const registration = getRegistrationStatus(classData._id);
                const isFull = classData.availableSeats === 0;
                const isRegistered = !!registration;

                return (
                  <div key={classData._id} className="card overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{classData.title}</h3>
                        {isRegistered && getStatusIcon(registration?.status || '')}
                      </div>
                      
                      <p className="text-slate-600 mb-4 line-clamp-2">{classData.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(classData.startDate).toLocaleDateString()} - {new Date(classData.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{classData.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{classData.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>{classData.availableSeats} / {classData.totalSeats} seats available</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">PKR {classData.fee.toLocaleString()}</span>
                        </div>
                      </div>

                      {isRegistered ? (
                        <div className={`px-4 py-2 rounded-lg text-center font-medium ${getStatusColor(registration?.status || '')}`}>
                          {registration?.status === 'pending' && 'Registration Pending Approval'}
                          {registration?.status === 'approved' && 'Registration Approved'}
                          {registration?.status === 'rejected' && 'Registration Rejected'}
                          {registration?.status === 'completed' && 'Course Completed'}
                        </div>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                        >
                          Class Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(classData)}
                          className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registration Modal */}
        {showRegistrationForm && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Register for {selectedClass.title}</h2>
              
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2"><strong>Fee:</strong> PKR {selectedClass.fee.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mb-2"><strong>Location:</strong> {selectedClass.location}</p>
                <p className="text-sm text-slate-600"><strong>Schedule:</strong> {selectedClass.schedule}</p>
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Upload screenshot of your payment receipt</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationForm(false);
                      setSelectedClass(null);
                      setFormData({ paymentScreenshot: null });
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}