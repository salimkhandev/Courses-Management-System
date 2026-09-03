import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const count = await NotificationPost.countDocuments({ isActive: true });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification count' },
      { status: 500 }
    );
  }
}