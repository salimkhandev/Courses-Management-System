import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadFile } from '@/lib/localStorage';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only allow if student is pending or rejected (needs to submit payment)
  if (token.role === 'student' && !['pending', 'rejected'].includes(token.status as string)) {
    return NextResponse.json({ error: 'Not eligible to submit payment.' }, { status: 403 });
  }

  // TODO: Add rate limit check (Batch 10)

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Must be an image.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with user ID
    const timestamp = Date.now();
    const safeFilename = `${token.id}-${timestamp}.jpg`;

    // Upload to local storage
    const localPath = await uploadFile(buffer, safeFilename, 'receipt');

    return NextResponse.json({ 
      localPath,
      isLocalStorage: true,
      filename: safeFilename
    });
  } catch (error: any) {
    console.error('Screenshot upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
  }
}
