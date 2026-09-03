import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import NotificationPost from '@/lib/models/NotificationPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/localStorage';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const posts = await NotificationPost.find()
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as 'normal' | 'important' | 'urgent';
    
    // Handle file uploads
    const attachments: string[] = [];
    const files = formData.getAll('attachments') as File[];
    
    for (const file of files) {
      if (file instanceof File && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = await uploadFile(buffer, file.name, 'notification');
        attachments.push(path);
      }
    }

    const post = await NotificationPost.create({
      authorId: new mongoose.Types.ObjectId(session.user.id),
      title,
      content,
      attachments,
      priority,
      targetAudience: 'all',
      isActive: true,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}