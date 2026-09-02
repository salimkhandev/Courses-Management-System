import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/lib/models/Course';
import { getLocalFileUrl } from '@/lib/localStorage';

// Public endpoint — no auth required — returns basic course info for enrollment
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

  const data = courses.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    description: c.description,
    price: c.price ?? 5000,
    videoCount: c.videos.length,
    thumbnailUrl: c.localThumbnailPath ? getLocalFileUrl(c.localThumbnailPath) : null,
  }));

  return NextResponse.json(data);
}
