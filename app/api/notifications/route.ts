import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const posts = await NotificationPost.find({ isActive: true })
      .populate('authorId', 'name email')
      .populate('comments.userId', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      authorName: (post.authorId as any)?.name || 'Unknown',
      comments: post.comments.map((comment: any) => ({
        ...comment.toObject(),
        userName: comment.userId?.name || 'Anonymous',
        replies: (comment.replies || []).map((reply: any) => ({
          ...reply.toObject ? reply.toObject() : reply,
          userName: reply.userName || 'Anonymous',
        })),
      })),
      reactions: post.reactions || [],
    }));
    
    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}