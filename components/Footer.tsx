'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const LINKS = [
  { sectionId: 'hero', label: 'Home' },
  { sectionId: 'instructor', label: 'Instructor' },
  { sectionId: 'courses', label: 'Courses' },
  { sectionId: 'features', label: 'Features' },
  { sectionId: 'contact', label: 'Contact' },
  { sectionId: 'about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/refund', label: 'Refund Policy' },
];

export default function Footer() {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback year

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      if (typeof window !== 'undefined') {
        window.location.href = `/#${sectionId}`;
      }
    } else {
      if (typeof document !== 'undefined') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <footer className="mt-auto border-t border-slate-200 px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/eng-pic.jpg" alt="Eng Luqman Hafeez" width={40} height={40} className="rounded-md" />
          <div>
            <p className="font-bold text-lg text-amber-500">Eng Luqman Hafeez Amazon</p>
            <p className="text-xs text-slate-600 mt-1">Sell Without Limits</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-4 sm:gap-5">
          {LINKS.map((link) => (
            'sectionId' in link ? (
              <button
                key={link.sectionId}
                onClick={() => scrollToSection(link.sectionId)}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 no-underline hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <p className="text-xs text-slate-600">
          &copy; {currentYear} Eng Luqman Hafeez. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
