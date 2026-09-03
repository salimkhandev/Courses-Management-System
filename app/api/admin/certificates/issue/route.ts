import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Certificate from '@/lib/models/Certificate';
import PhysicalClassRegistration from '@/lib/models/PhysicalClassRegistration';
import PhysicalClass from '@/lib/models/PhysicalClass';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Generate unique certificate ID
function generateCertificateId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

// Generate verification code
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { type, studentId, courseId, physicalClassId } = body;

    if (!type || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'physical' && !physicalClassId) {
      return NextResponse.json({ error: 'Physical class ID required for physical certificates' }, { status: 400 });
    }

    if (type === 'online' && !courseId) {
      return NextResponse.json({ error: 'Course ID required for online certificates' }, { status: 400 });
    }

    // Get student information
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      studentId,
      ...(type === 'online' ? { courseId } : { physicalClassId }),
    });

    if (existingCertificate) {
      return NextResponse.json({ error: 'Certificate already issued for this course/class' }, { status: 400 });
    }

    let courseName, instructorName, completionDate;

    if (type === 'physical') {
      const registration = await PhysicalClassRegistration.findOne({
        classId: physicalClassId,
        userId: studentId,
        status: 'completed',
      });

      if (!registration) {
        return NextResponse.json({ error: 'Student has not completed this physical class' }, { status: 400 });
      }

      const physicalClass = await PhysicalClass.findById(physicalClassId);
      if (!physicalClass) {
        return NextResponse.json({ error: 'Physical class not found' }, { status: 404 });
      }

      courseName = physicalClass.title;
      instructorName = physicalClass.instructor;
      completionDate = registration.completionDate || new Date();

      // Update registration to mark certificate as issued
      registration.certificateIssued = true;
      await registration.save();
    } else {
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      courseName = course.title;
      instructorName = 'Eng Luqman Hafeez';
      completionDate = new Date();
    }

    // Create certificate
    const certificate = await Certificate.create({
      studentId,
      ...(type === 'online' ? { courseId } : { physicalClassId }),
      certificateId: generateCertificateId(),
      studentName: student.name,
      courseName,
      completionDate,
      issueDate: new Date(),
      instructorName,
      verificationCode: generateVerificationCode(),
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}