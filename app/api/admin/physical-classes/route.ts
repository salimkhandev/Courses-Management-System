import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PhysicalClass from '@/lib/models/PhysicalClass';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const classes = await PhysicalClass.find().sort({ startDate: -1 });
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching physical classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
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
    const body = await req.json();
    
    const newClass = await PhysicalClass.create({
      ...body,
      availableSeats: body.totalSeats,
    });
    
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating physical class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}