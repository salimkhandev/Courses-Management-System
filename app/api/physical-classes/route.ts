import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PhysicalClass from '@/lib/models/PhysicalClass';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const classes = await PhysicalClass.find({ 
      status: { $in: ['upcoming', 'ongoing'] } 
    }).sort({ startDate: 1 });
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching physical classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}