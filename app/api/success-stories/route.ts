import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SuccessStory from '@/lib/models/SuccessStory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/localStorage';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const stories = await SuccessStory.find({ status: 'approved' })
      .sort({ featured: -1, likes: -1, createdAt: -1 });
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const salesAmount = formData.get('salesAmount') as string;
    const platform = formData.get('platform') as string;
    const timeframe = formData.get('timeframe') as string;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get user information
    const User = (await import('@/lib/models/User')).default;
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle file uploads
    const images: string[] = [];
    const files = formData.getAll('images') as File[];
    
    for (const file of files) {
      if (file instanceof File && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = await uploadFile(buffer, file.name, 'success-story');
        images.push(path);
      }
    }

    const story = await SuccessStory.create({
      studentId: session.user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentWhatsapp: user.whatsapp,
      title,
      content,
      images,
      salesAmount: salesAmount ? parseInt(salesAmount) : undefined,
      platform,
      timeframe,
      status: 'pending',
      likes: 0,
      featured: false,
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating success story:', error);
    return NextResponse.json(
      { error: 'Failed to create success story' },
      { status: 500 }
    );
  }
}