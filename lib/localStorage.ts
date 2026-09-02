import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream, statSync } from 'fs';

// Base directory for local file storage
const STORAGE_BASE_DIR = process.env.LOCAL_STORAGE_DIR || '/var/www/storage';

// Storage folders
const STORAGE_FOLDERS = {
  VIDEOS: path.join(STORAGE_BASE_DIR, 'videos'),
  THUMBNAILS: path.join(STORAGE_BASE_DIR, 'thumbnails'),
  RECEIPTS: path.join(STORAGE_BASE_DIR, 'receipts'),
};

/**
 * Initialize storage directories if they don't exist
 */
export async function initializeStorage(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_FOLDERS.VIDEOS, { recursive: true });
    await fs.mkdir(STORAGE_FOLDERS.THUMBNAILS, { recursive: true });
    await fs.mkdir(STORAGE_FOLDERS.RECEIPTS, { recursive: true });
  } catch (error) {
    console.error('Failed to initialize storage directories:', error);
    throw error;
  }
}

/**
 * Get the appropriate storage folder based on file type
 */
function getStorageFolder(type: 'video' | 'thumbnail' | 'receipt'): string {
  switch (type) {
    case 'video':
      return STORAGE_FOLDERS.VIDEOS;
    case 'thumbnail':
      return STORAGE_FOLDERS.THUMBNAILS;
    case 'receipt':
      return STORAGE_FOLDERS.RECEIPTS;
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}

/**
 * Generate a safe filename from the original filename
 */
function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}-${safeName}`;
}

/**
 * Upload a file to local storage
 * Returns the relative path for storing in database
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  originalName: string,
  type: 'video' | 'thumbnail' | 'receipt'
): Promise<string> {
  await initializeStorage();
  
  const folder = getStorageFolder(type);
  const filename = generateSafeFilename(originalName);
  const filePath = path.join(folder, filename);
  
  await fs.writeFile(filePath, file);
  
  // Return relative path for database storage
  return path.join(type === 'video' ? 'videos' : type === 'thumbnail' ? 'thumbnails' : 'receipts', filename);
}

/**
 * Get a file as a buffer
 */
export async function getFile(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(STORAGE_BASE_DIR, relativePath);
  return fs.readFile(fullPath);
}

/**
 * Get file stats (size, etc.)
 */
export async function getFileStats(relativePath: string): Promise<{ size: number; exists: boolean }> {
  try {
    const fullPath = path.join(STORAGE_BASE_DIR, relativePath);
    const stats = await fs.stat(fullPath);
    return { size: stats.size, exists: true };
  } catch (error) {
    return { size: 0, exists: false };
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(relativePath: string): Promise<void> {
  try {
    const fullPath = path.join(STORAGE_BASE_DIR, relativePath);
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to delete file ${relativePath}:`, error);
      throw error;
    }
  }
}

/**
 * Get the full local URL for a file (for serving via Next.js API routes)
 */
export function getLocalFileUrl(relativePath: string): string {
  // This will be served via our API routes, not direct file access
  return `/api/files/${relativePath}`;
}

/**
 * Get the full filesystem path for a file
 */
export function getFullPath(relativePath: string): string {
  return path.join(STORAGE_BASE_DIR, relativePath);
}

/**
 * Check if a file exists
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(STORAGE_BASE_DIR, relativePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stream a file for video playback
 */
export async function streamFile(relativePath: string, rangeHeader: string | null): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  contentLength: number;
  contentRange?: string;
  status: number;
}> {
  const fullPath = path.join(STORAGE_BASE_DIR, relativePath);
  const stats = statSync(fullPath);
  const fileSize = stats.size;
  const contentType = getContentType(relativePath);

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    return {
      stream: createReadStream(fullPath, { start, end }),
      contentType,
      contentLength: chunkSize,
      contentRange: `bytes ${start}-${end}/${fileSize}`,
      status: 206,
    };
  }

  return {
    stream: createReadStream(fullPath),
    contentType,
    contentLength: fileSize,
    status: 200,
  };
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
  };
  return contentTypes[ext] || 'application/octet-stream';
}
