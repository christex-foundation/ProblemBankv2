'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load DotGrid
const DotGrid = dynamic(() => import('../DotGrid'), {
  ssr: false,
  loading: () => null,
});

// Mobile detection hook for performance optimization
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 639px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

export default function Big5Hero() {
  // Mobile detection for performance optimization
  const isMobile = useIsMobile();

  const [countdown, setCountdown] = useState<{
    label: 'Applications Open' | 'Bootcamp Starting' | 'Hackathon Live' | 'Review in Progress' | 'Completed';
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    label: 'Applications Open',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const APP_START = new Date('2025-09-01T00:00:00Z');
    const APP_END = new Date('2025-10-14T23:59:59Z');
    const BOOTCAMP_START = new Date('2025-10-27T00:00:00Z');
    const HACKATHON_START = new Date('2025-12-05T00:00:00Z');
    const HACKATHON_END = new Date('2025-12-08T00:00:00Z');
    const REVIEW_END = new Date('2025-12-17T23:59:59Z');

    const tick = () => {
      const now = new Date();
      let target = APP_START;
      let label: 'Applications Open' | 'Bootcamp Starting' | 'Hackathon Live' | 'Review in Progress' | 'Completed' = 'Applications Open';

      if (now < APP_START) {
        target = APP_START;
        label = 'Applications Open';
      } else if (now >= APP_START && now < APP_END) {
        target = APP_END;
        label = 'Applications Open';
      } else if (now >= APP_END && now < BOOTCAMP_START) {
        target = BOOTCAMP_START;
        label = 'Bootcamp Starting';
      } else if (now >= BOOTCAMP_START && now < HACKATHON_START) {
        target = HACKATHON_START;
        label = 'Hackathon Live';
      } else if (now >= HACKATHON_START && now < HACKATHON_END) {
        target = HACKATHON_END;
        label = 'Hackathon Live';
      } else if (now >= HACKATHON_END && now < REVIEW_END) {
        target = REVIEW_END;
        label = 'Review in Progress';
      } else {
        setCountdown({ label: 'Completed', days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ label, days, hours, minutes, seconds });
    };

    tick();

    let rafId: number;
    let lastUpdate = Date.now();

    const rafTick = () => {
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        lastUpdate = now;
        tick();
      }
      rafId = requestAnimationFrame(rafTick);
    };

    rafId = requestAnimationFrame(rafTick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pb-20" style={{ backgroundColor: '#f9f2e9' }}>
      {/* DotGrid Background with feathered hero exclusion - Only render on desktop for performance */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 85%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 85%)'
          }}
        >
          <DotGrid
            dotSize={10}
            gap={40}
            baseColor="#E6B800"
            activeColor="#f0b420"
            proximity={120}
            speedTrigger={100}
            shockRadius={200}
            shockStrength={3}
            maxSpeed={4000}
            resistance={850}
            returnDuration={1.5}
            className="opacity-15"
            style={{}}
          />
        </div>
      )}

      {/* Spacer to match homepage */}
      <div className="w-full mt-10 mb-30" />

      <div className="relative z-50 text-center max-w-5xl mx-auto -mt-24">
        {/* Ministry Logo + Event Badge */}
        {countdown.label !== 'Completed' && (
          <div className="mb-8 inline-flex items-center gap-3 sm:gap-4 rounded-full border-2 border-[#1e1e1e] px-4 sm:px-6 py-2 sm:py-3 bg-[#E6B800]">
            <Image
              src="/images/mocti-logo.png"
              alt="Ministry of Communication, Technology & Innovation - Government of Sierra Leone"
              width={40}
              height={40}
              className="rounded-full sm:w-12 sm:h-12"
              unoptimized
              priority
            />
            <span className="text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, color: '#1e1e1e' }}>
              National Innovation Competition
            </span>
          </div>
        )}

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl leading-none tracking-tight text-[#1e1e1e] mb-6">
          <div
            className="block"
            style={{
              fontFamily: 'Decoy, sans-serif',
              fontWeight: 500,
              transform: 'rotate(-2deg)',
              display: 'block',
            }}
          >
            BIG 5  A.I. &
          </div>
          <div
            className="block"
            style={{
              fontFamily: 'Decoy, sans-serif',
              fontWeight: 500,
              transform: 'rotate(0.8deg)',
            }}
          >
            BLOCKCHAIN
          </div>
          <div
            className="block"
            style={{
              fontFamily: 'Decoy, sans-serif',
              fontWeight: 500,
              transform: 'rotate(-2deg)',
            }}
          >
            HACKATHON
          </div>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg md:text-xl text-gray-700 mt-8 max-w-3xl mx-auto px-4"
          style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, lineHeight: '1.6' }}
        >
          Build AI and blockchain solutions aligned with Sierra Leone&apos;s development priorities.
          Join young developers and innovators in creating impactful technology.
        </p>

        {/* Grand Prize Banner */}
        <div className="mt-12 inline-block px-4 w-full max-w-md">
          <div
            className="relative border-2 border-[#1e1e1e] shadow-xl overflow-hidden rounded-[24px] md:rounded-[28px] lg:rounded-[34px] bg-[#E6B800] px-8 sm:px-12 md:px-16 py-6 sm:py-8 md:py-10 text-center"
            style={{ transform: 'rotate(-1.2deg)' }}
          >
            {/* Noise overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                backgroundSize: '200px 200px',
                backgroundRepeat: 'repeat',
              }}
            />

             <div className="relative z-10">
               {/* Label */}
              <p
                className="text-sm sm:text-base md:text-lg mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, color: '#1e1e1e', letterSpacing: '0.05em' }}
              >
                GRAND PRIZE POOL
              </p>

              {/* Prize Amount */}
              <div
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 whitespace-nowrap"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
              >
                1.2M NLE
              </div>

              {/* Subtext */}
              <p
                className="text-xs sm:text-sm md:text-base"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#1e1e1e', opacity: 0.9 }}
              >
                + Mentorship & Incubation Support
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Link */}
        <div className="mt-6">
          <Link
            href="/hackathon/terms"
            className="inline-block text-sm md:text-base text-[#1e1e1e] hover:text-[#403f3e] transition-colors duration-200 underline"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}
          >
            View Terms & Conditions
          </Link>
        </div>

      </div>
    </main>
  );
}
