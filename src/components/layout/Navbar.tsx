'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, getUser } from '@/lib/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Sources',   href: '/sources',   icon: '🔗' },
  { label: 'Content',   href: '/content',   icon: '📄' },
  { label: 'Products',  href: '/products',  icon: '📦' },
  { label: 'Growth',    href: '/growth',    icon: '🚀' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href;

  // Load user email on mount
  useEffect(() => {
    async function loadUser() {
      const { user } = await getUser();
      if (user?.email) setEmail(user.email);
    }
    loadUser();
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [])

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    window.location.href = '/login';
  };

  // Get initials from email
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-[#1a1d27] border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-bold text-sm">
              AI
            </div>
            <span className="font-semibold text-white text-sm">AI Intelligence</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side — Profile + Mobile Hamburger */}
          <div className="flex items-center gap-2">

            {/* Profile Dropdown — desktop */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {email ? getInitials(email) : ''}
                </div>
                {/* Email */}
                <span className="text-sm text-gray-300 max-w-[140px] truncate">
                {email ?? ''}
                </span>
                {/* Chevron */}
                <span className={`text-gray-500 text-xs transition-transform ${profileOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1d27] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold shrink-0">
                        {email ? getInitials(email) : '??'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {email?.split('@')[0] ?? 'User'}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{email ?? ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <span>🚪</span>
                      {loggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 space-y-1 border-t border-gray-800 pt-3">

            {/* Mobile user info */}
            {email && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                  {getInitials(email)}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{email.split('@')[0]}</p>
                  <p className="text-gray-400 text-xs truncate">{email}</p>
                </div>
              </div>
            )}

            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Logout Button — mobile */}
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/10 border border-transparent transition-colors disabled:opacity-50"
            >
              <span className="text-lg">🚪</span>
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}