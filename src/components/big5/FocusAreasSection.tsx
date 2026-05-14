'use client';
import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FocusAreasSection = memo(function FocusAreasSection() {
  const focusAreas = [
    {
      title: 'Feed Salone',
      description: 'Innovations in agriculture, food systems, and climate resilience to ensure food security',
      icon: '/images/6707c6af78a3dd5acec5512e_flower_64.webp',
      color: '#fffaf3',
      rotate: -2,
    },
    {
      title: 'Human Capital Development',
      description: 'Solutions for skills development, education, and capacity building',
      icon: '/images/6707c6b0778d2c6671252c5f_book_64.webp',
      color: '#f2e8dc',
      rotate: 1.5,
    },
    {
      title: 'Youth Employment Scheme',
      description: 'Job creation platforms, gig economy solutions, and entrepreneurship enablers',
      icon: '/images/6708d7e1e82809f4e18f8e05_flag_120.webp',
      color: '#fffaf3',
      rotate: -1.5,
    },
    {
      title: 'Public Service Transformation',
      description: 'Digital governance, service delivery, and public sector innovation',
      icon: '/images/6708d8d8f169898f7bd83ed0_heart_120.webp',
      color: '#f2e8dc',
      rotate: 2,
    },
    {
      title: 'Technology & Infrastructure',
      description: 'Blockchain transparency, AI efficiency, and digital infrastructure improvements',
      icon: '/images/6708d8d83911c95f3000bbfa_star_120.webp',
      color: '#fffaf3',
      rotate: -1.8,
    },
  ];

  return (
    <section className="relative z-30 w-full py-20 md:py-24 lg:py-32" style={{ backgroundColor: '#f9f2e9' }}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Heading */}
        <div className="relative flex flex-col items-center text-center select-none mb-16">
          <div className="text-5xl md:text-6xl lg:text-7xl uppercase leading-tight">
            <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e', display: 'block', transform: 'rotate(-1deg)' }}>
              THE BIG 5
            </span>
          </div>
          <div className="text-5xl md:text-6xl lg:text-7xl uppercase leading-tight mb-6">
            <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e', display: 'block', transform: 'rotate(0.5deg)' }}>
              GAME CHANGERS
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="text-center text-lg md:text-xl max-w-3xl mx-auto mb-16"
          style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#333', lineHeight: '1.6' }}
        >
          Choose one focus area and build a solution that addresses real challenges facing Sierra Leone.
          Explore problem statements in our ProblemBank.
        </p>

        {/* Focus Area Cards */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-16">
          {focusAreas.map((area) => (
            <div
              key={area.title}
              className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]"
              style={{
                backgroundColor: area.color,
                transform: `rotate(${area.rotate}deg)`,
                minHeight: '320px',
              }}
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

              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <Image
                    src={area.icon}
                    alt={`${area.title} icon`}
                    width={72}
                    height={72}
                    style={{ display: 'block' }}
                    loading="lazy"
                    quality={85}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-2xl md:text-3xl mb-4 text-center"
                  style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
                >
                  {area.title}
                </h3>

                {/* Description */}
                <p
                  className="text-base md:text-lg text-center"
                  style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#333', lineHeight: '1.6' }}
                >
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Ideas Page */}
        <div className="flex justify-center">
          <Link
            href="/hackathon/ideas"
            className="group relative overflow-hidden inline-block px-10 py-5 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] text-[#1e1e1e] font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            <div
              className="absolute inset-0 opacity-15 mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                backgroundSize: '200px 200px',
                backgroundRepeat: 'repeat'
              }}
            />
            <div className="absolute inset-0 bg-[#1e1e1e] transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#E6B800]">
              Explore Problem Statements →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
});

export default FocusAreasSection;
