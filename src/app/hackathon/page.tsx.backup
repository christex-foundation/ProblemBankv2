'use client';
import { Navigation } from '../components';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { kits as kitsData, slugifyTitle } from '../lib/kits';

type IdeaCard = { title: string; blurb: string; category?: string };

// Category → emoji path mapping (uses exact labels, fallback to coffee icon)
const CATEGORY_ICON_MAP: Record<string, string> = {
  'Feed Salone': '/images/6707c6af78a3dd5acec5512e_flower_64.webp',
  'Human Capital Development': '/images/6707c6b0778d2c6671252c5f_book_64.webp',
  'Youth Employment Scheme': '/images/6708d7e1e82809f4e18f8e05_flag_120.webp',
  'Public Service Architecture Revamp': '/images/6708d8d8f169898f7bd83ed0_heart_120.webp',
  'Tech and Infrastructure': '/images/6708d8d83911c95f3000bbfa_star_120.webp',
};
const FALLBACK_ICON = '/images/6708d8d8b17e6d52f343b0d3_coffee_120.webp';
function getCategoryIcon(label?: string): string {
  if (!label) return FALLBACK_ICON;
  const key = label.trim();
  return CATEGORY_ICON_MAP[key] || FALLBACK_ICON;
}

// Breakpoint-aware intensity: full on desktop, 40% under md (<= 767px), disabled under sm (<= 639px)
function useBreakpointIntensity() {
  const [intensity, setIntensity] = useState(1);
  useEffect(() => {
    const sm = window.matchMedia('(max-width: 639px)');
    const md = window.matchMedia('(max-width: 767px)');
    const update = () => {
      if (sm.matches) setIntensity(0);
      else if (md.matches) setIntensity(0.4);
      else setIntensity(1);
    };
    update();
    sm.addEventListener('change', update);
    md.addEventListener('change', update);
    return () => {
      sm.removeEventListener('change', update);
      md.removeEventListener('change', update);
    };
  }, []);
  return intensity;
}

