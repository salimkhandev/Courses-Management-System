import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PhysicalClass from '@/lib/models/PhysicalClass';
import PhysicalClassRegistration from '@/lib/models/PhysicalClassRegistration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/localStorage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const formData = await req.formData();
    const classId = formData.get('classId') as string;
    const paymentScreenshot = formData.get('paymentScreenshot') as File;

    if (!classId || !paymentScreenshot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if class exists and has available seats
    const physicalClass = await PhysicalClass.findById(classId);
    if (!physicalClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (physicalClass.availableSeats <= 0) {
      return NextResponse.json({ error: 'Class is full' }, { status: 400 });
    }

    // Check if user already registered
    const existingRegistration = await PhysicalClassRegistration.findOne({
      classId,
      userId: session.user.id,
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this class' }, { status: 400 });
    }

    // Upload payment screenshot
    const arrayBuffer = await paymentScreenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const screenshotPath = await uploadFile(buffer, paymentScreenshot.name, 'receipt');

    // Create registration
    const registration = await PhysicalClassRegistration.create({
      classId,
      userId: session.user.id,
      status: 'pending',
      paymentScreenshot: screenshotPath,
      totalFee: physicalClass.fee,
      paidAmount: 0,
      remainingAmount: physicalClass.fee,
      paymentHistory: [],
    });

    // Update available seats
    await PhysicalClass.findByIdAndUpdate(classId, {
      $inc: { availableSeats: -1 },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}