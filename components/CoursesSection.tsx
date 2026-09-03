'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Clock, Lock, GraduationCap } from 'lucide-react';

export default function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses/public');
        const data = await res.json();
        setCourses(data); 
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <section id="courses" className="px-6 py-20 sm:px-8 lg:px-12 border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
            All Courses
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {coursesLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            No courses available yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course: any) => (
              <article
                key={course.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {/* Thumbnail */}
                <div style={{ height: '180px', background: 'var(--surface-2)', overflow: 'hidden', position: 'relative' }}>
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <GraduationCap size={40} className="text-muted" />
                    </div>
                  )}
                  {/* Price badge */}
                  <div style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: 'var(--brand-500)', color: '#fff',
                    borderRadius: '9999px', padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    Rs. {course.price.toLocaleString()}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{course.title}</h2>
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {course.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <span className="flex items-center gap-1"><Video size={12} /> {course.videoCount} videos</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(course.totalDuration)}</span>
                  </div>

                  {/* CTA — gated for visitors */}
                  <Link
                    href="/register"
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    <Lock size={16} /> Enroll to Watch
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}