export default function Home() {
  // Client-side fetch fallback: we won't call Airtable directly from the client because of secrets.
  // Instead, we attempt to read pre-fetched data via a harmless call (will be wired via API route soon),
  // and fallback to static placeholders for now.
  // Legacy init (removed)
  // const [ideas, setIdeas] = useState([
  const [ideas, setIdeas] = useState<IdeaCard[]>([
    { title: 'Idea Title A', blurb: 'A concise idea description will appear here.' },
    { title: 'Idea Title B', blurb: 'A concise idea description will appear here.' },
    { title: 'Idea Title C', blurb: 'A concise idea description will appear here.' },
    { title: 'Idea Title D', blurb: 'A concise idea description will appear here.' },
  ]);

  useEffect(() => {
    fetch('/api/ideas')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.items) && json.items.length > 0) {
          setIdeas((prev) => {
            const updated: IdeaCard[] = [];
            for (let i = 0; i < 4; i++) {
              const it = json.items[i];
              if (it) {
                updated.push({
                  title: it.title || prev[i]?.title || 'Untitled Idea',
                  blurb: it.blurb || prev[i]?.blurb || '',
                  category: typeof it.category === 'string' ? it.category : prev[i]?.category,
                });
              } else {
                updated.push(
                  prev[i] ?? {
                    title: `Idea Title ${String.fromCharCode(65 + i)}`,
                    blurb: 'A concise idea description will appear here.',
                    category: prev[i]?.category,
                  }
                );
              }
            }
            return updated;
          });
        }
      })
      .catch(() => {
        // silent fail, keep placeholders
      });
  }, []);
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f9f2e9]">
      {/* Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 opacity-30"
        style={{
          backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Shared Navigation */}
      <Navigation logoText="ProblemBank" />

      {/* Hero Section */}
      <main className="relative z-30 flex items-center justify-center min-h-screen px-4 md:px-8">
        <div className="text-center max-w-4xl mx-auto -mt-24">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-8xl leading-none tracking-tight text-[#1e1e1e] mb-6">
            <div 
              className="block"
              style={{ 
                fontFamily: 'Decoy, sans-serif', 
                fontWeight: 500,
                transform: 'rotate(-2.2deg)' 
              }}
            >
              FIND INSPO
            </div>
            <div 
              className="block"
              style={{ 
                fontFamily: 'Decoy, sans-serif', 
                fontWeight: 500,
                transform: 'rotate(-1.9deg)' 
              }}
            >
              FOR YOUR
            </div>
            <div 
              className="block"
              style={{ 
                fontFamily: 'Decoy, sans-serif', 
                fontWeight: 500,
                transform: 'rotate(1.1deg)' 
              }}
            >
              NEXT BUILD
            </div>
          </h1>
          
          {/* Subtitle */}
            <p 
              className="text-lg text-gray-600 mt-8 max-w-2xl"
              style={{ fontFamily: 'Raleway, sans-serif' }}
            >
              We&#39;ve collected 25+ ideas that are perfect for your hackathon project. Whether you&#39;re a beginner or a seasoned builder, there&#39;s something for everyone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center items-stretch w-full px-4 sm:px-0 sm:max-w-none mx-auto">
              {/* Explore Ideas Button */}
              <Link href="/ideas" className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-full bg-[#E6B800] text-white font-medium text-lg whitespace-nowrap transition-all duration-300 hover:scale-105">
                <div 
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Explore Ideas
                </span>
              </Link>

              {/* Random Ideas Button */}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/ideas?pageSize=50');
                    const data = await res.json();
                    const list = Array.isArray(data?.items) ? data.items : [];
                    if (list.length > 0) {
                      const random = list[Math.floor(Math.random() * list.length)];
                      const slug = slugifyTitle(random.title || '');
                      if (slug) {
                        window.location.href = `/ideas/${slug}`;
                        return;
                      }
                    }
                    window.location.href = '/ideas';
                  } catch {
                    window.location.href = '/ideas';
                  }
                }}
                className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border-2 border-gray-400 text-gray-700 font-medium text-lg whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                <div 
                  className="absolute inset-0 opacity-10 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Random Ideas
                </span>
              </button>
            </div>
          </div>
      </main>

      {/* Featured Ideas Section */}
      <section className="relative z-30 w-full">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-12 lg:py-14 pb-12 md:pb-16 lg:pb-20">
          {/* Headline */}
          <h2
            className="text-center uppercase tracking-tight text-5xl md:text-6xl lg:text-7xl -mt-20"
            style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
          >
            <div>Featured</div> <div>Ideas</div>
          </h2>

          {/* Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
            {ideas.map((item, idx) => (
              <div
                key={item.title}
                className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                style={{
                  height: '400px',
                  backgroundColor: idx % 2 === 0 ? '#fffaf3' : '#f2e8dc',
                  transform: `rotate(${[-2, 1.4, -1.2, 1.8][idx]}deg)`,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                {/* Speckled texture overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                  }}
                />
                {/* Card content */}
                <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                  {/* Top group: Pill above the title */}
                  <div>
                    {item.category && (
                      <div className="mb-2 flex justify-center">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                          style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: 'transparent' }}
                        >
                          {item.category}
                        </span>
                      </div>
                    )}
                    <h3
                      className="text-2xl mb-3 text-center"
                      style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom group: Emoji and subtext anchored to bottom */}
                  <div className="mt-auto">
                    <div className="flex justify-center mb-2">
                      <img
                        src={getCategoryIcon(item.category)}
                        alt={item.category ? `${item.category} icon` : 'Category icon'}
                        width={56}
                        height={56}
                        style={{ display: 'block' }}
                      />
                    </div>
                    <p
                      className="text-sm leading-relaxed text-center"
                      style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                    >
                      {item.blurb}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Innovation Launchpad (Parallax Section) */}
      <ParallaxLaunchpadSection />
      {/* Builder Kits Section */}
      <BuilderKitsSection />
      {/* Hackathon Announcement Section */}
      <HackathonAnnouncementSection />
    </div>
  );
}

