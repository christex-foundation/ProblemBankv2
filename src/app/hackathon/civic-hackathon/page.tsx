'use client';
import { Navigation } from '@/components';
import CivicHero from '@/components/civic/CivicHero';
import AboutSection from '@/components/civic/AboutSection';
import SixPillarsSection from '@/components/civic/SixPillarsSection';
import SubmissionForm from '@/components/civic/SubmissionForm';

export default function CivicHackathonPage() {
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

      {/* Navigation */}
      <div className="relative z-50">
        <Navigation logoText="ProblemBank" />
      </div>

      {/* Hero Section */}
      <CivicHero />

      {/* Hidden SubmissionForm component - only provides modal functionality */}
      <SubmissionForm />

      {/* About Section */}
      <AboutSection />

      {/* Six Pillars Section */}
      <SixPillarsSection />
    </div>
  );
}
