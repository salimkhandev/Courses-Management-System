'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface UserStatus {
  status: string;
  accessExpiresAt: string | null;
  enrolledCourseIds: string[];
  payment: {
    status: string;
    amount: number;
    paymentMethod: string;
    submittedAt: string;
    reviewedAt: string | null;
    adminNote: string;
    courseId: string;
  } | null;
}

export default function PendingPaymentClient() {
  const router = useRouter();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check status on page load only
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (!res.ok) throw new Error('Failed to check status');
        
        const data: UserStatus = await res.json();
        setUserStatus(data);
        setLoading(false);

        // If status is already paid, redirect to dashboard immediately
        if (data.status === 'paid') {
          router.replace('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Error checking status:', err);
        setError('Failed to check payment status. Please refresh the page.');
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    
    fetch('/api/user/status')
      .then(res => res.json())
      .then((data: UserStatus) => {
        setUserStatus(data);
        setLoading(false);
        
        if (data.status === 'paid') {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        setError('Failed to refresh status. Please try again.');
        setLoading(false);
      });
  };

  const getTimeSinceSubmission = () => {
    if (!userStatus?.payment?.submittedAt) return '';
    const submitted = new Date(userStatus.payment.submittedAt);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMins % 60} minute${diffMins % 60 > 1 ? 's' : ''}`;
    }
    return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  };

  if (loading && !userStatus) {
    return (
      <div className="card text-center py-10">
        <div className="spinner" style={{ margin: '2rem auto' }} />
        <p className="text-secondary">Loading payment status...</p>
      </div>
    );
  }

  // Handle rejected status
  if (userStatus?.status === 'rejected') {
    return (
      <div className="card text-center py-10 max-w-lg mx-auto">
        <div 
          style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            display: 'inline-flex',
            background: '#fee2e2',
            padding: '1.5rem',
            borderRadius: '50%'
          }}
        >
          <XCircle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Payment Verification Failed
        </h1>
        
        <div className="alert-error text-sm mb-6 text-left">
          <p className="font-semibold mb-2">Your payment was not approved.</p>
          {userStatus.payment?.adminNote && (
            <p className="mb-2"><strong>Reason:</strong> {userStatus.payment.adminNote}</p>
          )}
          <p>Please review the reason above and submit a new payment screenshot.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/payment"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}
          >
            Submit New Payment
          </Link>
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="text-sm font-medium hover:underline mt-4"
            style={{ color: 'var(--brand-400)', alignSelf: 'center' }}
          >
            Sign Out
          </Link>
        </div>
      </div>
    );
  }

  // Handle approved/paid status (should redirect, but show fallback)
  if (userStatus?.status === 'paid') {
    return (
      <div className="card text-center py-10">
        <div 
          style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            display: 'inline-flex',
            background: '#dcfce7',
            padding: '1.5rem',
            borderRadius: '50%'
          }}
        >
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Payment Verified!
        </h1>
        <p className="text-secondary mb-6">
          Your payment has been verified and your account is now active.
        </p>
        <Link
          href="/dashboard"
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Default pending state
  return (
    <div className="card text-center py-10 max-w-lg mx-auto">
      <div 
        style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          display: 'inline-flex',
          background: 'var(--surface-2)',
          padding: '1.5rem',
          borderRadius: '50%'
        }}
      >
        <Clock className="w-16 h-16 text-amber-500" />
      </div>
      
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        Payment Under Review
      </h1>
      
      <p className="text-secondary mb-6 max-w-md mx-auto line-height-relaxed">
        We have received your payment submission. Our team is currently verifying the details. 
        This usually takes between 1-12 hours during business days.
      </p>
      
      {/* Payment Details */}
      {userStatus?.payment && (
        <div className="card mb-6 text-left" style={{ background: 'var(--surface-2)', padding: '1rem' }}>
          <h3 className="font-semibold mb-3 text-sm">Payment Details</h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <div><strong>Amount:</strong> Rs. {userStatus.payment.amount.toLocaleString()}</div>
            <div><strong>Method:</strong> {userStatus.payment.paymentMethod}</div>
            <div><strong>Submitted:</strong> {getTimeSinceSubmission()} ago</div>
          </div>
        </div>
      )}
      
      {/* Status Info */}
      <div className="alert-info text-sm mb-6 inline-block text-left">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4" />
          <span className="font-semibold">Manual Refresh Required</span>
        </div>
        <p className="text-xs mb-2">
          Please refresh this page periodically to check if your payment has been verified.
        </p>
        <p className="text-xs">
          Once your payment is approved, you'll be automatically redirected to your dashboard.
        </p>
      </div>

      {error && (
        <div className="alert-error text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4 justify-center items-center">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-primary"
          style={{ 
            textDecoration: 'none', 
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            opacity: loading ? 0.7 : 1
          }}
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
        
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--brand-400)' }}
        >
          Sign Out
        </Link>
      </div>

      {/* Contact Info */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-muted mb-2">
          Taking longer than expected? Contact us for support:
        </p>
        <div className="text-sm space-y-1">
          <a 
            href="https://wa.me/923425015034" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-amber-600 transition-colors"
          >
            WhatsApp: 0342-5015034
          </a>
          <br />
          <a 
            href="mailto:engluqmanhafeez@gmail.com"
            className="hover:text-amber-600 transition-colors"
          >
            engluqmanhafeez@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}