function ParallaxLaunchpadSection() {
  const intensity = useBreakpointIntensity();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Helper to scale values by intensity
  const scale = (v: number) => v * intensity;

  // Heading line parallax (0.8x, 1.0x, 1.2x speeds)
  const y1 = useTransform(scrollYProgress, [0, 1], [0, scale(-40)]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, scale(-50)]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, scale(-60)]);

  const r1 = useTransform(scrollYProgress, [0, 1], [0, scale(-2)]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, scale(0)]);
  const r3 = useTransform(scrollYProgress, [0, 1], [0, scale(2)]);

  // Cards motion values
  const cardY = [
    useTransform(scrollYProgress, [0, 1], [0, scale(-24)]),
    useTransform(scrollYProgress, [0, 1], [0, scale(-30)]),
    useTransform(scrollYProgress, [0, 1], [0, scale(-36)]),
  ];
  const cardR = [
    useTransform(scrollYProgress, [0, 1], [0, scale(2)]),
    useTransform(scrollYProgress, [0, 1], [0, scale(-3)]),
    useTransform(scrollYProgress, [0, 1], [0, scale(2)]),
  ];
  const cardS = useTransform(scrollYProgress, [0, 1], [1, 1 + 0.03 * intensity]);

  const cards = [
    {
      title: 'Discover Vetted Ideas',
      blurb:
        'Browse our curated collection of 20+ project ideas with detailed PRDs and implementation guides.',
      icon: '/images/6708d8d83911c95f3000bbfa_star_120.webp',
      bg: '#f2e8dc',
      baseRotate: -2,
    },
    {
      title: 'Step-by-Step Builder Kits',
      blurb:
        'Follow our outcome-oriented kits with proven workflows to bring your projects to life efficiently.',
      icon: '/images/6708d8dfbf6d79d76ebd68eb_lightning_120.webp',
      bg: '#fffaf3',
      baseRotate: 1.4,
    },
    {
      title: 'Join Our Community',
      blurb:
        'Connect with fellow builders, participate in hackathons, and showcase your innovations.',
      icon: '/images/6707c6aff10ed02bb97c61f9_brilliant_64.webp',
      bg: '#f2e8dc',
      baseRotate: -1.2,
    },
  ] as const;

  return (
    <section className="relative z-40 w-full py-12 md:py-16 lg:py-20">
      <div className="mt-12 md:mt-16 lg:mt-20">
        <div ref={ref} className="bg-[#121212] overflow-hidden rounded-[28px] md:rounded-[40px] lg:rounded-[56px]">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-24 md:py-32">
            {/* Heading */}
            <div className="relative flex flex-col items-center text-center select-none">
              <motion.div style={{ y: y1, rotate: r1 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                  YOUR
                </span>
              </motion.div>
              <motion.div style={{ y: y2, rotate: r2 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(0.8deg)' }}>
                  INNOVATION
                </span>
              </motion.div>
              <motion.div style={{ y: y3, rotate: r3 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none mb-8 md:mb-12">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                  LAUNCHPAD
                </span>
              </motion.div>
            </div>

            {/* Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {cards.map((c, i) => (
                <div key={c.title} className="transform" style={{ transform: `rotate(${c.baseRotate}deg)` }}>
                  <motion.div
                    className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                    style={{
                      y: cardY[i],
                      rotate: cardR[i],
                      scale: cardS,
                      backgroundColor: c.bg,
                      height: '340px',
                      willChange: 'transform',
                    }}
                  >
                    {/* Speckled texture overlay */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    {/* Card content */}
                    <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                      <div className="text-center">
                        <h3
                          className="text-2xl mb-3"
                          style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                        >
                          {c.title}
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-center mb-2">
                          <img src={c.icon} alt="icon" width={56} height={56} style={{ display: 'block' }} />
                        </div>
                        <p
                          className="text-sm leading-relaxed text-center"
                          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                        >
                          {c.blurb}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderKitsSection() {
  const intensity = useBreakpointIntensity();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = (v: number) => v * intensity;
  const y1 = useTransform(scrollYProgress, [0, 1], [0, scale(-40)]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, scale(-50)]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, scale(-60)]);
  const r1 = useTransform(scrollYProgress, [0, 1], [0, scale(-2)]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, scale(0)]);
  const r3 = useTransform(scrollYProgress, [0, 1], [0, scale(2)]);
  const featuredKits = kitsData.slice(0, 4).map((k, i) => ({
    title: k.title,
    blurb: k.description,
    link: `/resources#${slugifyTitle(k.title)}`,
    baseRotate: [-2, 1.4, -1.2, 1.8][i % 4],
    bg: i % 2 === 0 ? '#fffaf3' : '#f2e8dc',
  }));

  return (
    <section className="relative z-30 w-full" style={{ backgroundColor: '#f9f2e9' }}>
      <div ref={ref} className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-20 lg:py-24">
        {/* Parallax Heading (3 lines) */}
        <div className="relative flex flex-col items-center text-center select-none">
          <motion.div style={{ y: y1, rotate: r1 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
            <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e', display: 'block', transform: 'rotate(-2deg)' }}>
              Build Smarter
            </span>
          </motion.div>
          <motion.div style={{ y: y2, rotate: r2 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
            <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e', display: 'block', transform: 'rotate(0.8deg)' }}>
              With our
            </span>
          </motion.div>
          <motion.div style={{ y: y3, rotate: r3 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none mb-6 md:mb-8">
            <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e', display: 'block', transform: 'rotate(-2deg)' }}>
              Builder Kits
            </span>
          </motion.div>
        </div>

        {/* Subheading split into two lines */}
        <p className="text-center text-base md:text-lg" style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}>
          <span className="block">Follow our outcome-oriented kits with step-by-step guidance</span>
          <span className="block">to bring your projects to life.</span>
        </p>

        {/* Cards Grid (derived from first four resources kits) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {featuredKits.map((k) => (
            <div
              key={k.title}
              className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
              style={{
                backgroundColor: k.bg,
                transform: `rotate(${k.baseRotate}deg)`,
                transformOrigin: 'center center',
                willChange: 'transform',
                height: '360px',
              }}
            >
              {/* Speckled texture overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                  backgroundSize: '200px 200px',
                  backgroundRepeat: 'repeat',
                }}
              />
              {/* Card content */}
              <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                {/* Title */}
                <h3 className="text-2xl mb-2 text-center" style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}>
                  {k.title}
                </h3>

                {/* Blurb */}
                <p className="text-sm leading-relaxed text-center" style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}>
                  {k.blurb}
                </p>

                {/* CTA */}
                <div className="mt-auto pt-4 flex justify-center">
                  <a href={k.link} className="group relative overflow-hidden px-6 py-3 rounded-full bg-black text-white font-medium text-sm whitespace-nowrap transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)', backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }} />
                    <span className="relative z-10">Explore Kit</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Discover All Button */}
        <div className="mt-12 flex justify-center">
          <a href="/resources" className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border-2 border-gray-400 text-gray-700 font-medium text-lg whitespace-nowrap transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)', backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }} />
            <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">DISCOVER ALL BUILDER KITS</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function HackathonAnnouncementSection() {
  const intensity = useBreakpointIntensity();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = (v: number) => v * intensity;

  const y1 = useTransform(scrollYProgress, [0, 1], [0, scale(-40)]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, scale(-50)]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, scale(-60)]);

  const r1 = useTransform(scrollYProgress, [0, 1], [0, scale(-2)]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, scale(0)]);
  const r3 = useTransform(scrollYProgress, [0, 1], [0, scale(2)]);

  // Countdown
  const [countdown, setCountdown] = useState<{ label: 'Starts in' | 'In Progress' | 'Completed'; days: number; hours: number; minutes: number; seconds: number }>({
    label: 'Starts in',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const START_DATE = new Date('2025-11-06T00:00:00Z'); // Sierra Leone (UTC+0)
    const END_DATE = new Date('2025-12-02T00:00:00Z'); // End date start-of-day
    
    const tick = () => {
      const now = new Date();
      let target = START_DATE;
      let label: 'Starts in' | 'In Progress' | 'Completed' = 'Starts in';

      if (now >= START_DATE && now < END_DATE) {
        target = END_DATE;
        label = 'In Progress';
      } else if (now >= END_DATE) {
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
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-40 w-full py-12 md:py-16 lg:py-20 col">
      <div className="-mt-4 md:-mt-8 lg:-mt-12">
        <div ref={ref} className="bg-[#121212] overflow-hidden rounded-[28px] md:rounded-[40px] lg:rounded-[56px]">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-20 lg:py-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Heading */}
            <div className="relative flex flex-col items-center text-center select-none md:mt-6">
              {(countdown.label === 'Starts in' || countdown.label === 'In Progress') && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#f7efe3] px-4 py-1 text-[#f7efe3]" aria-label="Upcoming Event">
                  <span
                    className="inline-block"
                    aria-hidden="true"
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#f7efe3',
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
                  <span style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>Upcoming Event</span>
                </div>
              )}
              <motion.div style={{ y: y1, rotate: r1 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                  BIG 5  A.I. &
                </span>
              </motion.div>
              <motion.div style={{ y: y2, rotate: r2 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(0.8deg)' }}>
                  BLOCKCHAIN
                </span>
              </motion.div>
              <motion.div style={{ y: y3, rotate: r3 }} className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none mb-8 md:mb-12">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                  HACKATHON
                </span>
              </motion.div>
              {/* Learn More CTA moved below to center across section */}
            </div>

            {/* Countdown Card */}
            <div className="relative justify-self-center md:justify-self-end" style={{ transform: 'rotate(1.4deg)' }}>
              <div className="w-[420px] md:w-[460px] border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px] bg-[#f2e8dc] p-6 md:p-8 text-center">
                {/* Subheading */}
                <p className="text-center text-base md:text-lg mb-2" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
                  Sierra Leone&#39;s Ministry of Communication is inviting young developers and innovators to the Big 5 Artificial Intelligence & Blockchain Hackathon 2025.
                </p>
                {/* Date */}
                <p className="mt-4 text-center text-sm md:text-base" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 900, fontSize: '28px' }}>
                  6 Nov – 2 Dec 2025
                </p>
                {/* Countdown */}
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-xs md:text-sm mb-2" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700 }}>
                    {countdown.label === 'Completed' ? 'Hackathon Completed' : countdown.label}
                  </span>
                  {countdown.label !== 'Completed' && (
                    <div className="flex gap-4 md:gap-6">
                      {(['Days', 'Hours', 'Minutes', 'Seconds'] as const).map((unit, i) => {
                        const value = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds][i];
                        return (
                          <div key={unit} className="text-center">
                            <div className="text-2xl md:text-3xl lg:text-4xl" style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}>
                              {String(value).padStart(2, '0')}
                            </div>
                            <div className="text-xs md:text-sm" style={{ fontFamily: 'Raleway, sans-serif', opacity: 0.8 }}>
                              {unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Learn More CTA centered across section */}
            <div className="md:col-span-2 mt-10 flex justify-center">
              <a
                href="https://mocti.gov.sl/ai-challenge/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden px-8 py-4 rounded-full bg-[#E6B800] text-white font-medium text-lg whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{ backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)', backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }}
                />
                <div className="absolute inset-0 bg-[#f7efe3] transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#403f3e]">Learn More →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
