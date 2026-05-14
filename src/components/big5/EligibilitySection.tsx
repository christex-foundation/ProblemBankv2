'use client';
import { memo } from 'react';

const EligibilitySection = memo(function EligibilitySection() {
  const requirements = [
    {
      title: 'Age Requirement',
      description: 'Applicants must be between 18-35 years old',
      icon: '🎂',
      check: true,
    },
    {
      title: 'Citizenship',
      description: 'Must be a Sierra Leone citizen or legal resident',
      icon: '🇸🇱',
      check: true,
    },
    {
      title: 'Availability',
      description: 'Available for the complete program timeline (Sept - Dec 2025)',
      icon: '📅',
      check: true,
    },
    {
      title: 'Commitment',
      description: 'Able to attend 10-day bootcamp in Freetown and 48-hour final hackathon',
      icon: '💪',
      check: true,
    },
  ];

  const teamInfo = [
    {
      title: 'Team Size',
      description: 'Teams of up to 4 members are encouraged',
      icon: '👥',
    },
    {
      title: 'Solo Applications',
      description: 'Individual applications are also welcome',
      icon: '🙋',
    },
    {
      title: 'Interdisciplinary',
      description: 'Mix of developers, designers, and domain experts encouraged',
      icon: '🎨',
    },
    {
      title: 'Team Formation',
      description: 'Need teammates? Use our Find a Team feature',
      icon: '🔍',
    },
  ];

  return (
    <section className="relative z-40 w-full py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="bg-[#121212] overflow-hidden rounded-[28px] md:rounded-[40px] lg:rounded-[56px]">
          <div className="px-4 md:px-8 py-16 md:py-20 lg:py-24">
            {/* Heading */}
            <div className="relative flex flex-col items-center text-center select-none mb-12">
              <div className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                  ELIGIBILITY &
                </span>
              </div>
              <div className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none mb-6">
                <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(1.5deg)' }}>
                  REQUIREMENTS
                </span>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="mb-16">
              <h3
                className="text-2xl md:text-3xl text-center mb-8"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3' }}
              >
                You Must Meet All These Requirements:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                {requirements.map((req, idx) => (
                  <div
                    key={req.title}
                    className="relative border border-[#e8ddd0] shadow-sm overflow-hidden rounded-[28px] p-6 md:p-8"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#fffaf3' : '#f2e8dc',
                      transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
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

                    <div className="relative z-10 flex gap-4">
                      {/* Checkmark */}
                      <div className="flex-shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#E6B800' }}
                        >
                          <span style={{ color: '#1e1e1e', fontSize: '1.25rem', fontWeight: 700 }}>✓</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Icon and Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">{req.icon}</span>
                          <h4
                            className="text-xl md:text-2xl"
                            style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                          >
                            {req.title}
                          </h4>
                        </div>

                        {/* Description */}
                        <p
                          className="text-base md:text-lg"
                          style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
                        >
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Information */}
            <div>
              <h3
                className="text-2xl md:text-3xl text-center mb-8"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3' }}
              >
                Team Formation Guidelines:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {teamInfo.map((info, idx) => (
                  <div
                    key={info.title}
                    className="relative border border-[#e8ddd0] shadow-sm overflow-hidden rounded-[24px] p-6"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#f2e8dc' : '#fffaf3',
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

                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <div className="text-4xl mb-3">{info.icon}</div>

                      {/* Title */}
                      <h4
                        className="text-lg mb-2"
                        style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                      >
                        {info.title}
                      </h4>

                      {/* Description */}
                      <p
                        className="text-sm"
                        style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
                      >
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Find a Team CTA */}
            <div className="mt-12 flex justify-center">
              <a
                href="/hackathon/find-a-team"
                className="group relative overflow-hidden inline-block px-8 py-4 rounded-full border-2 border-[#f7efe3] text-[#f7efe3] font-medium text-lg transition-all duration-300 hover:scale-105"
              >
                <div
                  className="absolute inset-0 opacity-10 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                <div className="absolute inset-0 bg-[#E6B800] transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1e1e1e]">
                  Find Teammates →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default EligibilitySection;
