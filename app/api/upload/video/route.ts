import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadFile } from '@/lib/localStorage';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Add rate limit check (Batch 10)

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type. Must be a video.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to local storage
    const localPath = await uploadFile(buffer, filename || file.name, 'video');

    return NextResponse.json({ 
      localPath,
      isLocalStorage: true,
      filename: filename || file.name
    });
  } catch (error: any) {
    console.error('Video upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}
