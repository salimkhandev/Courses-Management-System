'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Users, Clock, DollarSign, Plus, 
  CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, Mail, Send
} from 'lucide-react';

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
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentScreenshot?: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  user: {
    _id: string;
    name: string;
    email: string;
    whatsapp?: string;
  };
  class: PhysicalClass;
}

export default function AdminPhysicalClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<PhysicalClass[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'registrations'>('classes');
  const [showClassForm, setShowClassForm] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    schedule: '',
    totalSeats: '',
    fee: '',
    instructor: '',
  });

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
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [classesRes, registrationsRes] = await Promise.all([
        fetch('/api/admin/physical-classes'),
        fetch('/api/admin/physical-classes/registrations'),
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (registrationsRes.ok) {
        const registrationsData = await registrationsRes.json();
        setRegistrations(registrationsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/physical-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...classForm,
          totalSeats: parseInt(classForm.totalSeats),
          fee: parseInt(classForm.fee),
          availableSeats: parseInt(classForm.totalSeats),
          startDate: new Date(classForm.startDate),
          endDate: new Date(classForm.endDate),
        }),
      });

      if (res.ok) {
        setShowClassForm(false);
        setClassForm({
          title: '',
          description: '',
          location: '',
          startDate: '',
          endDate: '',
          schedule: '',
          totalSeats: '',
          fee: '',
          instructor: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      const res = await fetch(`/api/admin/physical-classes/registrations/${registrationId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to approve registration:', error);
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const res = await fetch(`/api/admin/physical-classes/registrations/${registrationId}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
  };

  const handleSendReminder = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowReminderModal(true);
  };

  const sendWhatsAppReminder = () => {
    if (!selectedRegistration) return;

    const { user, class: classData, remainingAmount, paidAmount, totalFee } = selectedRegistration;
    const message = `Dear ${user.name},\n\nThis is a friendly reminder about your registration for ${classData.title}.\n\nPayment Status:\n- Total Fee: PKR ${totalFee.toLocaleString()}\n- Paid: PKR ${paidAmount.toLocaleString()}\n- Remaining: PKR ${remainingAmount.toLocaleString()}\n\nPlease complete your payment to secure your seat.\n\nClass Details:\n- Location: ${classData.location}\n- Schedule: ${classData.schedule}\n- Start Date: ${new Date(classData.startDate).toLocaleDateString()}\n\nThank you!\nEng Luqman Hafeez Academy`;

    const whatsappNumber = user.whatsapp || user.email;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowReminderModal(false);
  };

  const sendEmailReminder = () => {
    if (!selectedRegistration) return;

    const { user, class: classData, remainingAmount, paidAmount, totalFee } = selectedRegistration;
    const subject = `Payment Reminder - ${classData.title}`;
    const body = `Dear ${user.name},\n\nThis is a friendly reminder about your registration for ${classData.title}.\n\nPayment Status:\n- Total Fee: PKR ${totalFee.toLocaleString()}\n- Paid: PKR ${paidAmount.toLocaleString()}\n- Remaining: PKR ${remainingAmount.toLocaleString()}\n\nPlease complete your payment to secure your seat.\n\nClass Details:\n- Location: ${classData.location}\n- Schedule: ${classData.schedule}\n- Start Date: ${new Date(classData.startDate).toLocaleDateString()}\n\nThank you!\nEng Luqman Hafeez Academy`;

    const mailtoUrl = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setShowReminderModal(false);
  };

  const getStats = () => {
    const totalRegistrations = registrations.length;
    const paidRegistrations = registrations.filter(r => r.remainingAmount === 0).length;
    const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;
    const totalRevenue = registrations.reduce((sum, r) => sum + r.paidAmount, 0);
    const pendingRevenue = registrations.reduce((sum, r) => sum + r.remainingAmount, 0);

    return { totalRegistrations, paidRegistrations, pendingRegistrations, totalRevenue, pendingRevenue };
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Physical Classes Management</h1>
          <p className="text-slate-600">Manage in-person training sessions and student registrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.totalRegistrations}</div>
            <div className="text-sm text-slate-600">Total Registrations</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">{stats.paidRegistrations}</div>
            <div className="text-sm text-slate-600">Fully Paid</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pendingRegistrations}</div>
            <div className="text-sm text-slate-600">Pending Approval</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-slate-900">PKR {stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-amber-600">PKR {stats.pendingRevenue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Pending Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'classes' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'registrations' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Registrations
          </button>
        </div>

        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Classes</h2>
              <button
                onClick={() => setShowClassForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Class
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-600">No classes created yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classData) => (
                  <div key={classData._id} className="card p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{classData.title}</h3>
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
                        <span>{classData.availableSeats} / {classData.totalSeats} seats</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">PKR {classData.fee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-center text-sm font-medium ${
                      classData.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      classData.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      classData.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {classData.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Registrations</h2>
            
            {registrations.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-600">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{registration.user.name}</h3>
                        <p className="text-slate-600">{registration.user.email}</p>
                        {registration.user.whatsapp && (
                          <p className="text-slate-600">{registration.user.whatsapp}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        registration.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        registration.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {registration.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                        {registration.status === 'rejected' && <XCircle className="w-4 h-4" />}
                        {registration.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                        <span className="font-medium capitalize">{registration.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-slate-600">
                        <div className="text-sm">Class</div>
                        <div className="font-medium">{registration.class.title}</div>
                      </div>
                      <div className="text-slate-600">
                        <div className="text-sm">Total Fee</div>
                        <div className="font-medium">PKR {registration.totalFee.toLocaleString()}</div>
                      </div>
                      <div className="text-slate-600">
                        <div className="text-sm">Paid</div>
                        <div className="font-medium text-green-600">PKR {registration.paidAmount.toLocaleString()}</div>
                      </div>
                      <div className="text-slate-600">
                        <div className="text-sm">Remaining</div>
                        <div className="font-medium text-amber-600">PKR {registration.remainingAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    {registration.paymentScreenshot && (
                      <div className="mb-4">
                        <button
                          onClick={() => window.open(`/api/files/${registration.paymentScreenshot}`, '_blank')}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" /> View Payment Screenshot
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {registration.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRegistration(registration._id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectRegistration(registration._id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      
                      {registration.remainingAmount > 0 && (
                        <button
                          onClick={() => handleSendReminder(registration)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                        >
                          <Send className="w-4 h-4" /> Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Class Modal */}
        {showClassForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Class</h2>
              
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={classForm.title}
                    onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea
                    required
                    value={classForm.description}
                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={classForm.location}
                    onChange={(e) => setClassForm({ ...classForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={classForm.startDate}
                      onChange={(e) => setClassForm({ ...classForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      required
                      value={classForm.endDate}
                      onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Schedule *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mon-Fri 6PM-8PM"
                    value={classForm.schedule}
                    onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total Seats *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={classForm.totalSeats}
                      onChange={(e) => setClassForm({ ...classForm, totalSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fee (PKR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={classForm.fee}
                      onChange={(e) => setClassForm({ ...classForm, fee: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Instructor *</label>
                  <input
                    type="text"
                    required
                    value={classForm.instructor}
                    onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowClassForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Send Payment Reminder</h2>
              
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2"><strong>Student:</strong> {selectedRegistration.user.name}</p>
                <p className="text-sm text-slate-600 mb-2"><strong>Class:</strong> {selectedRegistration.class.title}</p>
                <p className="text-sm text-slate-600 mb-2"><strong>Remaining:</strong> PKR {selectedRegistration.remainingAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600"><strong>Contact:</strong> {selectedRegistration.user.whatsapp || selectedRegistration.user.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendWhatsAppReminder}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  onClick={sendEmailReminder}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <button
                onClick={() => setShowReminderModal(false)}
                className="w-full mt-3 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}