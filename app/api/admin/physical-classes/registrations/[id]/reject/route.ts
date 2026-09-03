import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PhysicalClassRegistration from '@/lib/models/PhysicalClassRegistration';
import PhysicalClass from '@/lib/models/PhysicalClass';
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
    
    const registration = await PhysicalClassRegistration.findById(params.id);
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Restore the seat since registration is rejected
    await PhysicalClass.findByIdAndUpdate(registration.classId, {
      $inc: { availableSeats: 1 },
    });

    registration.status = 'rejected';
    await registration.save();

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error rejecting registration:', error);
    return NextResponse.json(
      { error: 'Failed to reject registration' },
      { status: 500 }
    );
  }
}