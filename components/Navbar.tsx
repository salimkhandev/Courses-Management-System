'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useNetwork } from '@/hooks/useNetwork';
import { Info, Menu, X, Bell } from 'lucide-react';

const NAV_LINKS = [
  { sectionId: 'hero', label: 'Home' },
  { sectionId: 'instructor', label: 'Instructor' },
  { sectionId: 'courses', label: 'Courses' },
  { sectionId: 'features', label: 'Features' },
  { sectionId: 'contact', label: 'Contact' },
  { sectionId: 'about', label: 'About', icon: <Info size={16} /> },
  { sectionId: 'notifications', label: 'Notifications', isExternal: true, icon: <Bell size={16} /> },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const isOnline = useNetwork();

  // Track active section based on scroll position
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (pathname !== '/' || typeof document === 'undefined') return;

      const sections = NAV_LINKS.filter(link => !link.isExternal).map(link => link.sectionId);
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      setActiveSection(null);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch('/api/notifications/count');
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (sectionId: string, isExternal: boolean = false) => {
    // During SSR or before mount, return false to avoid hydration mismatch
    if (!mounted) return false;
    if (isExternal) return pathname === `/${sectionId}`;
    return activeSection === sectionId;
  };

  const scrollToSection = (sectionId: string, isExternal: boolean = false) => {
    if (isExternal) {
      if (typeof window !== 'undefined') {
        window.location.href = `/${sectionId}`;
      }
      return;
    }

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

  // Determine which links to show based on network status
  const visibleNavLinks = isOnline
    ? NAV_LINKS
    : NAV_LINKS.filter(link => link.sectionId !== 'courses');

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 font-bold text-xl text-amber-500 no-underline tracking-tight flex items-center gap-2"
          >
            <Image src="/eng-pic.jpg" alt="Eng Luqman Hafeez" width={32} height={32} className="rounded-md" />
            Eng Luqman Hafeez
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 flex-1">
            {visibleNavLinks.map((link) => (
              link.isExternal ? (
                <Link
                  key={link.sectionId}
                  href={`/${link.sectionId}`}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 no-underline relative ${
                    isActive(link.sectionId, true)
                      ? 'text-amber-600 bg-amber-500/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.icon && <span className="flex items-center">{link.icon}</span>}
                  {link.label}
                  {link.sectionId === 'notifications' && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  key={link.sectionId}
                  onClick={() => scrollToSection(link.sectionId)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                    isActive(link.sectionId)
                      ? 'text-amber-600 bg-amber-500/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.icon && <span className="flex items-center">{link.icon}</span>}
                  {link.label}
                </button>
              )
            ))}
          </nav>

          {/* Desktop auth actions / offline actions */}
          <div className="hidden md:flex gap-2 items-center flex-shrink-0">
            {!isOnline ? (
              <Link
                href="/downloads"
                className="text-sm font-semibold text-slate-900 bg-amber-500 no-underline px-4 py-1.5 rounded-md hover:bg-amber-600 transition-colors"
              >
                Offline Downloads
              </Link>
            ) : session ? (
              <>
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-sm text-slate-600 no-underline px-3 py-1.5 rounded-md hover:text-slate-900 transition-colors"
                >
                  {session.user.role === 'admin' ? 'Admin Panel' : 'My Learning'}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-slate-600 bg-none border-none cursor-pointer px-3 py-1.5 hover:text-slate-900 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 no-underline px-3 py-1.5 rounded-md hover:text-slate-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-slate-900 bg-amber-500 no-underline px-4 py-1.5 rounded-md hover:bg-amber-600 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-2 mb-4">
              {visibleNavLinks.map((link) => (
                link.isExternal ? (
                  <Link
                    key={link.sectionId}
                    href={`/${link.sectionId}`}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 no-underline relative ${
                      isActive(link.sectionId, true)
                        ? 'text-amber-600 bg-amber-500/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.icon && <span className="flex items-center">{link.icon}</span>}
                    {link.label}
                    {link.sectionId === 'notifications' && notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    key={link.sectionId}
                    onClick={() => {
                      setMenuOpen(false);
                      scrollToSection(link.sectionId);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isActive(link.sectionId)
                        ? 'text-amber-600 bg-amber-500/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.icon && <span className="flex items-center">{link.icon}</span>}
                    {link.label}
                  </button>
                )
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
              {!isOnline ? (
                <Link
                  href="/downloads"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-slate-900 bg-amber-500 no-underline px-4 py-2 rounded-md hover:bg-amber-600 transition-colors text-center"
                >
                  Offline Downloads
                </Link>
              ) : session ? (
                <>
                  <Link
                    href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-slate-600 no-underline px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    {session.user.role === 'admin' ? 'Admin Panel' : 'My Learning'}
                  </Link>

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setMenuOpen(false);
                    }}
                    className="text-sm text-slate-600 bg-none border-none cursor-pointer px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-slate-600 no-underline px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-slate-900 bg-amber-500 no-underline px-4 py-2 rounded-md hover:bg-amber-600 transition-colors text-center"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
