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
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const story = await SuccessStory.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    story.likes += 1;
    await story.save();

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error liking success story:', error);
    return NextResponse.json(
      { error: 'Failed to like success story' },
      { status: 500 }
    );
  }
}