import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/lib/models/Course';
import { getLocalFileUrl } from '@/lib/localStorage';

export async function GET() {
  await connectDB();

  const courses = await Course.find({}, { title: 1, description: 1, localThumbnailPath: 1, videos: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const data = courses.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    description: c.description,
    videoCount: c.videos.length,
    createdAt: c.createdAt,
    thumbnailUrl: c.localThumbnailPath ? getLocalFileUrl(c.localThumbnailPath) : null,
  }));

  return NextResponse.json(data);
}
