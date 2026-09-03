import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import PendingPaymentClient from './PendingPaymentClient';

export const dynamic = 'force-dynamic';

export default async function PendingPaymentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  await connectDB();
  
  // Check user status first
  const user = await User.findById(session.user.id).select('status');
  
  // If user is already paid, redirect to dashboard immediately
  if (user?.status === 'paid') {
    redirect('/dashboard');
  }
  
  return <PendingPaymentClient />;
}
