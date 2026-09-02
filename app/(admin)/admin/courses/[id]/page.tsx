'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { compressImage } from '@/lib/image';
import Link from 'next/link';

interface VideoFormItem {
  id?: string;
  order: number;
  title: string;
  duration: number; // seconds
  localPath: string;
  sizeBytes: number;
  // Local state helper for uploads
  uploading?: boolean;
  uploadProgress?: number;
}

// Read video duration and file size client-side
async function getVideoDurationAndSize(file: File): Promise<{ duration: number; size: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: Math.round(video.duration),
        size: file.size,
      });
    };
  });
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(5000);
  const [localThumbnailPath, setLocalThumbnailPath] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [videos, setVideos] = useState<VideoFormItem[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState('');

  // Local helper for single video upload
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to load course details.');
        const data = await res.json();
        
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price ?? 5000);
        setLocalThumbnailPath(data.localThumbnailPath);
        setThumbnailUrl(data.thumbnailUrl || '');
        setVideos(data.videos || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadData();
  }, [courseId]);

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Please select an image smaller than 10MB.');
      return;
    }

    const compressedBlob = await compressImage(file, 800, 800, 0.7);

    setError('');
    try {
      // Upload directly to local storage using FormData
      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('filename', file.name);

      const uploadRes = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const d = await uploadRes.json();
        throw new Error(d.error || 'Failed to upload thumbnail');
      }

      const { localPath } = await uploadRes.json();
      setLocalThumbnailPath(localPath);
      setThumbnailUrl(URL.createObjectURL(file));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddVideo() {
    setVideoError('');
    if (!videoFile || !videoTitleInput.trim()) {
      setVideoError('Please provide a title and select a video file.');
      return;
    }

    setUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      // 1. Get duration and size
      const { duration, size } = await getVideoDurationAndSize(videoFile);

      // 2. Upload with progress tracking using XMLHttpRequest
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('filename', videoFile.name);

      const localPath = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload/video', true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setVideoUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.localPath);
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const d = JSON.parse(xhr.responseText);
              reject(new Error(d.error || 'Failed to upload video'));
            } catch {
              reject(new Error('Failed to upload video'));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });

      const newVideo: VideoFormItem = {
        order: videos.length + 1,
        title: videoTitleInput,
        duration,
        localPath: localPath,
        sizeBytes: size,
      };

      setVideos((prev) => [...prev, newVideo]);
      setVideoTitleInput('');
      setVideoFile(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch (err: any) {
      setVideoError(err.message || 'Video upload failed.');
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  }

  function removeVideo(index: number) {
    setVideos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-order remaining elements sequentially
      return updated.map((v, i) => ({ ...v, order: i + 1 }));
    });
  }

  function moveVideo(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === videos.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...videos];
    
    // Swap items
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Correct the order attribute
    setVideos(updated.map((v, i) => ({ ...v, order: i + 1 })));
  }

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        price,
        localThumbnailPath: localThumbnailPath,
        videos,
      };

      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save course changes.');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  if (loading) return <div className="text-center py-10">Loading course...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* Course Info Form */}
      <div className="card">
        <div className="mb-6">
          <Link href="/admin/courses" className="text-xs text-muted hover:underline">
            ← Back to Course Manager
          </Link>
          <h1 className="text-2xl font-bold mt-2">Edit Course Details</h1>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        <form onSubmit={handleSaveCourse} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Course Title</label>
            <input 
              className="input" 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea 
              className="input" 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Enrollment Price (PKR)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Thumbnail Preview</label>
            <div className="flex gap-4 items-center">
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail" 
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid var(--surface-2)' }} 
                />
              ) : (
                <div style={{ width: '120px', height: '80px', background: 'var(--surface-2)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎓</div>
              )}
              
              <button 
                type="button" 
                className="text-xs px-3 py-1.5 border rounded hover:bg-surface-2" 
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--surface-2)' }}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Change Image
              </button>
              <input 
                ref={thumbnailInputRef}
                type="file" 
                accept="image/*"
                className="hidden" 
                style={{ display: 'none' }}
                onChange={handleThumbnailChange}
              />
            </div>
          </div>

          <button className="btn-primary mt-4" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : null}
            {saving ? 'Saving changes...' : 'Save Course Details'}
          </button>
        </form>
      </div>

      {/* Videos List / Uploader */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Course Videos</h2>

        {/* Video Upload Subform */}
        <div className="mb-6 p-4 rounded-lg bg-surface-1 border border-surface-2 flex flex-col gap-3">
          <h3 className="font-semibold text-sm">Upload Video File</h3>
          
          {videoError && <div className="text-sm p-2 bg-red-500/10 text-red-500 rounded border border-red-500/20">{videoError}</div>}
          
          <input 
            className="input text-sm" 
            placeholder="e.g. 1. Introduction to App Router"
            value={videoTitleInput}
            onChange={e => setVideoTitleInput(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              ref={videoInputRef}
              type="file" 
              accept="video/mp4,video/mkv,video/*"
              className="input text-sm flex-1"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
            />
            
            <button 
              type="button"
              className="btn-primary text-sm px-4" 
              onClick={handleAddVideo}
              disabled={uploadingVideo}
            >
              {uploadingVideo ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {uploadingVideo && (
            <div className="flex flex-col gap-1">
              <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${videoUploadProgress}%`, background: 'var(--brand-500)' }}
                />
              </div>
              <p className="text-xs text-brand-400">
                ⚡ Uploading... {videoUploadProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Video List */}
        {videos.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">No videos added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {videos.map((v, i) => (
              <div
                key={`${v.order}-${v.localPath || i}`}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md"
                style={{ 
                  background: 'var(--surface-1)', 
                  border: '1px solid var(--surface-2)',
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Index / order badge */}
                  <span className="text-xs font-semibold text-muted bg-surface-2 w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-full">
                    {v.order}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{v.title}</h4>
                    <p className="text-xs text-muted">
                      ⏱ {formatDuration(v.duration)} &nbsp;|&nbsp; 💾 {(v.sizeBytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                {/* Move / Remove controls */}
                <div className="flex gap-1 self-end sm:self-auto">
                  <button 
                    type="button"
                    className="p-1.5 text-xs hover:bg-surface-2 rounded border border-surface-2 flex items-center justify-center" 
                    onClick={() => moveVideo(i, 'up')}
                    disabled={i === 0}
                  >
                    ▲
                  </button>
                  <button 
                    type="button"
                    className="p-1.5 text-xs hover:bg-surface-2 rounded border border-surface-2 flex items-center justify-center" 
                    onClick={() => moveVideo(i, 'down')}
                    disabled={i === videos.length - 1}
                  >
                    ▼
                  </button>
                  <button 
                    type="button"
                    className="p-1.5 px-2 text-xs hover:bg-opacity-80 rounded flex items-center justify-center" 
                    style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={() => removeVideo(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
