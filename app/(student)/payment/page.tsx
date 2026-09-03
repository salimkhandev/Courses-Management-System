import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Payment from '@/lib/models/Payment';
import User from '@/lib/models/User';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  await connectDB();
  
  // Check user status first
  const user = await User.findById(session.user.id).select('status');
  
  // If user is already paid, redirect to dashboard
  if (user?.status === 'paid') {
    redirect('/dashboard');
  }
  
  // Find the latest payment doc for this user
  const latestPayment = await Payment.findOne({ userId: session.user.id })
    .sort({ submittedAt: -1 })
    .lean();

  // Duplicate submission guard (Req §9): 
  // If their latest payment doc is pending, they cannot submit another one.
  if (latestPayment?.status === 'pending') {
    redirect('/payment/pending');
  }

  // If payment was rejected, they can submit a new one
  return <PaymentClient />;
}
