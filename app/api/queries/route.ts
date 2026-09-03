import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Query from '@/lib/models/Query';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('public') === 'true';
    const isMy = searchParams.get('my') === 'true';

    await connectDB();

    let queries;
    
    if (isMy) {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      queries = await Query.find({ userId: session.user.id }).sort({ createdAt: -1 });
    } else if (isPublic) {
      queries = await Query.find({ isPublic: true, status: { $in: ['answered', 'closed'] } })
        .sort({ likes: -1, createdAt: -1 });
    } else {
      queries = await Query.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queries' },
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
    const body = await req.json();
    const { subject, question, isPublic = false } = body;

    if (!subject || !question) {
      return NextResponse.json({ error: 'Subject and question are required' }, { status: 400 });
    }

    const query = await Query.create({
      userId: session.user.id,
      subject,
      question,
      isPublic,
      status: 'open',
      likes: 0,
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error('Error creating query:', error);
    return NextResponse.json(
      { error: 'Failed to create query' },
      { status: 500 }
    );
  }
}