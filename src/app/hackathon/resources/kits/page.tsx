'use client';

import React, { useState } from 'react';
import BrandingKitModal from '@/components/BrandingKitModal';
import PRDKitModal from '@/components/PRDKitModal';
import PitchMasterKitModal from '@/components/PitchMasterKitModal';
import TechStackChecklistModal from '@/components/TechStackChecklistModal';
import SocialMediaContentModal from '@/components/SocialMediaContentModal';
import ResearchValidationModal from '@/components/ResearchValidationModal';
import Navigation from '@/components/Navigation';
import ResourcesSubnav from '@/components/ResourcesSubnav';
import { kits, slugifyTitle } from '@/lib/kits';

// Featured card background/rotation utilities (same behavior as ideas listing page)
function getBackgroundForGlobalIndex(index1Based: number): string {
  const LIGHT = '#fffaf3';
  const DARK = '#f2e8dc';
  const block = Math.floor((index1Based - 1) / 4);
  const startIsLight = block % 2 === 0;
  const pos = (index1Based - 1) % 4;
  const isLight = startIsLight ? (pos % 2 === 0) : (pos % 2 === 1);
  return isLight ? LIGHT : DARK;
}

function getRotationAngleForGlobalIndex(index1Based: number): number {
  const baseAngles = [-2, 1.4, -1.2, 1.8];
  const pos = (index1Based - 1) % 4;
  const block = Math.floor((index1Based - 1) / 4);
  const angle = baseAngles[pos];
  return block % 2 === 0 ? angle : -angle;
}

export default function ResourcesKitsPage() {
  // Modal states
  const [openBranding, setOpenBranding] = useState(false);
  const [openUIProto, setOpenUIProto] = useState(false);
  const [openPitchMaster, setOpenPitchMaster] = useState(false);
  const [openTechStack, setOpenTechStack] = useState(false);
  const [openSocialMedia, setOpenSocialMedia] = useState(false);
  const [openResearchValidation, setOpenResearchValidation] = useState(false);

  const onStartBuilding = (kitTitle: string) => {
    if (kitTitle === 'Design System Kit') {
      window.open('https://tweakcn.com/editor/theme', '_blank', 'noopener,noreferrer');
      return;
    }
    if (kitTitle === 'PRD Kit') {
      setOpenUIProto(true);
      return;
    }
    if (kitTitle === 'Pitch Master Kit') {
      setOpenPitchMaster(true);
      return;
    }
    if (kitTitle === 'COMPLETE BRANDING KIT') {
      setOpenBranding(true);
      return;
    }
    if (kitTitle === 'Tech Stack Checklist') {
      setOpenTechStack(true);
      return;
    }
    if (kitTitle === 'Social Media Content Generator') {
      setOpenSocialMedia(true);
      return;
    }
    if (kitTitle === 'Research & Validation Kit 🔬') {
      setOpenResearchValidation(true);
      return;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f2e9' }}>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-14 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
            style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
          >
            Builder&apos;s Kits
          </h1>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            Each kit provides step-by-step guidance and AI-powered tools to help you build professional assets quickly.
          </p>
        </div>

        {/* Subnav Toggle */}
        <ResourcesSubnav />

        {/* Kits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {kits.map((kit, idx) => (
            <div key={idx} className="block" id={slugifyTitle(kit.title)}>
              <div
                className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px] cursor-pointer"
                style={{
                  height: '460px',
                  backgroundColor: getBackgroundForGlobalIndex(idx + 1),
                  transform: `rotate(${getRotationAngleForGlobalIndex(idx + 1)}deg)`,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
                onClick={() => onStartBuilding(kit.title)}
              >
                <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                  <div>
                    <div>
                      <h3
                        className="text-2xl mb-3 text-center"
                        style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                      >
                        {kit.title}
                      </h3>
                    </div>
                    <div>
                      <div>
                        <p
                          className="text-sm leading-relaxed text-center"
                          style={{
                            fontFamily: 'Raleway, sans-serif',
                            color: '#403f3e',
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {kit.description}
                        </p>

                        {/* You'll create list */}
                        <div className="mt-3">
                          <div
                            className="text-center text-sm"
                            style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
                          >
                            YOU&apos;LL CREATE:
                          </div>
                          <ul className="mt-2 space-y-1">
                            {kit.items.map((it) => (
                              <li key={it}>
                                <div className="flex justify-center items-center gap-2">
                                  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                    <path d="M5 12l4 4 10-10" stroke="#403f3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span
                                    className="text-sm text-center"
                                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
                                  >
                                    {it}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                          {kit.moreLabel && (
                            <div
                              className="mt-2 text-center text-sm"
                              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
                            >
                              {kit.moreLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {/* Tags */}
                    {kit.tags && kit.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {kit.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full border text-xs"
                            style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: '#fffaf3' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                     <div className="mt-2">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           onStartBuilding(kit.title);
                         }}
                         className="group relative overflow-hidden w-full py-3 rounded-full bg-black text-white font-medium text-sm whitespace-nowrap transition-all duration-300 hover:scale-105"
                       >
                         <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)', backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }} />
                         <span className="relative z-10">Start Building <span aria-hidden style={{ marginLeft: 8 }}>→</span></span>
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {openBranding && (
        <BrandingKitModal
          isOpen={openBranding}
          problemText="Build a comprehensive brand identity"
          solutionText="Create professional branding assets using AI-powered tools and strategic guidance"
          defaultBusinessName=""
          onClose={() => setOpenBranding(false)}
        />
      )}
      {openUIProto && (
        <PRDKitModal
          isOpen={openUIProto}
          problemText=""
          solutionText=""
          technology=""
          onClose={() => setOpenUIProto(false)}
        />
      )}
      {openPitchMaster && (
        <PitchMasterKitModal
          isOpen={openPitchMaster}
          problemText=""
          solutionText=""
          allowEditing={true}
          onClose={() => setOpenPitchMaster(false)}
        />
      )}
      {openTechStack && (
        <TechStackChecklistModal
          onClose={() => setOpenTechStack(false)}
        />
      )}
      {openSocialMedia && (
        <SocialMediaContentModal
          onClose={() => setOpenSocialMedia(false)}
        />
      )}
      {openResearchValidation && (
        <ResearchValidationModal
          onClose={() => setOpenResearchValidation(false)}
        />
      )}
    </div>
  );
}
