import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { type } = body;
    const { id } = await params;

    if (!type || !['like', 'love', 'celebrate', 'insightful'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    const post = await NotificationPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Remove existing reaction by this user if any
    post.reactions = post.reactions.filter(
      (r: any) => r.userId.toString() !== session.user.id
    );

    // Add new reaction
    post.reactions.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type,
      createdAt: new Date(),
    });

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}