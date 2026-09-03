import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SuccessStory from '@/lib/models/SuccessStory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { featured } = body;

    const story = await SuccessStory.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    story.featured = featured !== undefined ? featured : !story.featured;
    await story.save();

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle featured status' },
      { status: 500 }
    );
  }
}