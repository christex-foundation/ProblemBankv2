'use client';
import { memo } from 'react';
import Link from 'next/link';
import Big5SubmissionForm from './Big5SubmissionForm';

const ApplicationCTA = memo(function ApplicationCTA() {
  // Check if deadline has passed (Dec 13, 2025 at 12:00 UTC - Noon)
  const deadline = new Date('2025-12-13T12:00:00Z');
  const isBeforeDeadline = new Date() < deadline;

  // Don't render anything if deadline has passed
  if (!isBeforeDeadline) {
    return null;
  }

  return (
    <section className="relative z-30 w-full py-16 md:py-20 lg:py-24" style={{ backgroundColor: '#f9f2e9' }}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">

        {/* Main CTA Card */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative border border-[#e8ddd0] shadow-xl overflow-hidden rounded-[28px] md:rounded-[40px] bg-[#121212] p-8 md:p-12 text-center"
            style={{ transform: 'rotate(-1deg)' }}
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
              {/* Deadline Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#E6B800] px-4 py-2 mb-6 bg-[#E6B800]">
                <span
                  className="inline-block"
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#1e1e1e',
                    WebkitMaskImage: 'url(/images/calendar-blank.svg)',
                    maskImage: 'url(/images/calendar-blank.svg)',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
                <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, color: '#1e1e1e' }}>
                  Applications Open: 26 Nov – 6 Dec 2025
                </span>
              </div>

              {/* Title */}
              <h3
                className="text-3xl md:text-4xl lg:text-5xl mb-4"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3' }}
              >
                READY TO BUILD THE FUTURE?
              </h3>

              {/* Description */}
              <p
                className="text-base md:text-lg mb-8 max-w-2xl mx-auto"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#f7efe3' }}
              >
                Join Sierra Leone&apos;s most ambitious hackathon. Submit your application today and be part
                of the movement transforming our nation through AI and blockchain innovation.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Big5SubmissionForm />

                 <Link
                   href="/hackathon/ideas"
                   className="group relative overflow-hidden inline-block px-8 py-4 rounded-full border-2 border-[#f7efe3] text-[#f7efe3] font-medium text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                 >
                  <div
                    className="absolute inset-0 opacity-10 mix-blend-overlay"
                    style={{
                      backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                      backgroundSize: '200px 200px',
                      backgroundRepeat: 'repeat'
                    }}
                  />
                  <div className="absolute inset-0 bg-[#f7efe3] transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
                   <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1e1e1e]">
                     Browse Ideas
                   </span>
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ApplicationCTA;
