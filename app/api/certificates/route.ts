import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Certificate from '@/lib/models/Certificate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const certificates = await Certificate.find({ studentId: session.user.id })
      .sort({ issueDate: -1 });
    
    const formattedCertificates = certificates.map(cert => ({
      ...cert.toObject(),
      type: cert.courseId ? 'online' : 'physical',
    }));
    
    return NextResponse.json(formattedCertificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}