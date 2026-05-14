'use client';
import { Navigation } from '@/components';
import Big5Hero from '@/components/big5/Big5Hero';
import ReviewStage from '@/components/big5/ReviewStage';
import TrackOptionsSection from '@/components/big5/TrackOptionsSection';
import FocusAreasSection from '@/components/big5/FocusAreasSection';
import JudgingCriteria from '@/components/big5/JudgingCriteria';
import PrizesSection from '@/components/big5/PrizesSection';
import ApplicationCTA from '@/components/big5/ApplicationCTA';

export default function Big5Page() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f9f2e9]">
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-20"
        style={{
          backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Navigation - Higher z-index to ensure visibility */}
      <div className="relative z-50">
        <Navigation logoText="ProblemBank" />
      </div>

       {/* Review Stage - Shows during review period */}
       <ReviewStage />

      {/* Hero Section */}
      <Big5Hero />

       {/* Track Options Section */}
       <TrackOptionsSection />

       {/* Focus Areas Section */}
       <FocusAreasSection />

       {/* Judging Criteria Section */}
       <JudgingCriteria />

       {/* Prizes Section */}
       <PrizesSection />

       {/* Application CTA Section - Hidden */}
       {/* <ApplicationCTA /> */}
    </div>
  );
}
