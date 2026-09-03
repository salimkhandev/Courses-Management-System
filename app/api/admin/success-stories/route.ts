import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SuccessStory from '@/lib/models/SuccessStory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const stories = await SuccessStory.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}