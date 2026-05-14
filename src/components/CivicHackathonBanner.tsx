'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function CivicHackathonBanner() {
  return (
    <div className="w-full bg-[#f9f2e9] py-4">
      <Link href="/hackathon/civic-hackathon" className="block max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative w-full bg-gradient-to-r from-[#513f2a] to-[#6b5538] rounded-[20px] py-4 px-6 md:px-8 overflow-hidden hover:from-[#5d4830] hover:to-[#76603f] transition-all duration-300">
          {/* Noise Texture Overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none rounded-[20px]"
            style={{
              backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
              backgroundSize: '200px 200px',
              backgroundRepeat: 'repeat',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Logo and Text */}
          <div className="flex items-center gap-4">
            <Image
              src="/images/Festival Logo.png"
              alt="Civic Festival Logo"
              width={50}
              height={50}
              className="rounded-full"
              loading="lazy"
              quality={85}
            />
            <div>
              <h3
                className="text-xl md:text-2xl font-bold"
                style={{ fontFamily: 'Decoy, sans-serif', color: '#ffffff' }}
              >
                CIVIC YOUTH INNOVATION HACKATHON
              </h3>
              <p
                className="text-sm md:text-base"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#f7efe3', fontWeight: 600 }}
              >
                National Civic Festival 2025 — Register Now!
              </p>
            </div>
          </div>

          {/* Right side - CTA Button */}
          <button className="group relative overflow-hidden px-6 py-3 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] text-[#1e1e1e] font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap">
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                backgroundSize: '200px 200px',
                backgroundRepeat: 'repeat',
              }}
            />
            <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
            <span
              className="relative z-10 transition-colors duration-300 group-hover:text-white"
              style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700 }}
            >
              Learn More →
            </span>
          </button>
        </div>
        </div>
      </Link>
    </div>
  );
}
