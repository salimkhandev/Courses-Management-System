import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getFile, fileExists } from '@/lib/localStorage';

export async function GET(
  req: NextRequest,
  ctx: any
) {
  const { path } = await ctx.params;
  const relativePath = Array.isArray(path) ? path.join('/') : path;

  // Allow public access for thumbnails only
  const isThumbnail = relativePath.startsWith('thumbnails/');
  if (!isThumbnail) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const exists = await fileExists(relativePath);
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = await getFile(relativePath);

    // Determine content type based on file extension
    const ext = relativePath.split('.').pop()?.toLowerCase() || '';
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'pdf': 'application/pdf',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(file as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
