import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfflineAwareHome from '@/components/OfflineAwareHome';
import CoursesSection from '@/components/CoursesSection';
import { Lock, Download, GraduationCap, Smartphone, Mail, Phone, MapPin, MessageSquare, Globe, Navigation } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eng Luqman Hafeez - Amazon Seller Academy',
  description:
    'Learn Amazon selling and e-commerce skills with Eng Luqman Hafeez. Stream or watch offline anytime.',
};

const FEATURES = [
  {
    icon: <Download className="w-10 h-10 text-amber-500" />,
    title: 'Offline Video Access',
    desc: 'Download and save Amazon FBA course videos directly to your device. Learn anytime without using your mobile data.',
  },
  {
    icon: <Lock className="w-10 h-10 text-amber-500" />,
    title: 'Secure Access',
    desc: 'Your Amazon seller training account and purchased courses are private and safely secured to your device.',
  },
  {
    icon: <Smartphone className="w-10 h-10 text-amber-500" />,
    title: 'Multi-Device Support',
    desc: 'Access your Amazon FBA coursework seamlessly on any phone, tablet, or computer right from the browser.',
  },
];

export default function HomePage() {
  return (
    <OfflineAwareHome>
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-20 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-full px-4 py-1 text-xs font-semibold tracking-widest uppercase mb-7">
            Eng Luqman Hafeez Amazon Academy
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-6">
            Master Amazon Selling &{' '}
            <span className="text-amber-500">E-Commerce Success</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Start your Amazon business and build financial freedom. Learn online with experienced Amazon seller <strong>Eng Luqman Hafeez</strong>, stream lectures, or download and watch offline.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#courses"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-slate-900 font-bold text-base rounded-xl no-underline hover:bg-amber-600 transition-colors"
            >
              Browse Our Courses →
            </a>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3.5 bg-slate-100 border border-slate-300 text-slate-900 font-semibold text-base rounded-xl no-underline hover:border-slate-400 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section id="instructor" className="px-6 py-20 sm:px-8 lg:px-12 border-t border-slate-200 bg-slate-50/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-amber-500/30 overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image
                src="/eng-pic.jpg"
                alt="Eng Luqman Hafeez"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-8 text-center md:text-left">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Meet Your Instructor</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-4">Eng Luqman Hafeez</h2>
            
            {/* Location & Experience Badges */}
            <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
              <a
                href="https://maps.apple.com/place?place-id=I274A5DCFDF554044&address=Grand+Trunk+Road%2C+Peshawar%2C+Pakistan&coordinate=34.007488%2C71.524578&name=Al+haj+tower&_provider=9902"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 border border-amber-600 rounded-lg text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-md hover:shadow-lg no-underline"
              >
                <Navigation className="w-5 h-5" />
                <span>View Location on Map</span>
              </a>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>Available Online</span>
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed mb-6">
              Experienced Amazon seller and e-commerce expert committed to delivering premium quality Amazon FBA and private label training. Eng Luqman Hafeez conducts structured online courses designed for entrepreneurs, business owners, and aspiring sellers in Pakistan and globally.
            </p>

            {/* Expertise Areas */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center md:text-left">
                <div className="text-amber-600 font-semibold text-sm">Amazon FBA</div>
                <div className="text-slate-500 text-xs">Private Label & Wholesale</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-amber-600 font-semibold text-sm">E-Commerce</div>
                <div className="text-slate-500 text-xs">Product Research & Sourcing</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-amber-600 font-semibold text-sm">Business Strategy</div>
                <div className="text-slate-500 text-xs">Scaling & Optimization</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-amber-600 font-semibold text-sm">One-on-One</div>
                <div className="text-slate-500 text-xs">Personalized Coaching</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <a
                href="https://wa.me/923425015034"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Support
              </a>
              <a
                href="mailto:engluqmanhafeez@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <Mail className="w-4 h-4" /> Email Me
              </a>
              <a
                href="https://web.facebook.com/people/Eng-Luqman-Hafeez/61580749476897/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a
                href="https://www.youtube.com/@EngLuqmanHafeez-y2d"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <CoursesSection />

      {/* Features */}
      <section id="features" className="px-6 py-20 sm:px-8 lg:px-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2">
            App Features
          </h2>
          <p className="text-center text-slate-600 mb-14 text-base sm:text-lg">
            Amazon FBA training modules optimized for internet conditions in Pakistan — low bandwidth, offline-friendly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-7">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold mb-2 text-base sm:text-lg">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info and Social Links */}
      <section id="contact" className="px-6 py-20 sm:px-8 lg:px-12 border-t border-slate-200 bg-slate-50/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8">Get In Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-12">
            <div className="card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-amber-500 font-semibold">
                <Phone className="w-5 h-5" /> Phone & WhatsApp
              </div>
              <p className="text-slate-600 text-sm flex flex-col gap-1">
                <a href="https://wa.me/923425015034" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">0342-5015034</a>
                <a href="https://wa.me/923185263800" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">0318-5263800</a>
              </p>
            </div>
            
            <div className="card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-amber-500 font-semibold">
                <Mail className="w-5 h-5" /> Email Address
              </div>
              <p className="text-slate-600 text-sm">
                <a href="mailto:engluqmanhafeez@gmail.com" className="hover:text-amber-600 transition-colors">engluqmanhafeez@gmail.com</a>
              </p>
            </div>

            <div className="card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-amber-500 font-semibold">
                <MapPin className="w-5 h-5" /> Location
              </div>
              <p className="text-slate-600 text-sm">
                <a href="https://maps.apple.com/place?place-id=I274A5DCFDF554044&address=Grand+Trunk+Road%2C+Peshawar%2C+Pakistan&coordinate=34.007488%2C71.524578&name=Al+haj+tower&_provider=9902" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">Al Haj Tower, Peshawar</a>
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 flex-wrap">
            <a
              href="https://web.facebook.com/people/Eng-Luqman-Hafeez/61580749476897/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Facebook Profile
            </a>
            <span className="text-slate-400">•</span>
            <a
              href="https://tiktok.com/@engluqmanhafeez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              TikTok
            </a>
            <span className="text-slate-400">•</span>
            <a
              href="https://www.youtube.com/@EngLuqmanHafeez-y2d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              YouTube
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 sm:px-8 lg:px-12 text-center border-t border-slate-200 bg-slate-50/60">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Amazon Business?
          </h2>
          <p className="text-slate-600 mb-8 text-base sm:text-lg">
            Create an account, enroll in our Amazon FBA training, and unlock interactive video courses.
          </p>
          <Link
            href="/register"
            className="inline-flex px-10 py-3.5 bg-amber-500 text-slate-900 font-bold text-base rounded-xl no-underline hover:bg-amber-600 transition-colors"
          >
            Get Started Online
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20 sm:px-8 lg:px-12 border-t border-slate-200 bg-slate-50/40">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <a
              href="#hero"
              className="text-xs text-muted hover:underline cursor-pointer"
            >
              ← Back to Top
            </a>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
            About Eng Luqman Hafeez Amazon Academy
          </h1>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            Eng Luqman Hafeez Amazon Academy is an online educational platform
            dedicated to making high-quality Amazon FBA and e-commerce training accessible and affordable.
          </p>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            All our courses are personally designed and taught by <strong>Eng Luqman Hafeez</strong>, an experienced Amazon seller. The platform is optimized
            to work even on slow connections or offline, allowing you to cache videos and learn without interruption.
          </p>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            Access is unlocked for one full year after payment verification. No subscriptions,
            no hidden fees.
          </p>

          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
              Contact Us
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              For Amazon selling support, payment queries, or any other questions:
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              WhatsApp: <strong>0342-5015034</strong> or <strong>0318-5263800</strong>
            </p>
            <a
              href="mailto:engluqmanhafeez@gmail.com"
              style={{ color: 'var(--brand-400)', textDecoration: 'none', fontWeight: 600 }}
            >
              engluqmanhafeez@gmail.com
            </a>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </OfflineAwareHome>
  );
}