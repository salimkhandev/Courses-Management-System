import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';
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
    const { isActive } = body;

    const post = await NotificationPost.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    post.isActive = isActive !== undefined ? isActive : !post.isActive;
    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error toggling notification:', error);
    return NextResponse.json(
      { error: 'Failed to toggle notification' },
      { status: 500 }
    );
  }
}