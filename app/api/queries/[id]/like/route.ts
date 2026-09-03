import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Query from '@/lib/models/Query';
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
    
    const query = await Query.findById(params.id);
    if (!query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    query.likes += 1;
    await query.save();

    return NextResponse.json(query);
  } catch (error) {
    console.error('Error liking query:', error);
    return NextResponse.json(
      { error: 'Failed to like query' },
      { status: 500 }
    );
  }
}