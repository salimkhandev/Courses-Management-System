import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { content } = body;
    const { id, commentId } = await params;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const post = await NotificationPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get user info
    const User = (await import('@/lib/models/User')).default;
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create new reply object
    const newReply = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      userName: user.name || 'Anonymous',
      content: content.trim(),
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use direct MongoDB update to push reply into the nested comments array
    const result = await NotificationPost.findByIdAndUpdate(
      id,
      {
        $push: {
          'comments.$[comment].replies': newReply
        }
      },
      {
        arrayFilters: [{ 'comment._id': commentId }],
        new: true
      }
    ).populate('authorId', 'name email')
     .populate('comments.userId', 'name email')
     .exec();
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
    
    // Format the post to match the public notifications API format
    const formattedPost = {
      ...result.toObject(),
      authorName: (result.authorId as any)?.name || 'Unknown',
      comments: result.comments.map((c: any) => ({
        ...c.toObject(),
        userName: c.userId?.name || 'Anonymous',
        replies: (c.replies || []).map((r: any) => ({
          ...r.toObject ? r.toObject() : r,
          userName: r.userName || 'Anonymous',
        })),
      })),
      reactions: result.reactions || [],
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
