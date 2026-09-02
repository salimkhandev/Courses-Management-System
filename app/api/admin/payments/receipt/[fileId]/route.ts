import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getFile } from '@/lib/localStorage';

export async function GET(
  req: NextRequest,
  ctx: any
) {
  const { fileId } = await ctx.params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = await getFile(fileId);
    
    // Determine content type based on file extension
    const ext = fileId.split('.').pop()?.toLowerCase() || '';
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(file as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Failed to stream receipt:', error);
    return NextResponse.json({ error: 'Failed to fetch receipt.' }, { status: 500 });
  }
}
