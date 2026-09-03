import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Payment from '@/lib/models/Payment';

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    // Get current user status
    const user = await User.findById(token.id).select('status accessExpiresAt enrolledCourseIds');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get latest payment for this user
    const latestPayment = await Payment.findOne({ userId: token.id })
      .sort({ submittedAt: -1 })
      .select('status amount paymentMethod submittedAt reviewedAt adminNote courseId');

    return NextResponse.json({
      status: user.status,
      accessExpiresAt: user.accessExpiresAt,
      enrolledCourseIds: user.enrolledCourseIds,
      payment: latestPayment ? {
        status: latestPayment.status,
        amount: latestPayment.amount,
        paymentMethod: latestPayment.paymentMethod,
        submittedAt: latestPayment.submittedAt,
        reviewedAt: latestPayment.reviewedAt,
        adminNote: latestPayment.adminNote,
        courseId: latestPayment.courseId,
      } : null,
    });
  } catch (error: any) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Failed to fetch user status' }, { status: 500 });
  }
}