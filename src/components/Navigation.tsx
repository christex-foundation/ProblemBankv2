'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CommandPalette from './CommandPalette';

interface NavigationProps {
  logoText?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  logoText = 'ProblemBank',
}) => {
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = [
    { label: 'Ideas', href: '/hackathon/ideas' },
    { label: 'Resources', href: '/hackathon/resources' },
    { label: 'Big 5 Hackathon', href: '/hackathon/big5' },
    { label: 'Civic Hackathon', href: '/hackathon/civic-hackathon' },
    // { label: 'Find Team', href: '/hackathon/find-a-team' },
    { label: 'About', href: '/hackathon/about' },
  ] as const;

  const isActive = (href: string) => href !== '#' && pathname.startsWith(href);

  // Handle ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#f9f2e9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-16">
          {/* Left: Brand */}
          <div className="flex items-center col-start-1">
            <Link href="/" aria-label="Go to home" className="flex items-center space-x-3 sm:space-x-2">
              <Image
                src="/images/black%20logo%20mark%20size=48@2x.png"
                alt="Problem Bank logo"
                className="w-8 h-8"
                width={32}
                height={32}
                priority
              />
              <span
                className="text-[22px] inline-block"
                style={{ fontFamily: 'Decoy, serif', color: '#403f3e' }}
              >
                {logoText}
              </span>
            </Link>
          </div>

          {/* Center: Menu (hidden on mobile/tablet, visible on desktop) */}
          <div className="nav-menu-desktop lg:col-start-2">
            <div className="flex justify-center items-center gap-8">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={
                      `px-3 py-2 rounded-full transition-colors ${active ? 'ring-2 ring-[#d8cdbc]' : ''}`
                    }
                    style={{
                      fontFamily: 'Raleway, sans-serif',
                      fontWeight: 500,
                      color: '#403f3e',
                      backgroundColor: active ? '#f2e8dc' : 'transparent',
                      border: active ? '1px solid #d8cdbc' : 'none',
                      transform: active ? 'rotate(-2deg)' : undefined,
                    }}
                  >
                    <span className="px-2 py-1 rounded-full hover:bg-[#fffaf3] hover:text-[#1e1e1e]">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Search pill + Mobile menu button */}
          <div className="flex items-center justify-end gap-4 sm:gap-3 col-start-2 lg:col-start-3">
            {/* Search icon button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-[#fffaf3] border border-[#e8ddd0] rounded-full shadow-sm hover:bg-[#f2e8dc] transition-colors"
              aria-label="Search (⌘K)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
                  stroke="#403f3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden flex-col justify-center items-center w-8 h-8 p-1"
              aria-label="Toggle mobile menu"
            >
              <span
                className={`block w-5 h-0.5 bg-[#403f3e] transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[#403f3e] mt-1 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[#403f3e] mt-1 transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-[#f9f2e9] border-l border-[#e8ddd0] z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#e8ddd0]">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e' }}>
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-[#f2e8dc] rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="#403f3e" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="flex-1 p-4">
                <nav className="space-y-2">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block px-4 py-3 rounded-full transition-colors ${
                          active ? 'ring-2 ring-[#d8cdbc]' : ''
                        }`}
                        style={{
                          fontFamily: 'Raleway, sans-serif',
                          fontWeight: 500,
                          color: '#403f3e',
                          backgroundColor: active ? '#f2e8dc' : 'transparent',
                          border: active ? '1px solid #d8cdbc' : 'none',
                          transform: active ? 'rotate(-2deg)' : undefined,
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="block px-2 py-1 rounded-full hover:bg-[#fffaf3] hover:text-[#1e1e1e]">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation;